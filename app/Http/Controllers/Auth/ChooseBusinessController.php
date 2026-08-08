<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChooseBusinessController extends Controller
{
    /**
     * Tampilkan halaman pilih paket & tipe bisnis.
     */
    public function show(): Response
    {
        // Jika user sudah punya tenant, redirect ke dashboard
        if (auth()->user()->tenant_id) {
            return Inertia::render('auth/choose-business', [
                'alreadySetup' => true,
                'plans'        => [],
            ]);
        }

        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price', 'max_users', 'max_products', 'features'])
            ->map(fn ($p) => [
                'id'           => $p->id,
                'name'         => $p->name,
                'slug'         => $p->slug,
                'price'        => (int) $p->price,
                'max_users'    => $p->max_users,
                'max_products' => $p->max_products,
                'features'     => $p->features ?? [],
            ]);

        return Inertia::render('auth/choose-business', [
            'plans' => $plans,
        ]);
    }

    /**
     * Simpan bisnis yang dipilih dan buat Tenant untuk user.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        // Jika user sudah punya tenant, langsung ke dashboard
        if ($user->tenant_id) {
            return to_route('dashboard');
        }

        $validated = $request->validate([
            'plan_slug'     => 'required|string|exists:subscription_plans,slug',
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|in:fnb,retail,services,fashion,general',
        ]);

        // Ambil plan yang dipilih
        $plan = SubscriptionPlan::where('slug', $validated['plan_slug'])->firstOrFail();

        // Generate unique slug untuk tenant
        $baseSlug = Str::slug($validated['business_name']) ?: 'bisnis';
        $slug     = $baseSlug;
        $counter  = 1;
        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        // Buat Tenant
        $tenant = Tenant::create([
            'name'          => $validated['business_name'],
            'slug'          => $slug,
            'business_type' => $validated['business_type'],
            'plan_id'       => $plan->id,
            'is_active'     => true,
        ]);

        // Hubungkan user ke tenant & beri role owner
        \App\Models\Role::firstOrCreate(['name' => 'owner']);
        $user->update(['tenant_id' => $tenant->id, 'is_active' => true]);
        $user->assignRole('owner');

        // Buat subscription aktif
        TenantSubscription::create([
            'tenant_id'   => $tenant->id,
            'plan_id'     => $plan->id,
            'status'      => 'active',
            'starts_at'   => now(),
            'ends_at'     => $plan->price > 0 ? now()->addMonth() : null,
            'amount_paid' => $plan->price,
        ]);

        // Buat metode pembayaran default
        PaymentMethod::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Tunai (Cash)',
            'is_active' => true,
        ]);

        return to_route('dashboard');
    }
}
