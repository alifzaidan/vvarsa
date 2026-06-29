<?php

namespace App\Http\Controllers\Tax;

use App\Http\Controllers\Controller;
use App\Models\TaxReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app('tenant');

        $reports = TaxReport::where('tenant_id', $tenant->id)
            ->with('user:id,name')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('tax/index', [
            'reports' => $reports,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'period'       => 'required|string|max:20',
            'tax_type'     => 'required|string|max:50',
            'gross_amount' => 'required|numeric|min:0',
            'tax_amount'   => 'required|numeric|min:0',
            'status'       => 'required|in:draft,submitted,paid',
            'notes'        => 'nullable|string',
            'due_date'     => 'nullable|date',
        ]);

        TaxReport::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
        ]));

        return back()->with('success', 'Laporan pajak berhasil disimpan.');
    }

    public function consultation(): Response
    {
        return Inertia::render('tax/consultation');
    }
}
