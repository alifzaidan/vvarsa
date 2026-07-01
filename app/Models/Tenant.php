<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'business_type',
        'phone',
        'address',
        'logo',
        'plan_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(TenantSubscription::class)->where('status', 'active')->latestOfMany();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function productCategories(): HasMany
    {
        return $this->hasMany(ProductCategory::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function taxReports(): HasMany
    {
        return $this->hasMany(TaxReport::class);
    }

    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }

    // ─── Computed limits (dari subscription plan) ─────────────────────────────

    /**
     * Batas maksimal produk berasal dari subscription plan tenant.
     */
    public function getMaxProductsAttribute(): int
    {
        return $this->plan?->max_products ?? 100;
    }

    /**
     * Batas maksimal user berasal dari subscription plan tenant.
     */
    public function getMaxUsersAttribute(): int
    {
        return $this->plan?->max_users ?? 1;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function canAddProduct(): bool
    {
        return $this->products()->where('is_active', true)->count() < $this->max_products;
    }

    public function canAddUser(): bool
    {
        return $this->users()->count() < $this->max_users;
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->plan?->features ?? [];
        return in_array($feature, $features);
    }
}
