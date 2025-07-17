<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTracking extends Model
{
    protected $guarded = [];

    protected $casts = [
        'opened_at' => 'datetime',
    ];

    public function subscriberCampaignEmail()
    {
        return $this->belongsTo(SubscriberCampaignEmail::class);
    }
}
