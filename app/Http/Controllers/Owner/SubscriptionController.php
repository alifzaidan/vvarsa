<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $tenant = app('tenant');
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return Inertia::render('owner/subscription/index', [
            'plans'          => $plans,
            'current_plan'   => $tenant->plan,
            'subscription'   => $tenant->activeSubscription,
            'product_count'  => $tenant->products()->count(),
            'user_count'     => $tenant->users()->count(),
        ]);
    }

    public function upgrade(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $tenant = app('tenant');
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        // Prevent downgrade to free if they exceed limits
        if ($plan->max_products < $tenant->products()->count()) {
            return back()->with('error', "Gagal mengubah paket: Jumlah produk Anda ({$tenant->products()->count()}) melebihi kapasitas paket {$plan->name} ({$plan->max_products}).");
        }

        if ($plan->max_users < $tenant->users()->count()) {
            return back()->with('error', "Gagal mengubah paket: Jumlah pengguna Anda ({$tenant->users()->count()}) melebihi kapasitas paket {$plan->name} ({$plan->max_users}).");
        }

        $tenant->update([
            'plan_id' => $plan->id,
        ]);

        return back()->with('success', "Paket berhasil diubah menjadi {$plan->name}.");
    }
}
