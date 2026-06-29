<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $query = Transaction::where('tenant_id', $tenant->id)
            ->with(['user:id,name', 'expenseCategory:id,name']);

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($from = $request->get('from')) {
            $query->where('date', '>=', $from);
        }

        if ($to = $request->get('to')) {
            $query->where('date', '<=', $to);
        }

        $transactions = $query->latest('date')->paginate(20)->withQueryString();

        $summary = Transaction::where('tenant_id', $tenant->id)
            ->select(
                DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as total_expense'),
            )->first();

        $expenseCategories = ExpenseCategory::where('tenant_id', $tenant->id)->get(['id', 'name']);

        return Inertia::render('finance/transactions', [
            'transactions'      => $transactions,
            'summary'           => $summary,
            'expense_categories'=> $expenseCategories,
            'filters'           => $request->only(['type', 'from', 'to']),
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'type'               => 'required|in:income,expense',
            'amount'             => 'required|numeric|min:0.01',
            'description'        => 'nullable|string|max:255',
            'category'           => 'nullable|string|max:100',
            'expense_category_id'=> 'nullable|exists:expense_categories,id',
            'reference'          => 'nullable|string|max:100',
            'date'               => 'required|date',
            'payment_method'     => 'required|in:cash,transfer,credit',
        ]);

        Transaction::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
        ]));

        return back()->with('success', 'Transaksi berhasil dicatat.');
    }

    public function destroy(Transaction $transaction)
    {
        $tenant = app('tenant');
        abort_if($transaction->tenant_id !== $tenant->id, 403);

        $transaction->delete();

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
