<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');
        $query = Product::where('tenant_id', $tenant->id)
            ->with('category:id,name');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($category = $request->get('category')) {
            $query->where('category_id', $category);
        }

        if ($request->get('low_stock')) {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        $products = $query->latest()->paginate(15)->withQueryString();
        $categories = ProductCategory::where('tenant_id', $tenant->id)->get(['id', 'name']);
        $lowStockList = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->with('category:id,name')
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->orderBy('current_stock')
            ->limit(5)
            ->get();

        return Inertia::render('inventory/index', [
            'products'     => $products,
            'categories'   => $categories,
            'filters'      => $request->only(['search', 'category', 'low_stock']),
            'low_stock_list' => $lowStockList,
            'total_count'  => Product::where('tenant_id', $tenant->id)->count(),
            'max_products' => $tenant->max_products,
        ]);
    }

    public function create(): Response
    {
        $tenant = app('tenant');
        $categories = ProductCategory::where('tenant_id', $tenant->id)->get(['id', 'name']);

        return Inertia::render('inventory/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        if (!$tenant->canAddProduct()) {
            return back()->withErrors(['limit' => "Batas maksimal produk ({$tenant->max_products}) sudah tercapai. Upgrade paket untuk menambah lebih banyak produk."]);
        }

        $validated = $request->validate([
            'sku'            => ['nullable', 'string', Rule::unique('products')->where('tenant_id', $tenant->id)],
            'name'           => 'required|string|max:255',
            'category_id'    => 'nullable|exists:product_categories,id',
            'unit'           => 'required|string|max:50',
            'min_stock'      => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_qty'   => 'required|numeric|min:0.001',
            'sell_price'     => 'nullable|numeric|min:0',
            'description'    => 'nullable|string',
        ]);

        $product = Product::create(array_merge($validated, [
            'tenant_id'     => $tenant->id,
            'current_stock' => 0,
            'sell_price'    => $validated['sell_price'] ?? 0,
        ]));

        return redirect()->route('inventory.index')
            ->with('success', "Produk \"{$product->name}\" berhasil ditambahkan.");
    }

    public function edit(Product $product): Response
    {
        $tenant = app('tenant');
        abort_if($product->tenant_id !== $tenant->id, 403);

        $categories = ProductCategory::where('tenant_id', $tenant->id)->get(['id', 'name']);

        return Inertia::render('inventory/edit', [
            'product'    => $product->load('category'),
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $tenant = app('tenant');
        abort_if($product->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'nullable|exists:product_categories,id',
            'unit'           => 'required|string|max:50',
            'min_stock'      => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_qty'   => 'required|numeric|min:0.001',
            'sell_price'     => 'nullable|numeric|min:0',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $product->update(array_merge($validated, [
            'sell_price' => $validated['sell_price'] ?? 0,
        ]));

        return redirect()->route('inventory.index')
            ->with('success', "Produk \"{$product->name}\" berhasil diperbarui.");
    }

    /**
     * Toggle status aktif / nonaktif produk
     */
    public function toggleActive(Product $product)
    {
        $tenant = app('tenant');
        abort_if($product->tenant_id !== $tenant->id, 403);

        $product->update(['is_active' => !$product->is_active]);

        $status = $product->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Produk \"{$product->name}\" berhasil {$status}.");
    }

    public function destroy(Product $product)
{
    $tenant = app('tenant');
    abort_if($product->tenant_id !== $tenant->id, 403);

    $name = $product->name;

    $product->delete();

    return back()->with('success', "Produk \"{$name}\" berhasil dihapus.");
}
}