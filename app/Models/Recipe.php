<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'portion_qty',
    ];

    protected $casts = [
        'portion_qty' => 'decimal:3',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class, 'recipe_id');
    }

    /**
     * Total cost of 1 full recipe batch/adonan
     */
    public function getTotalCostAttribute(): float
    {
        return (float) $this->ingredients->sum(function ($ingredient) {
            return (float) $ingredient->ingredient_cost * (float) $ingredient->qty;
        });
    }

    /**
     * HPP per unit/pcs = total_cost / portion_qty
     */
    public function getHppAttribute(): float
    {
        $totalCost = $this->total_cost;
        $portionQty = (float) ($this->portion_qty ?? 1.0);
        if ($portionQty <= 0) return $totalCost;

        return (float) ($totalCost / $portionQty);
    }
}
