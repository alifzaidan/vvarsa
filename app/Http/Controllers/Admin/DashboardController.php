<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\SubscriptionPlan;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->count();
        $totalUsers = User::count();
        $totalPlans = SubscriptionPlan::count();

        // Calculate estimated monthly revenue based on tenant subscription plans
        $monthlyRevenue = Tenant::where('is_active', true)
            ->with('plan')
            ->get()
            ->sum(function ($tenant) {
                return $tenant->plan ? $tenant->plan->price : 0;
            });

        $recentTenants = Tenant::with('plan')
            ->latest()
            ->take(5)
            ->get();

        $recentUsers = User::with('tenant')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_tenants'   => $totalTenants,
                'active_tenants'  => $activeTenants,
                'total_users'     => $totalUsers,
                'total_plans'     => $totalPlans,
                'monthly_revenue' => $monthlyRevenue,
            ],
            'recent_tenants' => $recentTenants,
            'recent_users'   => $recentUsers,
        ]);
    }
}
