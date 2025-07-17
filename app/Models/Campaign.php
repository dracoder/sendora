<?php

namespace App\Models;

use App\Jobs\SendCampaignEmail;
use App\Repositories\CampaignRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Campaign extends Model
{
    protected $fillable = [
        'organization_id',
        'template_id',
        'is_active',
        'name',
        'description',
        'start_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['tag_ids', 'subscribers_count'];

    protected $with = ['emails', 'skip_dates', 'template'];

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

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function emails()
    {
        return $this->hasMany(Email::class);
    }

    public function skip_dates()
    {
        return $this->hasMany(CampaignSkipDate::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'campaign_tags');
    }

    public function subscriberCampaigns()
    {
        return $this->hasMany(SubscriberCampaign::class);
    }

    public function subscribers()
    {
        return $this->belongsToMany(Subscriber::class, 'subscriber_campaigns')
            ->withPivot(['progress', 'next_at']);
    }

    public function getSubscribersCountAttribute()
    {
        return $this->subscribers()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeNotSkipped($query)
    {
        return $query->whereDoesntHave('skip_dates', function ($query) {
            $query->where('from', '<=', now())
                ->where('to', '>=', now());
        });
    }

    public function getTagIdsAttribute()
    {
        return $this->tags()->pluck('id')->toArray();
    }

    public function subscribersCount()
    {
        $campaignRepository = new CampaignRepository($this);
        return $campaignRepository->getSubscribers(globalScoped: true)->count();
    }

    public function subscribersList()
    {
        $campaignRepository = new CampaignRepository($this);
        return $campaignRepository->getSubscribers(globalScoped: true)->with('organization')->get();
    }

    
}
