<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\MemberRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $tenant  = app('tenant');
        $user    = auth()->user();

        $members = User::where('tenant_id', $tenant->id)
            ->with('roles')
            ->latest()
            ->get();

        $roles = Role::whereIn('name', ['owner', 'supervisor', 'staff'])->get();

        // Permintaan pending — hanya owner yang bisa lihat & aksi
        $pendingRequests = [];
        if ($user->hasRole('owner')) {
            $pendingRequests = MemberRequest::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->with('requestedBy:id,name,email')
                ->latest()
                ->get();
        }

        return Inertia::render('owner/members/index', [
            'members'          => $members,
            'roles'            => $roles,
            'limit'            => $tenant->max_users,
            'member_count'     => $members->count(),
            'pending_requests' => $pendingRequests,
            'is_supervisor'    => $user->hasRole('supervisor'),
            'is_owner'         => $user->hasRole('owner'),
        ]);
    }

    public function store(Request $request)
    {
        $tenant = app('tenant');
        $user   = auth()->user();

        if (!$tenant->canAddUser()) {
            return back()->with('error', "Batas jumlah pengguna ({$tenant->max_users}) sudah tercapai. Silakan upgrade paket langganan Anda.");
        }

        // ── Supervisor: buat pending request, tidak langsung buat user ────────
        if ($user->hasRole('supervisor')) {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users,email|unique:member_requests,email',
                'password' => ['required', Rules\Password::defaults()],
                'role'     => 'required|in:staff',
            ]);

            MemberRequest::create([
                'tenant_id'    => $tenant->id,
                'requested_by' => $user->id,
                'name'         => $validated['name'],
                'email'        => $validated['email'],
                'password'     => Hash::make($validated['password']),
                'role'         => $validated['role'],
                'status'       => 'pending',
            ]);

            return back()->with('success', 'Permintaan penambahan anggota berhasil dikirim. Menunggu persetujuan owner.');
        }

        // ── Owner: langsung buat user ─────────────────────────────────────────
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'role'     => 'required|in:supervisor,staff',
        ]);

        $newUser = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);

        $newUser->assignRole($validated['role']);

        return back()->with('success', 'Pengguna berhasil ditambahkan ke tim Anda.');
    }

    /**
     * Owner menyetujui permintaan supervisor.
     */
    public function approve(MemberRequest $memberRequest)
    {
        $tenant = app('tenant');

        // Proteksi: hanya owner yang bisa approve
        abort_if(!auth()->user()->hasRole('owner'), 403);

        // Pastikan request milik tenant yang sama
        abort_if($memberRequest->tenant_id !== $tenant->id, 403);

        // Pastikan masih pending
        if (!$memberRequest->isPending()) {
            return back()->with('error', 'Permintaan ini sudah diproses sebelumnya.');
        }

        // Cek kuota user
        if (!$tenant->canAddUser()) {
            return back()->with('error', "Batas jumlah pengguna ({$tenant->max_users}) sudah tercapai.");
        }

        // Cek email belum dipakai
        if (User::where('email', $memberRequest->email)->exists()) {
            $memberRequest->update([
                'status'      => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);
            return back()->with('error', "Email {$memberRequest->email} sudah digunakan. Permintaan ditolak otomatis.");
        }

        // Buat user baru dari data request
        $newUser = User::create([
            'name'      => $memberRequest->name,
            'email'     => $memberRequest->email,
            'password'  => $memberRequest->password, // sudah di-hash
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);

        $newUser->assignRole($memberRequest->role);

        // Tandai request sebagai approved
        $memberRequest->update([
            'status'      => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "Permintaan disetujui. {$memberRequest->name} berhasil ditambahkan ke tim.");
    }

    /**
     * Owner menolak permintaan supervisor.
     */
    public function reject(MemberRequest $memberRequest)
    {
        $tenant = app('tenant');

        abort_if(!auth()->user()->hasRole('owner'), 403);
        abort_if($memberRequest->tenant_id !== $tenant->id, 403);

        if (!$memberRequest->isPending()) {
            return back()->with('error', 'Permintaan ini sudah diproses sebelumnya.');
        }

        $memberRequest->update([
            'status'      => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "Permintaan penambahan {$memberRequest->name} telah ditolak.");
    }

    public function update(Request $request, User $member)
    {
        $tenant = app('tenant');

        // Ensure user belongs to same tenant
        if ($member->tenant_id !== $tenant->id) {
            abort(403);
        }

        // Hanya owner yang bisa ubah role
        abort_if(!auth()->user()->hasRole('owner'), 403, 'Hanya owner yang dapat mengubah peran anggota.');

        // Owner cannot change their own role to prevent lockout
        if ($member->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat mengubah peran Anda sendiri.');
        }

        $validated = $request->validate([
            'role' => 'required|in:owner,supervisor,staff',
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

        // Hanya owner yang bisa hapus
        abort_if(!auth()->user()->hasRole('owner'), 403, 'Hanya owner yang dapat menghapus anggota.');

        // Cannot delete self
        if ($member->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $member->delete();

        return back()->with('success', "Pengguna {$member->name} berhasil dihapus dari tim.");
    }
}
