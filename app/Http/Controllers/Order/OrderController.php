<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = Order::forTenant($tenant->id)
            ->with(['items.variant', 'user:id,name']);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($paymentStatus = $request->get('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        if ($from = $request->get('from')) {
            $query->whereDate('ordered_at', '>=', $from);
        }

        if ($to = $request->get('to')) {
            $query->whereDate('ordered_at', '<=', $to);
        }

        $orders = $query->latest('ordered_at')->paginate(20)->withQueryString();

        // Order Summary: total per varian dari order yang masih "processing" atau "pending"
        $summary = OrderItem::whereHas('order', function ($q) use ($tenant) {
                $q->forTenant($tenant->id)
                  ->whereNotIn('status', ['done', 'cancelled']);
            })
            ->select('variant_id', 'variant_name', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('variant_id', 'variant_name')
            ->orderByDesc('total_qty')
            ->get();

        return Inertia::render('orders/index', [
            'orders'   => $orders,
            'summary'  => $summary,
            'filters'  => $request->only(['status', 'payment_status', 'from', 'to']),
        ]);
    }

    public function create(): Response
    {
        $tenant = app('tenant');
        $variants = ProductVariant::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->with('recipe.ingredients')
            ->orderBy('name')
            ->get()
            ->map(function ($v) {
                $v->append(['hpp', 'margin', 'recipes']);
                return $v;
            });

        return Inertia::render('orders/create', [
            'variants' => $variants,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'notes'          => 'nullable|string',
            'payment_method' => 'nullable|string|in:cash,transfer,qris',
            'items'          => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.qty'        => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $tenant) {
            $orderNumber = Order::generateOrderNumber($tenant->id);
            $subtotal    = 0;

            // Compute subtotal from variant prices
            $itemsData = [];
            foreach ($validated['items'] as $item) {
                $variant = ProductVariant::with('recipe.ingredients')->findOrFail($item['variant_id']);
                abort_if($variant->tenant_id !== $tenant->id, 403);

                $lineTotal = (float) $variant->sell_price * $item['qty'];
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'variant_id'   => $variant->id,
                    'variant_name' => $variant->name,
                    'qty'          => $item['qty'],
                    'unit_price'   => $variant->sell_price,
                    'unit_hpp'     => $variant->hpp,
                    'total'        => $lineTotal,
                ];
            }

            $transactionId = null;
            if (!empty($validated['payment_method'])) {
                $transaction = Transaction::create([
                    'tenant_id'      => $tenant->id,
                    'type'           => 'income',
                    'category'       => 'sales',
                    'amount'         => $subtotal,
                    'description'    => "Penjualan Kasir POS order #{$orderNumber} - {$validated['customer_name']}",
                    'reference'      => $orderNumber,
                    'date'           => now()->toDateString(),
                    'payment_method' => $validated['payment_method'],
                    'user_id'        => auth()->id(),
                ]);
                $transactionId = $transaction->id;
            }

            $order = Order::create([
                'tenant_id'      => $tenant->id,
                'order_number'   => $orderNumber,
                'customer_name'  => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status'         => 'pending',
                'payment_status' => !empty($validated['payment_method']) ? 'paid' : 'unpaid',
                'payment_method' => $validated['payment_method'] ?? null,
                'subtotal'       => $subtotal,
                'discount'       => 0,
                'total'          => $subtotal,
                'notes'          => $validated['notes'] ?? null,
                'transaction_id' => $transactionId,
                'user_id'        => auth()->id(),
                'ordered_at'     => now(),
            ]);

            foreach ($itemsData as $item) {
                OrderItem::create(array_merge($item, ['order_id' => $order->id]));
            }
        });

        return redirect()->route('orders.index')
            ->with('success', 'Pesanan berhasil dibuat.');
    }

    public function show(Order $order): Response
    {
        $tenant = app('tenant');
        abort_if($order->tenant_id !== $tenant->id, 403);

        $order->load(['items.variant.recipe.ingredients.ingredient', 'user:id,name', 'transaction']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $tenant = app('tenant');
        abort_if($order->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,done,cancelled',
        ]);

        if ($order->isCancelled()) {
            return back()->withErrors(['status' => 'Pesanan sudah dibatalkan.']);
        }

        DB::transaction(function () use ($order, $validated, $tenant) {
            $order->update(['status' => $validated['status']]);

            // Deduct stock if transitioning to processing or done
            if (in_array($validated['status'], ['processing', 'done'])) {
                $this->deductStock($order, $tenant);
            }
        });

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    public function markPaid(Request $request, Order $order)
    {
        $tenant = app('tenant');
        abort_if($order->tenant_id !== $tenant->id, 403);

        if (!$order->canBePaid()) {
            return back()->withErrors(['payment' => 'Pesanan tidak dapat dibayar.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:cash,transfer,qris',
        ]);

        DB::transaction(function () use ($order, $validated, $tenant) {
            // 1. Buat transaksi income
            $transaction = Transaction::create([
                'tenant_id'      => $tenant->id,
                'type'           => 'income',
                'category'       => 'sales',
                'amount'         => $order->total,
                'description'    => "Penjualan order #{$order->order_number} - {$order->customer_name}",
                'reference'      => $order->order_number,
                'date'           => now()->toDateString(),
                'payment_method' => $validated['payment_method'],
                'user_id'        => auth()->id(),
            ]);

            // 2. Update order: lunas, set transaction_id, status done
            $order->update([
                'payment_status' => 'paid',
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $transaction->id,
                'status'         => 'done',
            ]);

            // 3. Kurangi stok bahan mentah berdasarkan BOM jika belum dikurangi
            $this->deductStock($order, $tenant);
        });

        return redirect()->route('orders.show', $order)
            ->with('success', 'Pesanan berhasil ditandai lunas.');
    }

    /**
     * Helper to deduct raw ingredients stock based on recipe formulas
     */
    private function deductStock(Order $order, $tenant): void
    {
        if ($order->stock_deducted) {
            return;
        }

        foreach ($order->items()->with('variant.recipe.ingredients.ingredient')->get() as $item) {
            if (!$item->variant) continue;

            foreach ($item->variant->recipes as $recipe) {
                if (!$recipe->ingredient_id) continue;

                $product = Product::where('id', $recipe->ingredient_id)
                    ->where('tenant_id', $tenant->id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) continue;

                $consumedQty = (float) $recipe->qty * $item->qty;
                $qtyBefore   = $product->current_stock;
                $qtyAfter    = max(0, $qtyBefore - $consumedQty);

                StockMovement::create([
                    'tenant_id'     => $tenant->id,
                    'product_id'    => $product->id,
                    'type'          => 'out',
                    'qty'           => $consumedQty,
                    'qty_before'    => $qtyBefore,
                    'qty_after'     => $qtyAfter,
                    'reference'     => $order->order_number,
                    'note'          => "Penjualan: {$item->qty}× {$item->variant_name} (order #{$order->order_number})",
                    'user_id'       => auth()->id() ?? $order->user_id,
                    'movement_date' => now(),
                ]);

                $product->update(['current_stock' => $qtyAfter]);
            }
        }

        $order->update(['stock_deducted' => true]);
    }

    public function destroy(Order $order)
    {
        $tenant = app('tenant');
        abort_if($order->tenant_id !== $tenant->id, 403);

        if (!$order->canBeCancelled()) {
            return back()->withErrors(['order' => 'Pesanan yang sudah lunas tidak dapat dibatalkan.']);
        }

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }
}
