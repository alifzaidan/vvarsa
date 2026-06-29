<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SubscriptionPlanSeeder::class,  // Must run first (tenants depend on it)
            PermissionSeeder::class,         // Roles & permissions (before users)
            TenantDemoSeeder::class,         // Creates tenant + users + products + transactions
            EventSeeder::class,              // Global events
            SupplierSeeder::class,           // Global suppliers
            CommunitySeeder::class,          // Community posts (depends on user)
        ]);
    }
}
