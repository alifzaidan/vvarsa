<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function stockIn(): Response
    {
        $tenant = app('tenant');
        $products = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit', 'cost_price']);

        return Inertia::render('inventory/stock-in', [
            'products' => $products,
        ]);
    }

    public function processStockIn(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'qty'           => 'required|integer|min:1',
            'unit_cost'     => 'nullable|numeric|min:0',
            'reference'     => 'nullable|string|max:100',
            'note'          => 'nullable|string',
            'movement_date' => 'required|date',
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        DB::transaction(function () use ($product, $validated, $tenant) {
            $qtyBefore = $product->current_stock;
            $qtyAfter  = $qtyBefore + $validated['qty'];

            StockMovement::create([
                'tenant_id'     => $tenant->id,
                'product_id'    => $product->id,
                'type'          => 'in',
                'qty'           => $validated['qty'],
                'qty_before'    => $qtyBefore,
                'qty_after'     => $qtyAfter,
                'unit_cost'     => $validated['unit_cost'] ?? $product->cost_price,
                'reference'     => $validated['reference'] ?? null,
                'note'          => $validated['note'] ?? null,
                'user_id'       => auth()->id(),
                'movement_date' => $validated['movement_date'],
            ]);

            $product->update(['current_stock' => $qtyAfter]);
        });

        return redirect()->route('inventory.index')
            ->with('success', "Stok masuk berhasil dicatat. Stok {$product->name} bertambah {$validated['qty']} {$product->unit}.");
    }

    public function stockOut(): Response
    {
        $tenant = app('tenant');
        $products = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->where('current_stock', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit']);

        return Inertia::render('inventory/stock-out', [
            'products' => $products,
        ]);
    }

    public function processStockOut(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'qty'           => 'required|integer|min:1',
            'reference'     => 'nullable|string|max:100',
            'note'          => 'nullable|string',
            'movement_date' => 'required|date',
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        if ($product->current_stock < $validated['qty']) {
            return back()->withErrors(['qty' => "Stok tidak mencukupi. Stok {$product->name} saat ini: {$product->current_stock} {$product->unit}."]);
        }

        DB::transaction(function () use ($product, $validated, $tenant) {
            $qtyBefore = $product->current_stock;
            $qtyAfter  = $qtyBefore - $validated['qty'];

            StockMovement::create([
                'tenant_id'     => $tenant->id,
                'product_id'    => $product->id,
                'type'          => 'out',
                'qty'           => $validated['qty'],
                'qty_before'    => $qtyBefore,
                'qty_after'     => $qtyAfter,
                'reference'     => $validated['reference'] ?? null,
                'note'          => $validated['note'] ?? null,
                'user_id'       => auth()->id(),
                'movement_date' => $validated['movement_date'],
            ]);

            $product->update(['current_stock' => $qtyAfter]);
        });

        return redirect()->route('inventory.index')
            ->with('success', "Stok keluar berhasil dicatat. Stok {$product->name} berkurang {$validated['qty']} {$product->unit}.");
    }

    public function opname(): Response
    {
        $tenant = app('tenant');
        $products = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->with('category:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'current_stock', 'unit', 'category_id']);

        return Inertia::render('inventory/opname', [
            'products' => $products,
        ]);
    }

    public function processOpname(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|exists:products,id',
            'items.*.actual_stock' => 'required|integer|min:0',
            'items.*.note'         => 'nullable|string',
            'opname_date'          => 'required|date',
        ]);

        DB::transaction(function () use ($validated, $tenant) {
            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('tenant_id', $tenant->id)
                    ->first();

                if (!$product) continue;

                $qtyBefore  = $product->current_stock;
                $qtyAfter   = $item['actual_stock'];
                $difference = $qtyAfter - $qtyBefore;

                if ($difference === 0) continue;

                StockMovement::create([
                    'tenant_id'     => $tenant->id,
                    'product_id'    => $product->id,
                    'type'          => 'opname',
                    'qty'           => abs($difference),
                    'qty_before'    => $qtyBefore,
                    'qty_after'     => $qtyAfter,
                    'note'          => $item['note'] ?? 'Stok opname',
                    'user_id'       => auth()->id(),
                    'movement_date' => $validated['opname_date'],
                ]);

                $product->update(['current_stock' => $qtyAfter]);
            }
        });

        return redirect()->route('inventory.index')->with('success', 'Stok opname berhasil disimpan.');
    }

    public function history(Request $request): Response
    {
        $tenant = app('tenant');

        $query = StockMovement::where('tenant_id', $tenant->id)
            ->with(['product:id,name,unit', 'user:id,name']);

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($product = $request->get('product')) {
            $query->where('product_id', $product);
        }

        $movements = $query->latest('movement_date')->paginate(20)->withQueryString();
        $products = Product::where('tenant_id', $tenant->id)->get(['id', 'name']);

        return Inertia::render('inventory/history', [
            'movements' => $movements,
            'products'  => $products,
            'filters'   => $request->only(['type', 'product']),
        ]);
    }
}
