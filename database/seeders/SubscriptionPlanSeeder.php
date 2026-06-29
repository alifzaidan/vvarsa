<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'         => 'Free',
                'slug'         => 'free',
                'price'        => 0,
                'billing_cycle'=> 'monthly',
                'max_users'    => 1,
                'max_products' => 100,
                'features'     => [
                    'inventory',
                    'stock_in',
                    'stock_out',
                    'stock_opname',
                    'finance_daily',
                    'finance_monthly',
                    'events_view',
                    'community_read',
                    'community_join',
                    'suppliers_view',
                ],
                'is_active' => true,
            ],
            [
                'name'         => 'Pro',
                'slug'         => 'pro',
                'price'        => 149000,
                'billing_cycle'=> 'monthly',
                'max_users'    => 5,
                'max_products' => 1000,
                'features'     => [
                    'inventory',
                    'stock_in',
                    'stock_out',
                    'stock_opname',
                    'finance_daily',
                    'finance_monthly',
                    'finance_export',
                    'events_view',
                    'events_register',
                    'community_read',
                    'community_join',
                    'community_post',
                    'suppliers_view',
                    'tax_reports',
                    'tax_consultation',
                    'multi_user',
                    'export_pdf',
                ],
                'is_active' => true,
            ],
            [
                'name'         => 'Enterprise',
                'slug'         => 'enterprise',
                'price'        => 499000,
                'billing_cycle'=> 'monthly',
                'max_users'    => 99,
                'max_products' => 99999,
                'features'     => [
                    'inventory',
                    'stock_in',
                    'stock_out',
                    'stock_opname',
                    'finance_daily',
                    'finance_monthly',
                    'finance_export',
                    'events_view',
                    'events_register',
                    'events_organizer',
                    'community_read',
                    'community_join',
                    'community_post',
                    'suppliers_view',
                    'suppliers_add',
                    'tax_reports',
                    'tax_consultation',
                    'tax_priority',
                    'multi_user',
                    'export_pdf',
                    'api_access',
                    'dedicated_support',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
