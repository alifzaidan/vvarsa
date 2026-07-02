<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse; 

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = Supplier::where('is_active', true)
            ->where(function ($q) use ($tenant) {
                $q->whereNull('tenant_id')
                  ->orWhere('tenant_id', $tenant->id);
            });

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($businessType = $request->get('business_type')) {
            $query->where(function ($q) use ($businessType) {
                $q->where('business_type', $businessType)->orWhereNull('business_type');
            });
        }

        if ($city = $request->get('city')) {
            $query->where('city', $city);
        }

        $suppliers = $query->orderByDesc('is_verified')
            ->orderByDesc('rating')
            ->paginate(12)
            ->withQueryString();

        $cities = Supplier::distinct()->whereNotNull('city')->pluck('city')->values();

        return Inertia::render('suppliers/index', [
            'suppliers'     => $suppliers,
            'cities'        => $cities,
            'filters'       => $request->only(['search', 'business_type', 'city']),
            'business_type' => $tenant->business_type,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('suppliers/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'contact_name'       => 'nullable|string|max:255',
            'phone'              => 'nullable|string|max:20',
            'email'              => 'nullable|email|max:255',
            'website'            => 'nullable|url|max:255',
            'address'            => 'nullable|string',
            'city'               => 'nullable|string|max:100',
            'business_type'      => 'nullable|string|in:fnb,retail,fashion',
            'product_categories' => 'nullable|array',
            'description'        => 'nullable|string',
        ]);

        $validated['tenant_id']   = $tenant->id;
        $validated['is_active']   = true;
        $validated['is_verified'] = false; 
        $validated['rating']      = 0.0;
        $validated['review_count']= 0;

        Supplier::create($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function edit(Supplier $supplier): Response
    {
        $tenant = app('tenant');

        // Proteksi: Pastikan tenant hanya bisa mengedit supplier miliknya sendiri
        if ($supplier->tenant_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit supplier ini.');
        }

        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier
        ]);
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $tenant = app('tenant');

        // Proteksi: Pastikan tenant hanya bisa mengupdate supplier miliknya sendiri
        if ($supplier->tenant_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengubah supplier ini.');
        }

        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'contact_name'       => 'nullable|string|max:255',
            'phone'              => 'nullable|string|max:20',
            'email'              => 'nullable|email|max:255',
            'website'            => 'nullable|url|max:255',
            'address'            => 'nullable|string',
            'city'               => 'nullable|string|max:100',
            'business_type'      => 'nullable|string|in:fnb,retail,fashion',
            'product_categories' => 'nullable|array',
            'description'        => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier berhasil diperbarui.');
    }
}