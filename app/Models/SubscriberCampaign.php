<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriberCampaign extends Model
{
    protected $fillable = [
        'subscriber_id',
        'campaign_id',
        'next_at',
        'progress',
    ];

    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function emails()
    {
        return $this->hasMany(SubscriberCampaignEmail::class, 'subscriber_campaign_id');
    }
}
