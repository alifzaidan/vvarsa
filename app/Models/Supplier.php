<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supplier extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'contact_name',
        'phone',
        'email',
        'website',
        'address',
        'city',
        'product_categories',
        'business_type',
        'rating',
        'review_count',
        'logo',
        'description',
        'is_verified',
        'is_active',
    ];

    protected $casts = [
        'product_categories' => 'array',
        'rating'             => 'decimal:1',
        'is_verified'        => 'boolean',
        'is_active'          => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Global suppliers have tenant_id = null
    public function scopeGlobal($query)
    {
        return $query->whereNull('tenant_id');
    }

    public function scopeForBusinessType($query, string $type)
    {
        return $query->where('business_type', $type)->orWhereNull('business_type');
    }
}
