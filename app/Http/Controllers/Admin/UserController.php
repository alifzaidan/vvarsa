<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $tenantFilter = $request->input('tenant_id');

        $users = User::with(['tenant', 'roles'])
            ->where('id', '!=', auth()->id())
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($tenantFilter, function ($query, $tenantFilter) {
                $query->where('tenant_id', $tenantFilter);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $tenants = Tenant::select('id', 'name')->get();

        return Inertia::render('admin/users/index', [
            'users'   => $users,
            'tenants' => $tenants,
            'filters' => [
                'search'    => $search,
                'tenant_id' => $tenantFilter,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,owner,staff',
            'tenant_id' => 'required_if:role,owner,staff|nullable|exists:tenants,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'tenant_id' => $validated['role'] === 'admin' ? null : $validated['tenant_id'],
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,owner,staff',
            'tenant_id' => 'required_if:role,owner,staff|nullable|exists:tenants,id',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'tenant_id' => $validated['role'] === 'admin' ? null : $validated['tenant_id'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = bcrypt($validated['password']);
        }

        $user->update($data);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }
}
