<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductVariantController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = ProductVariant::where('tenant_id', $tenant->id)
            ->with('recipe.ingredients.ingredient:id,name,unit,cost_price');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $variants = $query->latest()->paginate(15)->withQueryString();

        // Append computed attributes to each variant
        $variants->through(function ($variant) {
            $variant->append(['hpp', 'margin', 'profit', 'recipes']);
            return $variant;
        });

        return Inertia::render('variants/index', [
            'variants' => $variants,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $tenant = app('tenant');
        $recipes = Recipe::where('tenant_id', $tenant->id)
            ->with('ingredients')
            ->orderBy('name')
            ->get()
            ->map(function ($r) {
                $r->append('hpp');
                return $r;
            });

        return Inertia::render('variants/create', [
            'recipes' => $recipes,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sku'         => ['nullable', 'string', 'max:100', Rule::unique('product_variants')->where('tenant_id', $tenant->id)],
            'sell_price'  => 'required|numeric|min:0',
            'recipe_id'   => 'nullable|exists:recipes,id',
            'recipe_qty'  => 'required|numeric|min:0.001',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        ProductVariant::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
        ]));

        return redirect()->route('variants.index')
            ->with('success', "Varian \"{$validated['name']}\" berhasil ditambahkan.");
    }

    public function edit(ProductVariant $variant): Response
    {
        $tenant = app('tenant');
        abort_if($variant->tenant_id !== $tenant->id, 403);

        $variant->load('recipe.ingredients.ingredient:id,name,unit,cost_price');
        $variant->append(['hpp', 'margin']);

        $recipes = Recipe::where('tenant_id', $tenant->id)
            ->with('ingredients')
            ->orderBy('name')
            ->get()
            ->map(function ($r) {
                $r->append('hpp');
                return $r;
            });

        return Inertia::render('variants/edit', [
            'variant' => $variant,
            'recipes' => $recipes,
        ]);
    }

    public function update(Request $request, ProductVariant $variant)
    {
        $tenant = app('tenant');
        abort_if($variant->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sku'         => ['nullable', 'string', 'max:100', Rule::unique('product_variants')->ignore($variant->id)->where('tenant_id', $tenant->id)],
            'sell_price'  => 'required|numeric|min:0',
            'recipe_id'   => 'nullable|exists:recipes,id',
            'recipe_qty'  => 'required|numeric|min:0.001',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $variant->update($validated);

        return redirect()->route('variants.index')
            ->with('success', "Varian \"{$variant->name}\" berhasil diperbarui.");
    }

    public function destroy(ProductVariant $variant)
    {
        $tenant = app('tenant');
        abort_if($variant->tenant_id !== $tenant->id, 403);

        $variant->update(['is_active' => false]);

        return back()->with('success', 'Varian berhasil dinonaktifkan.');
    }
}
