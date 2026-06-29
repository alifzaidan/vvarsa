<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $planFilter = $request->input('plan_id');

        $tenants = Tenant::with(['plan', 'users'])
            ->withCount(['products', 'users'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->when($planFilter, function ($query, $planFilter) {
                $query->where('plan_id', $planFilter);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $plans = SubscriptionPlan::select('id', 'name')->get();

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
            'plans'   => $plans,
            'filters' => [
                'search'  => $search,
                'plan_id' => $planFilter,
            ],
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load(['plan', 'users' => function ($q) {
            $q->with('roles');
        }]);

        // Load stats
        $productCount = $tenant->products()->count();
        $userCount = $tenant->users()->count();
        $transactionCount = $tenant->transactions()->count();
        $totalSales = $tenant->transactions()->where('type', 'sale')->sum('amount');

        $plans = SubscriptionPlan::select('id', 'name')->get();

        return Inertia::render('admin/tenants/show', [
            'tenant' => array_merge($tenant->toArray(), [
                'max_products' => $tenant->max_products,
                'max_users'    => $tenant->max_users,
            ]),
            'stats' => [
                'product_count'     => $productCount,
                'user_count'        => $userCount,
                'transaction_count' => $transactionCount,
                'total_sales'       => $totalSales,
            ],
            'plans' => $plans,
        ]);
    }

    public function toggleActive(Tenant $tenant)
    {
        $tenant->is_active = !$tenant->is_active;
        $tenant->save();

        $status = $tenant->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Tenant {$tenant->name} berhasil {$status}.");
    }

    public function updatePlan(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $tenant->update($validated);

        return back()->with('success', "Paket langganan untuk {$tenant->name} berhasil diubah.");
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug,' . $tenant->id,
            'business_type' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'plan_id' => 'required|exists:subscription_plans,id',
            'is_active' => 'required|boolean',
        ]);

        $tenant->update($validated);

        return back()->with('success', "Data tenant {$tenant->name} berhasil diperbarui.");
    }
}
