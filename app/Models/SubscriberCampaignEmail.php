<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriberCampaignEmail extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'subscriber_campaign_id',
        'subscriber_id',
        'email_id',
        'scheduled_at',
        'sent',
        'sent_at',
        'retry',
        'exception',
        'failed_at',
        'opened',
        'opened_at',
        'tracking_id',
    ];

    protected $casts = [
        'sent' => 'boolean',
        'retry' => 'boolean',
        'opened' => 'boolean',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
        'opened_at' => 'datetime',
    ];

    public function subscriberCampaign()
    {
        return $this->belongsTo(SubscriberCampaign::class, 'subscriber_campaign_id');
    }

    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class);
    }

    public function email()
    {
        return $this->belongsTo(Email::class);
    }

    public function tracking()
    {
        return $this->hasOne(EmailTracking::class);
    }
}
