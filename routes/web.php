<?php

use App\Http\Controllers\CommunityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Finance\ReportController;
use App\Http\Controllers\Finance\TransactionController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\ProductVariantController;
use App\Http\Controllers\Inventory\RecipeController;
use App\Http\Controllers\Inventory\StockMovementController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Order\PosController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\Tax\TaxController;
use App\Http\Controllers\Owner\SubscriptionController;
use App\Http\Controllers\Owner\MemberController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// ── Platform Admin ────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard Admin
        Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // Tenants Management
        Route::get('/tenants', [\App\Http\Controllers\Admin\TenantController::class, 'index'])->name('tenants.index');
        Route::get('/tenants/{tenant}', [\App\Http\Controllers\Admin\TenantController::class, 'show'])->name('tenants.show');
        Route::post('/tenants/{tenant}/toggle', [\App\Http\Controllers\Admin\TenantController::class, 'toggleActive'])->name('tenants.toggle');
        Route::put('/tenants/{tenant}/plan', [\App\Http\Controllers\Admin\TenantController::class, 'updatePlan'])->name('tenants.plan.update');
        Route::put('/tenants/{tenant}', [\App\Http\Controllers\Admin\TenantController::class, 'update'])->name('tenants.update');

        // Users Management
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');

        // Subscription Plans Management (CRUD)
        Route::get('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'update'])->name('plans.update');
        Route::delete('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'destroy'])->name('plans.destroy');
    });

// ── Authenticated + Tenant ─────────────────────────────────────────────────
Route::middleware(['auth', 'verified', \App\Http\Middleware\EnsureTenantMiddleware::class])
    ->group(function () {

    // ── Shared Tenant Routes (Owner & Staff) ──
    Route::middleware(['role:owner|staff'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Inventory: View & Movement Actions
        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', [ProductController::class, 'index'])->name('index');
            Route::get('/stock-in', [StockMovementController::class, 'stockIn'])->name('stock-in');
            Route::post('/stock-in', [StockMovementController::class, 'processStockIn'])->name('stock-in.store');
            Route::get('/stock-out', [StockMovementController::class, 'stockOut'])->name('stock-out');
            Route::post('/stock-out', [StockMovementController::class, 'processStockOut'])->name('stock-out.store');
            Route::get('/opname', [StockMovementController::class, 'opname'])->name('opname');
            Route::post('/opname', [StockMovementController::class, 'processOpname'])->name('opname.store');
            Route::get('/history', [StockMovementController::class, 'history'])->name('history');
        });

        // Events
        Route::prefix('events')->name('events.')->group(function () {
            Route::get('/', [EventController::class, 'index'])->name('index');
            Route::get('/{event}', [EventController::class, 'show'])->name('show');
            Route::post('/{event}/register', [EventController::class, 'register'])->name('register');
            Route::delete('/{event}/register', [EventController::class, 'cancelRegistration'])->name('register.cancel');
        });

        // Community
        Route::prefix('community')->name('community.')->group(function () {
            Route::get('/', [CommunityController::class, 'index'])->name('index');
            Route::get('/create', [CommunityController::class, 'create'])->name('create');
            Route::post('/', [CommunityController::class, 'store'])->name('store');
            Route::get('/{post}', [CommunityController::class, 'show'])->name('show');
            Route::post('/{post}/reply', [CommunityController::class, 'reply'])->name('reply');
            Route::post('/{post}/like', [CommunityController::class, 'toggleLike'])->name('like');
        });

        // Suppliers
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');

        // Tax Consultation (Everyone can access consultation)
        Route::get('/tax/consultation', [TaxController::class, 'consultation'])->name('tax.consultation');

        // Pesanan / Orders (Owner & Staff)
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [OrderController::class, 'index'])->name('index');
            Route::get('/create', [OrderController::class, 'create'])->name('create');
            Route::post('/', [OrderController::class, 'store'])->name('store');
            Route::get('/{order}', [OrderController::class, 'show'])->name('show');
            Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('status');
            Route::patch('/{order}/pay', [OrderController::class, 'markPaid'])->name('pay');
            Route::delete('/{order}', [OrderController::class, 'destroy'])->name('destroy');
        });

        // POS / Kasir (Owner & Staff)
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    });

    // ── Owner-Only Tenant Routes ──
    Route::middleware(['role:owner'])->group(function () {
        // Inventory Management: Create / Edit / Delete
        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/create', [ProductController::class, 'create'])->name('create');
            Route::post('/', [ProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
        });

        // Varian Produk (Owner only)
        Route::prefix('variants')->name('variants.')->group(function () {
            Route::get('/', [ProductVariantController::class, 'index'])->name('index');
            Route::get('/create', [ProductVariantController::class, 'create'])->name('create');
            Route::post('/', [ProductVariantController::class, 'store'])->name('store');
            Route::get('/{variant}/edit', [ProductVariantController::class, 'edit'])->name('edit');
            Route::put('/{variant}', [ProductVariantController::class, 'update'])->name('update');
            Route::delete('/{variant}', [ProductVariantController::class, 'destroy'])->name('destroy');
        });

        // Resep / BOM (Owner only)
        Route::prefix('recipes')->name('recipes.')->group(function () {
            Route::get('/', [RecipeController::class, 'index'])->name('index');
            Route::get('/create', [RecipeController::class, 'create'])->name('create');
            Route::post('/', [RecipeController::class, 'store'])->name('store');
            Route::get('/{recipe}/edit', [RecipeController::class, 'edit'])->name('edit');
            Route::put('/{recipe}', [RecipeController::class, 'update'])->name('update');
            Route::delete('/{recipe}', [RecipeController::class, 'destroy'])->name('destroy');
        });

        // Finance
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('/', [ReportController::class, 'overview'])->name('index');
            Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
            Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
            Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
            Route::get('/sales-report', [ReportController::class, 'salesReport'])->name('sales-report');
            Route::get('/expense-report', [ReportController::class, 'expenseReport'])->name('expense-report');
        });

        // Tax Reports Management
        Route::prefix('tax')->name('tax.')->group(function () {
            Route::get('/', [TaxController::class, 'index'])->name('index');
            Route::post('/', [TaxController::class, 'store'])->name('store');
        });

        // Subscription Management
        Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade'])->name('subscription.upgrade');

        // Member / Team Management
        Route::prefix('members')->name('members.')->group(function () {
            Route::get('/', [MemberController::class, 'index'])->name('index');
            Route::post('/', [MemberController::class, 'store'])->name('store');
            Route::put('/{member}', [MemberController::class, 'update'])->name('update');
            Route::delete('/{member}', [MemberController::class, 'destroy'])->name('destroy');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
