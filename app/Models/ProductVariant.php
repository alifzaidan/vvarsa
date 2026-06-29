<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'tenant_id',
        'recipe_id',
        'recipe_qty',
        'sku',
        'name',
        'sell_price',
        'description',
        'image',
        'is_active',
    ];

    protected $casts = [
        'recipe_qty' => 'decimal:3',
        'sell_price' => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class, 'recipe_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'variant_id');
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'package_variants', 'variant_id', 'package_id');
    }

    /**
     * Virtual relation to match old recipes schema (scaled by recipe_qty).
     */
    public function getRecipesAttribute()
    {
        if (!$this->recipe) return collect();
        return $this->recipe->ingredients->map(function ($ing) {
            $item = clone $ing;
            $item->qty = (float) $ing->qty * (float) $this->recipe_qty;
            return $item;
        });
    }

    /**
     * Calculate HPP (Harga Pokok Produksi) from recipe.
     * HPP = recipe_hpp * recipe_qty.
     */
    public function getHppAttribute(): float
    {
        if (!$this->recipe) return 0.0;
        return (float) $this->recipe->hpp * (float) $this->recipe_qty;
    }

    /**
     * Margin as a percentage based on HPP vs sell_price.
     */
    public function getMarginAttribute(): float
    {
        $hpp = $this->hpp;
        if ($this->sell_price == 0) return 0;
        return round((($this->sell_price - $hpp) / $this->sell_price) * 100, 2);
    }

    /**
     * Profit per unit.
     */
    public function getProfitAttribute(): float
    {
        return (float) $this->sell_price - $this->hpp;
    }
}
