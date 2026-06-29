<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
}
