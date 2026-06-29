<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $tenant = app('tenant');
        $members = User::where('tenant_id', $tenant->id)
            ->with('roles')
            ->latest()
            ->get();

        $roles = Role::whereIn('name', ['owner', 'staff'])->get();

        return Inertia::render('owner/members/index', [
            'members'      => $members,
            'roles'        => $roles,
            'limit'        => $tenant->max_users,
            'member_count' => $members->count(),
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');

        if (!$tenant->canAddUser()) {
            return back()->with('error', "Batas jumlah pengguna ({$tenant->max_users}) sudah tercapai. Silakan upgrade paket langganan Anda.");
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'role'     => 'required|in:owner,staff',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'tenant_id' => $tenant->id,
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'Pengguna berhasil ditambahkan ke tim Anda.');
    }

    public function update(Request $request, User $member)
    {
        $tenant = app('tenant');

        // Ensure user belongs to same tenant
        if ($member->tenant_id !== $tenant->id) {
            abort(403);
        }

        // Owner cannot change their own role to prevent lockout
        if ($member->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat mengubah peran Anda sendiri.');
        }

        $validated = $request->validate([
            'role' => 'required|in:owner,staff',
        ]);

        $member->syncRoles([$validated['role']]);

        return back()->with('success', "Peran {$member->name} berhasil diperbarui.");
    }

    public function destroy(User $member)
    {
        $tenant = app('tenant');

        // Ensure user belongs to same tenant
        if ($member->tenant_id !== $tenant->id) {
            abort(403);
        }

        // Cannot delete self
        if ($member->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $member->delete();

        return back()->with('success', "Pengguna {$member->name} berhasil dihapus dari tim.");
    }
}
