<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Subscriber extends Model
{
    protected $fillable = [
        'is_subscribed',
        'organization_id',
        'email',
        'phone',
        'title',
        'first_name',
        'last_name',
        'email_status',
        'company',
        'industry',
        'location',
        //'profile_picture',
        'linkedin_url',
        'note',
    ];

    protected $casts = [
        'is_subscribed' => 'boolean',
    ];

    protected $appends = ['tag_ids'];

    protected static function booted()
    {
        static::addGlobalScope('parentUser', function (Builder $builder) {
            $builder->whereHas('organization', function ($query) {
                $query->where('user_id', Auth::id());
            });
            return $builder;
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'subscriber_tags');
    }

    public function getTagIdsAttribute()
    {
        return $this->tags()->pluck('id')->toArray();
    }

    public function campaigns()
    {
        return $this->hasMany(SubscriberCampaign::class);
    }

    public function emails()
    {
        return $this->hasMany(SubscriberCampaignEmail::class);
    }

    public function campaignSubscribers()
    {
        return $this->belongsToMany(Campaign::class, 'subscriber_campaigns')
            ->withPivot('next_at', 'progress', 'created_at', 'updated_at');
    }
}
