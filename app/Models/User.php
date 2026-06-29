<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'tenant_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────────────────────

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }

    public function communityReplies(): HasMany
    {
        return $this->hasMany(CommunityReply::class);
    }

    public function eventRegistrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Apakah user ini platform admin (bukan tenant user).
     */
    public function isPlatformAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Apakah user ini owner dari tenant-nya.
     */
    public function isTenantOwner(): bool
    {
        return $this->hasRole('owner');
    }

    /**
     * Apakah user ini staff dari tenant-nya.
     */
    public function isTenantStaff(): bool
    {
        return $this->hasRole('staff');
    }

    /**
     * Role utama user sebagai string sederhana.
     */
    public function primaryRole(): string
    {
        if ($this->hasRole('admin'))  return 'admin';
        if ($this->hasRole('owner'))  return 'owner';
        if ($this->hasRole('staff'))  return 'staff';
        return 'guest';
    }
}
