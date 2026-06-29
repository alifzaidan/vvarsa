<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title',
        'organizer',
        'business_types',
        'location',
        'city',
        'description',
        'image',
        'start_date',
        'end_date',
        'max_participants',
        'registered_count',
        'registration_fee',
        'registration_url',
        'allow_platform_registration',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'business_types'              => 'array',
        'start_date'                  => 'datetime',
        'end_date'                    => 'datetime',
        'registration_fee'            => 'decimal:2',
        'allow_platform_registration' => 'boolean',
        'is_featured'                 => 'boolean',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function isRegistrationOpen(): bool
    {
        if (!$this->allow_platform_registration) return false;
        if ($this->max_participants && $this->registered_count >= $this->max_participants) return false;
        return $this->status === 'upcoming';
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')->where('start_date', '>=', now());
    }

    public function scopeForBusinessType($query, string $type)
    {
        return $query->whereJsonContains('business_types', $type);
    }
}
