<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'sku',
        'name',
        'category_id',
        'unit',
        'min_stock',
        'current_stock',
        'purchase_price',
        'purchase_qty',
        'cost_price',
        'sell_price',
        'image',
        'description',
        'is_active',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'purchase_qty'   => 'decimal:2',
        'cost_price'     => 'decimal:2',
        'sell_price'     => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($product) {
            // Hanya recalculate cost_price jika purchase_price atau purchase_qty berubah
            if ($product->isDirty('purchase_price') || $product->isDirty('purchase_qty')) {
                if ($product->purchase_qty > 0) {
                    $product->cost_price = $product->purchase_price / $product->purchase_qty;
                } else {
                    $product->cost_price = $product->purchase_price;
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->min_stock;
    }

    public function getMarginAttribute(): float
    {
        if ($this->sell_price == 0) return 0;
        return round((($this->sell_price - $this->cost_price) / $this->sell_price) * 100, 2);
    }
}