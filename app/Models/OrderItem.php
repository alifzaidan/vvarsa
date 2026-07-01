<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'variant_id',
        'variant_name',
        'qty',
        'unit_price',
        'unit_hpp',
        'total',
        'paket_isi',
        'paket_harga',
    ];

    protected $casts = [
        'qty'         => 'integer',
        'unit_price'  => 'decimal:2',
        'unit_hpp'    => 'decimal:2',
        'total'       => 'decimal:2',
        'paket_isi'   => 'integer',
        'paket_harga' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Total profit contribution = (unit_price - unit_hpp) * qty
     */
    public function getProfitAttribute(): float
    {
        return ((float) $this->unit_price - (float) $this->unit_hpp) * $this->qty;
    }
}
