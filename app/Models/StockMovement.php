<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'tenant_id',
        'product_id',
        'type',
        'qty',
        'qty_before',
        'qty_after',
        'unit_cost',
        'reference',
        'note',
        'user_id',
        'movement_date',
    ];

    protected $casts = [
        'unit_cost'     => 'decimal:2',
        'movement_date' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
