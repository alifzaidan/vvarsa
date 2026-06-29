<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = Package::where('tenant_id', $tenant->id)->with('variants');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $packages = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('packages/index', [
            'packages' => $packages,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $tenant = app('tenant');
        
        // Load all 1 pcs variants to let the user select which ones are allowed
        $variants = ProductVariant::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->where('recipe_qty', 1.000)
            ->orderBy('name')
            ->get();

        return Inertia::render('packages/create', [
            'variants' => $variants,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'capacity'    => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'is_active'   => 'required|boolean',
            'description' => 'nullable|string',
            'variant_ids' => 'nullable|array',
            'variant_ids.*' => 'exists:product_variants,id',
        ]);

        $package = Package::create([
            'tenant_id'   => $tenant->id,
            'name'        => $validated['name'],
            'capacity'    => $validated['capacity'],
            'price'       => $validated['price'],
            'is_active'   => $validated['is_active'],
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['variant_ids'])) {
            $package->variants()->sync($validated['variant_ids']);
        }

        return redirect()->route('packages.index')
            ->with('success', 'Paket produk berhasil dibuat.');
    }

    public function edit(Package $package): Response
    {
        $tenant = app('tenant');
        abort_if($package->tenant_id !== $tenant->id, 403);

        $package->load('variants');

        // Load all 1 pcs variants to let the user select which ones are allowed
        $variants = ProductVariant::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->where('recipe_qty', 1.000)
            ->orderBy('name')
            ->get();

        return Inertia::render('packages/edit', [
            'package'  => $package,
            'variants' => $variants,
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $tenant = app('tenant');
        abort_if($package->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'capacity'    => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'is_active'   => 'required|boolean',
            'description' => 'nullable|string',
            'variant_ids' => 'nullable|array',
            'variant_ids.*' => 'exists:product_variants,id',
        ]);

        $package->update([
            'name'        => $validated['name'],
            'capacity'    => $validated['capacity'],
            'price'       => $validated['price'],
            'is_active'   => $validated['is_active'],
            'description' => $validated['description'] ?? null,
        ]);

        $package->variants()->sync($validated['variant_ids'] ?? []);

        return redirect()->route('packages.index')
            ->with('success', 'Paket produk berhasil diperbarui.');
    }

    public function destroy(Package $package)
    {
        $tenant = app('tenant');
        abort_if($package->tenant_id !== $tenant->id, 403);

        $package->delete();

        return redirect()->route('packages.index')
            ->with('success', 'Paket produk berhasil dihapus.');
    }
}
