<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxReport extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'period',
        'tax_type',
        'gross_amount',
        'tax_amount',
        'status',
        'notes',
        'due_date',
        'submitted_at',
        'user_id',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'tax_amount'   => 'decimal:2',
        'due_date'     => 'date',
        'submitted_at' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
