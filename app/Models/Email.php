<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $fillable = [
        'campaign_id',
        'is_active',
        'title',
        'subject',
        'content',
        'step',
        'delay_unit',
        'delay_value',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sent_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function subscribersCampaigns()
    {
        return $this->hasMany(SubscriberCampaignEmail::class);
    }
}
