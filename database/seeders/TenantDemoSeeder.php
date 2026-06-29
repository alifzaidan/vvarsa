<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Package;
use App\Models\ProductVariant;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\StockMovement;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\Transaction;
use App\Models\User;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantDemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Plans must exist ──────────────────────────────────────────────
        $freePlan = SubscriptionPlan::where('slug', 'free')->first();
        $proPlan  = SubscriptionPlan::where('slug', 'pro')->first();

        // ── 2. Platform Admin User (tidak terikat tenant) ────────────────────
        $adminUser = User::create([
            'name'      => 'Admin Vvarsa',
            'email'     => 'admin@gmail.com',
            'password'  => Hash::make('admin'),
            'tenant_id' => null,
            'is_active' => true,
        ]);
        $adminUser->assignRole('admin');

        // ── 3. Demo Tenant #1 — FnB (Free Plan) ─────────────────────────────
        $tenant1 = Tenant::create([
            'name'          => 'Mochi Delight',
            'slug'          => 'mochi-delight',
            'business_type' => 'fnb',
            'phone'         => '0812-1111-2222',
            'address'       => 'Jl. Kebon Jeruk No. 45, Jakarta Barat',
            'plan_id'       => $freePlan->id,
        ]);

        $owner1 = User::create([
            'name'      => 'Alif Zaidan',
            'email'     => 'alif@gmail.com',
            'password'  => Hash::make('password'),
            'tenant_id' => $tenant1->id,
            'is_active' => true,
        ]);
        $owner1->assignRole('owner');

        $staff1 = User::create([
            'name'      => 'Budi Santoso',
            'email'     => 'budi@gmail.com',
            'password'  => Hash::make('password'),
            'tenant_id' => $tenant1->id,
            'is_active' => true,
        ]);
        $staff1->assignRole('staff');

        TenantSubscription::create([
            'tenant_id'   => $tenant1->id,
            'plan_id'     => $freePlan->id,
            'status'      => 'active',
            'starts_at'   => now(),
            'ends_at'     => null,
            'amount_paid' => 0,
        ]);

        // ── 4. Demo Tenant #2 — Retail (Pro Plan) ────────────────────────────
        $tenant2 = Tenant::create([
            'name'          => 'Toko Elektronik Maju',
            'slug'          => 'toko-elektronik-maju',
            'business_type' => 'retail',
            'phone'         => '0821-3333-4444',
            'address'       => 'Jl. Raya Bogor No. 12, Depok',
            'plan_id'       => $proPlan?->id ?? $freePlan->id,
        ]);

        $owner2 = User::create([
            'name'      => 'Ahmad Fauzi',
            'email'     => 'ahmad@tokoelektronik.com',
            'password'  => Hash::make('password'),
            'tenant_id' => $tenant2->id,
            'is_active' => true,
        ]);
        $owner2->assignRole('owner');

        TenantSubscription::create([
            'tenant_id'   => $tenant2->id,
            'plan_id'     => $proPlan?->id ?? $freePlan->id,
            'status'      => 'active',
            'starts_at'   => now()->subDays(15),
            'ends_at'     => now()->addDays(15),
            'amount_paid' => $proPlan?->price ?? 0,
        ]);

        // ── 5. Seed Product Categories & Products for Tenant #1 ──────────────
        $this->seedTenant1Data($tenant1, $owner1);
    }

    private function seedTenant1Data(Tenant $tenant, User $owner): void
    {
        $categories = [];
        foreach (['Bahan Baku', 'Kemasan'] as $name) {
            $categories[$name] = ProductCategory::create([
                'tenant_id' => $tenant->id,
                'name'      => $name,
            ]);
        }

        $products = [
            // name, category, unit, stock, purchase_price, purchase_qty, sell_price
            ['Tepung Ketan',      'Bahan Baku', 'gram', 10000, 11300, 500,  0],
            ['Maizena',           'Bahan Baku', 'gram', 5000,  9600,  500,  0],
            ['Gula',              'Bahan Baku', 'gram', 10000, 17500, 1000, 0],
            ['Santan',            'Bahan Baku', 'gram', 2000,  4800,  65,   0],
            ['Pewarna',           'Bahan Baku', 'gram', 500,   5000,  30,   0],
            ['Strawberry',        'Bahan Baku', 'gram', 5000,  50000, 1000, 0],
            ['Coklat',            'Bahan Baku', 'gram', 10000, 41000, 1000, 0],
            ['Mika',              'Kemasan',    'set',  200,   7000,  10,   0],
            ['Cup Kertas',        'Kemasan',    'pcs',  2000,  17000, 1000, 0],
            ['Pasta Pandan',      'Bahan Baku', 'gram', 1000,  77000, 1000, 0],
            ['Oreo Crumb',        'Bahan Baku', 'gram', 5000,  83000, 1000, 0],
            ['Kacang Cincang',    'Bahan Baku', 'gram', 5000,  33500, 1000, 0],
            ['Whip Cream Powder', 'Bahan Baku', 'gram', 2000,  35000, 200,  0],
            ['Matcha Powder',     'Bahan Baku', 'gram', 1000,  97500, 100,  0],
        ];

        $productModels = [];
        $productLookup = [];
        foreach ($products as [$name, $cat, $unit, $stock, $pPrice, $pQty, $sell]) {
            $p = Product::create([
                'tenant_id'      => $tenant->id,
                'name'           => $name,
                'category_id'    => $categories[$cat]->id,
                'unit'           => $unit,
                'min_stock'      => 10,
                'current_stock'  => $stock,
                'purchase_price' => $pPrice,
                'purchase_qty'   => $pQty,
                'sell_price'     => $sell,
            ]);
            $productModels[] = $p;
            $productLookup[$name] = $p;
        }

        // Seed stock movements for all raw materials
        foreach ($productModels as $p) {
            StockMovement::create([
                'tenant_id'     => $tenant->id,
                'product_id'    => $p->id,
                'type'          => 'in',
                'qty'           => $p->current_stock,
                'qty_before'    => 0,
                'qty_after'     => $p->current_stock,
                'unit_cost'     => $p->cost_price,
                'note'          => 'Stok awal',
                'user_id'       => $owner->id,
                'movement_date' => now()->subDays(rand(1, 7)),
            ]);
        }

        // Define variants and recipes
        $variantsData = [
            'Strawberry Choco' => [
                'fillings' => [
                    'Strawberry' => 240.0,
                    'Coklat' => 84.0,
                ],
            ],
            'Strawberry Matcha' => [
                'fillings' => [
                    'Strawberry' => 240.0,
                    'Whip Cream Powder' => 10.0,
                    'Matcha Powder' => 10.0,
                ],
            ],
            'Oreo Choco' => [
                'fillings' => [
                    'Oreo Crumb' => 60.0,
                    'Coklat' => 84.0,
                ],
            ],
            'Oreo Krim' => [
                'fillings' => [
                    'Oreo Crumb' => 60.0,
                    'Whip Cream Powder' => 10.0,
                ],
            ],
            'Oreo Matcha' => [
                'fillings' => [
                    'Oreo Crumb' => 60.0,
                    'Whip Cream Powder' => 10.0,
                    'Matcha Powder' => 10.0,
                ],
            ],
            'Kacang Pandan' => [
                'fillings' => [
                    'Kacang Cincang' => 60.0,
                    'Pasta Pandan' => 84.0,
                ],
            ],
        ];

        // Base recipe per 1 batch (12 mochi)
        $baseRecipe = [
            'Tepung Ketan' => 150.0,
            'Maizena'      => 30.0,
            'Gula'         => 30.0,
            'Santan'       => 65.0,
            'Pewarna'      => 0.2,
            'Mika'         => 12.0,
            'Cup Kertas'   => 12.0,
        ];

        foreach ($variantsData as $flavor => $data) {
            // 1. Create a standalone Recipe for the flavor (representing 1 adonan recipe of 12 pcs)
            $recipe = Recipe::create([
                'tenant_id'   => $tenant->id,
                'name'        => "Resep Mochi {$flavor}",
                'description' => "Formula dasar untuk mochi rasa {$flavor}",
                'portion_qty' => 12.000,
            ]);

            // Add base ingredients to the recipe
            foreach ($baseRecipe as $ingName => $baseQty) {
                $ingProduct = $productLookup[$ingName];
                RecipeIngredient::create([
                    'recipe_id'       => $recipe->id,
                    'ingredient_id'    => $ingProduct->id,
                    'ingredient_name'  => $ingProduct->name,
                    'qty'              => $baseQty,
                    'unit'             => $ingProduct->unit,
                    'ingredient_cost'  => $ingProduct->cost_price,
                ]);
            }

            // Add filling ingredients to the recipe
            foreach ($data['fillings'] as $ingName => $baseQty) {
                $ingProduct = $productLookup[$ingName];
                RecipeIngredient::create([
                    'recipe_id'       => $recipe->id,
                    'ingredient_id'    => $ingProduct->id,
                    'ingredient_name'  => $ingProduct->name,
                    'qty'              => $baseQty,
                    'unit'             => $ingProduct->unit,
                    'ingredient_cost'  => $ingProduct->cost_price,
                ]);
            }

            // 2. Create only the base variant pointing to this recipe (1 pcs)
            $variantName = "Mochi {$flavor}";
            $cleanFlavor = strtoupper(str_replace([' ', '(', ')'], '', $variantName));

            ProductVariant::create([
                'tenant_id'   => $tenant->id,
                'recipe_id'   => $recipe->id,
                'recipe_qty'  => 1.000,
                'name'        => $variantName,
                'sell_price'  => 7000,
                'description' => "Mochi rasa {$flavor} (Satuan)",
                'is_active'   => true,
            ]);
        }

        // 3. Seed default Packages
        Package::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Paket Satuan',
            'capacity'    => 1,
            'price'       => 7000,
            'is_active'   => true,
            'description' => 'Mochi eceran per 1 pcs',
        ]);

        Package::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Paket 3 Mix',
            'capacity'    => 3,
            'price'       => 18000,
            'is_active'   => true,
            'description' => 'Mochi paket isi 3 pcs (bebas pilih rasa)',
        ]);

        Package::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Paket 6 Mix',
            'capacity'    => 6,
            'price'       => 35000,
            'is_active'   => true,
            'description' => 'Mochi paket isi 6 pcs (bebas pilih rasa)',
        ]);

        // Expense categories
        $expCats = [];
        foreach (['Pembelian Bahan', 'Gaji Karyawan', 'Sewa Tempat', 'Listrik & Air', 'Peralatan'] as $name) {
            $expCats[$name] = ExpenseCategory::create([
                'tenant_id' => $tenant->id,
                'name'      => $name,
                'type'      => in_array($name, ['Sewa Tempat', 'Peralatan']) ? 'capex' : 'opex',
            ]);
        }

        // 30 days of transactions
        for ($i = 0; $i < 30; $i++) {
            $date    = now()->subDays($i);
            $income  = rand(150000, 800000);
            $expense = rand(50000, 200000);

            Transaction::create([
                'tenant_id'      => $tenant->id,
                'type'           => 'income',
                'category'       => 'sales',
                'amount'         => $income,
                'description'    => 'Penjualan ' . $date->format('d M Y'),
                'date'           => $date,
                'payment_method' => rand(0, 1) ? 'cash' : 'transfer',
                'user_id'        => $owner->id,
            ]);

            Transaction::create([
                'tenant_id'           => $tenant->id,
                'type'                => 'expense',
                'category'            => 'purchase',
                'expense_category_id' => $expCats['Pembelian Bahan']->id,
                'amount'              => $expense,
                'description'         => 'Pembelian bahan baku',
                'date'                => $date,
                'payment_method'      => 'cash',
                'user_id'             => $owner->id,
            ]);
        }

        // Default Payment Methods
        PaymentMethod::create([
            'tenant_id'      => $tenant->id,
            'name'           => 'Tunai (Cash)',
            'account_name'   => null,
            'account_number' => null,
            'is_active'      => true,
        ]);

        PaymentMethod::create([
            'tenant_id'      => $tenant->id,
            'name'           => 'Transfer Bank BRI',
            'account_name'   => 'Mochi Delight',
            'account_number' => '1223-01-004567-50-2',
            'is_active'      => true,
        ]);

        PaymentMethod::create([
            'tenant_id'      => $tenant->id,
            'name'           => 'ShopeePay',
            'account_name'   => 'Mochi Delight',
            'account_number' => '0812-1111-2222',
            'is_active'      => true,
        ]);

        PaymentMethod::create([
            'tenant_id'      => $tenant->id,
            'name'           => 'QRIS',
            'account_name'   => 'Mochi Delight',
            'account_number' => 'QRIS Vvarsa',
            'is_active'      => true,
        ]);
    }
}
