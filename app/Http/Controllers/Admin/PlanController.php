<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = SubscriptionPlan::withCount('tenants')->latest()->get();

        return Inertia::render('admin/plans/index', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:subscription_plans,name',
            'price'         => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'max_users'     => 'required|integer|min:1',
            'max_products'  => 'required|integer|min:1',
            'features'      => 'nullable|array',
            'is_active'     => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['features'] = $validated['features'] ?? [];

        SubscriptionPlan::create($validated);

        return redirect()->route('admin.plans.index')->with('success', 'Paket langganan berhasil dibuat.');
    }

    public function update(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:subscription_plans,name,' . $plan->id,
            'price'         => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'max_users'     => 'required|integer|min:1',
            'max_products'  => 'required|integer|min:1',
            'features'      => 'nullable|array',
            'is_active'     => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['features'] = $validated['features'] ?? [];

        $plan->update($validated);

        return redirect()->route('admin.plans.index')->with('success', 'Paket langganan berhasil diupdate.');
    }

    public function destroy(SubscriptionPlan $plan)
    {
        if ($plan->tenants()->exists()) {
            return back()->with('error', 'Paket ini sedang digunakan oleh tenant dan tidak bisa dihapus. Silakan nonaktifkan saja.');
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Paket langganan berhasil dihapus.');
    }
}
