<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(): Response
    {
        $tenant = app('tenant');
        $paymentMethods = PaymentMethod::where('tenant_id', $tenant->id)
            ->orderBy('id')
            ->get();

        return Inertia::render('settings/payment-methods', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = app('tenant');

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'account_name'   => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
        ]);

        PaymentMethod::create(array_merge($validated, [
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]));

        return back()->with('success', 'Metode pembayaran berhasil ditambahkan.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $tenant = app('tenant');
        abort_if($paymentMethod->tenant_id !== $tenant->id, 403);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'account_name'   => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'is_active'      => 'required|boolean',
        ]);

        $paymentMethod->update($validated);

        return back()->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $tenant = app('tenant');
        abort_if($paymentMethod->tenant_id !== $tenant->id, 403);

        $paymentMethod->delete();

        return back()->with('success', 'Metode pembayaran berhasil dihapus.');
    }
}
