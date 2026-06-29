<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Daftar Permissions ──────────────────────────────────────────────
        $permissions = [
            // Platform Admin (tidak butuh tenant context)
            'admin.dashboard',
            'admin.tenants.view',
            'admin.tenants.manage',
            'admin.users.view',
            'admin.plans.manage',

            // Inventory
            'inventory.products.view',
            'inventory.products.manage',   // create, edit, delete
            'inventory.stock.manage',      // stock-in, stock-out, opname

            // Finance
            'finance.view',
            'finance.transactions.manage',

            // Events
            'events.view',
            'events.register',

            // Community
            'community.view',
            'community.post',
            'community.reply',

            // Supplier
            'suppliers.view',

            // Tax
            'tax.view',                    // laporan pajak
            'tax.consultation',            // konsultasi (lebih publik)

            // Tenant Owner
            'subscription.manage',         // upgrade/downgrade plan
            'tenant.members.manage',       // undang, hapus staff
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ── Roles & Permissions ─────────────────────────────────────────────

        // ADMIN — pemilik platform, tidak butuh tenant context
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions([
            'admin.dashboard',
            'admin.tenants.view',
            'admin.tenants.manage',
            'admin.users.view',
            'admin.plans.manage',
        ]);

        // OWNER — pemilik bisnis (dalam tenant)
        $owner = Role::firstOrCreate(['name' => 'owner']);
        $owner->syncPermissions([
            'inventory.products.view',
            'inventory.products.manage',
            'inventory.stock.manage',
            'finance.view',
            'finance.transactions.manage',
            'events.view',
            'events.register',
            'community.view',
            'community.post',
            'community.reply',
            'suppliers.view',
            'tax.view',
            'tax.consultation',
            'subscription.manage',
            'tenant.members.manage',
        ]);

        // STAFF — karyawan (dalam tenant)
        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->syncPermissions([
            'inventory.products.view',     // lihat daftar produk (untuk pilih di stok)
            'inventory.stock.manage',
            'events.view',
            'events.register',
            'community.view',
            'community.reply',
            'suppliers.view',
            'tax.consultation',
        ]);
    }
}
