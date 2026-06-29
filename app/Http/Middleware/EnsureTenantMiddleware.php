<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantMiddleware
{
    /**
     * Inject tenant context into the request for tenant-scoped routes.
     * Platform admins (role: admin) skip this middleware — they have no tenant.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Platform admin tidak butuh tenant context
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if (!$user->tenant_id) {
            abort(403, 'Akun Anda belum terhubung ke bisnis manapun.');
        }

        // Load tenant dengan plan dan subscription aktif
        $tenant = $user->tenant()->with(['plan', 'activeSubscription'])->first();

        if (!$tenant || !$tenant->is_active) {
            abort(403, 'Akun bisnis Anda tidak aktif. Hubungi administrator.');
        }

        // Inject tenant ke service container agar accessible di controllers
        app()->instance('tenant', $tenant);

        // Share tenant data ke Inertia (max_products/max_users dari plan)
        inertia()->share([
            'tenant' => [
                'id'            => $tenant->id,
                'name'          => $tenant->name,
                'business_type' => $tenant->business_type,
                'plan'          => $tenant->plan ? [
                    'name'         => $tenant->plan->name,
                    'slug'         => $tenant->plan->slug,
                    'features'     => $tenant->plan->features,
                    'max_products' => $tenant->plan->max_products,
                    'max_users'    => $tenant->plan->max_users,
                ] : null,
            ],
        ]);

        return $next($request);
    }
}
