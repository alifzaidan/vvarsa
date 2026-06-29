<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'tenant_id',
        'type',
        'category',
        'expense_category_id',
        'amount',
        'description',
        'reference',
        'date',
        'payment_method',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expenseCategory(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereYear('date', now()->year)->whereMonth('date', now()->month);
    }
}
