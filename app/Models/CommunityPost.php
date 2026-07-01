<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'business_type',
        'title',
        'content',
        'category',
        'image',
        'likes_count',
        'replies_count',
        'views_count',
        'is_pinned',
        'is_active',
    ];

    protected $casts = [
        'is_pinned'  => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CommunityReply::class, 'post_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(CommunityPostLike::class, 'post_id');
    }
}
