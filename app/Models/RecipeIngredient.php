<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    protected $fillable = [
        'recipe_id',
        'ingredient_id',
        'ingredient_name',
        'qty',
        'unit',
        'ingredient_cost',
    ];

    protected $casts = [
        'qty'             => 'decimal:3',
        'ingredient_cost' => 'decimal:2',
    ];

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class, 'recipe_id');
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'ingredient_id');
    }

    /**
     * Total cost contribution = ingredient_cost * qty
     */
    public function getTotalCostAttribute(): float
    {
        return (float) $this->ingredient_cost * (float) $this->qty;
    }
}
