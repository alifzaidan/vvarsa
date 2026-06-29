<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function salesReport(Request $request): Response
    {
        $tenant = app('tenant');
        $period = $request->get('period', 'monthly'); // daily, monthly, yearly
        $year   = $request->get('year', now()->year);
        $month  = $request->get('month', now()->month);

        $query = Transaction::where('tenant_id', $tenant->id)->where('type', 'income');

        $dataQuery = clone $query;
        if ($period === 'daily') {
            $data = $dataQuery->whereYear('date', $year)->whereMonth('date', $month)
                ->select(DB::raw('DAY(date) as day'), DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('day')->orderBy('day')->get();
        } elseif ($period === 'monthly') {
            $data = $dataQuery->whereYear('date', $year)
                ->select(DB::raw('MONTH(date) as month'), DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('month')->orderBy('month')->get();
        } else {
            $data = $dataQuery
                ->select(DB::raw('YEAR(date) as year'), DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('year')->orderBy('year')->get();
        }

        $totalSales = (clone $query)->when($period === 'monthly', fn($q) => $q->whereYear('date', $year))
            ->when($period === 'daily', fn($q) => $q->whereYear('date', $year)->whereMonth('date', $month))
            ->sum('amount');

        return Inertia::render('finance/sales-report', [
            'data'        => $data,
            'total_sales' => (float) $totalSales,
            'period'      => $period,
            'year'        => (int) $year,
            'month'       => (int) $month,
            'today_sales' => (float) Transaction::where('tenant_id', $tenant->id)
                ->where('type', 'income')->whereDate('date', today())->sum('amount'),
            'month_sales' => (float) Transaction::where('tenant_id', $tenant->id)
                ->where('type', 'income')->whereYear('date', now()->year)->whereMonth('date', now()->month)->sum('amount'),
        ]);
    }

    public function expenseReport(Request $request): Response
    {
        $tenant = app('tenant');
        $year   = $request->get('year', now()->year);
        $month  = $request->get('month', now()->month);

        $monthlyData = Transaction::where('tenant_id', $tenant->id)
            ->where('type', 'expense')
            ->whereYear('date', $year)->whereMonth('date', $month)
            ->select(DB::raw('DAY(date) as day'), DB::raw('SUM(amount) as total'))
            ->groupBy('day')->orderBy('day')->get();

        $byCategory = Transaction::where('tenant_id', $tenant->id)
            ->where('type', 'expense')
            ->whereYear('date', $year)->whereMonth('date', $month)
            ->with('expenseCategory:id,name')
            ->select('expense_category_id', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('expense_category_id')->get();

        return Inertia::render('finance/expense-report', [
            'monthly_data'   => $monthlyData,
            'by_category'    => $byCategory,
            'year'           => (int) $year,
            'month'          => (int) $month,
            'today_expense'  => (float) Transaction::where('tenant_id', $tenant->id)
                ->where('type', 'expense')->whereDate('date', today())->sum('amount'),
            'month_expense'  => (float) Transaction::where('tenant_id', $tenant->id)
                ->where('type', 'expense')->whereYear('date', $year)->whereMonth('date', $month)->sum('amount'),
        ]);
    }

    public function overview(Request $request): Response
    {
        $tenant = app('tenant');

        // 12-month revenue vs expense
        $twelveMonths = [];
        for ($i = 11; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $y     = $date->year;
            $m     = $date->month;
            $label = $date->format('M Y');

            $income  = Transaction::where('tenant_id', $tenant->id)->where('type', 'income')
                ->whereYear('date', $y)->whereMonth('date', $m)->sum('amount');
            $expense = Transaction::where('tenant_id', $tenant->id)->where('type', 'expense')
                ->whereYear('date', $y)->whereMonth('date', $m)->sum('amount');

            $twelveMonths[] = [
                'label'   => $label,
                'income'  => (float) $income,
                'expense' => (float) $expense,
                'profit'  => (float) ($income - $expense),
            ];
        }

        return Inertia::render('finance/index', [
            'twelve_months' => $twelveMonths,
            'today'         => [
                'income'  => (float) Transaction::where('tenant_id', $tenant->id)->where('type', 'income')->whereDate('date', today())->sum('amount'),
                'expense' => (float) Transaction::where('tenant_id', $tenant->id)->where('type', 'expense')->whereDate('date', today())->sum('amount'),
            ],
            'this_month'    => [
                'income'  => (float) Transaction::where('tenant_id', $tenant->id)->where('type', 'income')->whereYear('date', now()->year)->whereMonth('date', now()->month)->sum('amount'),
                'expense' => (float) Transaction::where('tenant_id', $tenant->id)->where('type', 'expense')->whereYear('date', now()->year)->whereMonth('date', now()->month)->sum('amount'),
            ],
        ]);
    }
}
