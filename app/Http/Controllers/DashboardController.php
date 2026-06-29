<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');
        $tenantId = $tenant->id;
        $today = now()->toDateString();
        $thisMonthStart = now()->startOfMonth()->toDateString();

        // ── Stats Cards ─────────────────────────────────────────────────────
        $totalProducts    = Product::where('tenant_id', $tenantId)->where('is_active', true)->count();
        $lowStockProducts = Product::where('tenant_id', $tenantId)
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->where('is_active', true)->count();

        $salesToday = Transaction::where('tenant_id', $tenantId)
            ->where('type', 'income')->whereDate('date', $today)->sum('amount');

        $salesMonth = Transaction::where('tenant_id', $tenantId)
            ->where('type', 'income')->whereBetween('date', [$thisMonthStart, $today])->sum('amount');

        $expenseToday = Transaction::where('tenant_id', $tenantId)
            ->where('type', 'expense')->whereDate('date', $today)->sum('amount');

        $expenseMonth = Transaction::where('tenant_id', $tenantId)
            ->where('type', 'expense')->whereBetween('date', [$thisMonthStart, $today])->sum('amount');

        // ── Weekly Sales Chart (last 7 days) ─────────────────────────────────
        $weeklyData = Transaction::where('tenant_id', $tenantId)
            ->where('type', 'income')
            ->where('date', '>=', now()->subDays(6)->toDateString())
            ->select(DB::raw('DATE(date) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $chartData[] = [
                'date'  => now()->subDays($i)->format('D'),
                'sales' => (float) ($weeklyData[$date]->total ?? 0),
            ];
        }

        // ── Recent Transactions ──────────────────────────────────────────────
        $recentTransactions = Transaction::where('tenant_id', $tenantId)
            ->latest('date')
            ->limit(5)
            ->get(['id', 'type', 'amount', 'description', 'date', 'payment_method']);

        // ── Upcoming Events ───────────────────────────────────────────────────
        $upcomingEvents = Event::upcoming()
            ->limit(3)
            ->get(['id', 'title', 'organizer', 'start_date', 'city', 'registration_fee', 'registered_count', 'max_participants']);

        // ── Low Stock Products ───────────────────────────────────────────────
        $lowStockList = Product::where('tenant_id', $tenantId)
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->where('is_active', true)
            ->with('category:id,name')
            ->limit(5)
            ->get(['id', 'name', 'current_stock', 'min_stock', 'unit', 'category_id']);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_products'     => $totalProducts,
                'low_stock_products' => $lowStockProducts,
                'sales_today'        => (float) $salesToday,
                'sales_month'        => (float) $salesMonth,
                'expense_today'      => (float) $expenseToday,
                'expense_month'      => (float) $expenseMonth,
                'net_today'          => (float) ($salesToday - $expenseToday),
                'net_month'          => (float) ($salesMonth - $expenseMonth),
            ],
            'chart_data'          => $chartData,
            'recent_transactions' => $recentTransactions,
            'upcoming_events'     => $upcomingEvents,
            'low_stock_list'      => $lowStockList,
        ]);
    }
}
