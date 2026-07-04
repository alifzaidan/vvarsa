<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::latest()->get();
        return Inertia::render('admin/supplier/index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/supplier/create');
    }

    public function store(Request $request)
    {
        // Lakukan validasi
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'business_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Simpan data
        Supplier::create($validated);

        // Redirect kembali ke index dengan pesan sukses
        return redirect()->route('admin.supplier.index')->with('success', 'Supplier berhasil ditambahkan.');
    }
    public function edit(Supplier $supplier)
    {
        return Inertia::render('admin/supplier/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        // Lakukan validasi
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'business_type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Update data
        $supplier->update($validated);

        // Redirect kembali ke index dengan pesan sukses
        return redirect()->route('admin.supplier.index')->with('success', 'Supplier berhasil diupdate.');
    }
    public function destroy(Supplier $supplier)
{
    $supplier->delete();

    return redirect()->route('admin.supplier.index')->with('success', 'Supplier berhasil dihapus.');
}
}
