<?php

use App\Models\User;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\Role;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $plan = SubscriptionPlan::create([
        'name' => 'Pro',
        'slug' => 'pro',
        'price' => 100000,
        'billing_cycle' => 'monthly',
        'max_users' => 5,
        'max_products' => 100,
        'features' => ['inventory'],
    ]);

    $tenant = Tenant::create([
        'name' => 'Test Business',
        'slug' => 'test-business',
        'plan_id' => $plan->id,
    ]);

    TenantSubscription::create([
        'tenant_id' => $tenant->id,
        'plan_id' => $plan->id,
        'status' => 'active',
        'starts_at' => now(),
    ]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
    ]);

    $ownerRole = Role::firstOrCreate(['name' => 'owner']);
    $user->assignRole($ownerRole);

    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
});