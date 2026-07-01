<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'discount',
        'total',
        'notes',
        'transaction_id',
        'stock_deducted',
        'user_id',
        'ordered_at',
    ];

    protected $casts = [
        'subtotal'       => 'decimal:2',
        'discount'       => 'decimal:2',
        'total'          => 'decimal:2',
        'stock_deducted' => 'boolean',
        'ordered_at'     => 'datetime',
    ];

    // ── Relations ─────────────────────────────────────────────────────────────

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['done', 'cancelled']);
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'unpaid');
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Generate a unique order number like ORD-20260627-0001
     */
    public static function generateOrderNumber(int $tenantId): string
    {
        $date   = Carbon::now()->format('Ymd');
        $prefix = "ORD-{$date}-";

        $lastOrder = self::where('tenant_id', $tenantId)
            ->where('order_number', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextSeq = $lastOrder
            ? ((int) substr($lastOrder->order_number, -4)) + 1
            : 1;

        return $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBePaid(): bool
    {
        return $this->payment_status === 'unpaid' && $this->status !== 'cancelled';
    }

    public function canBeCancelled(): bool
    {
        return ! $this->isPaid() && $this->status !== 'cancelled';
    }
}
