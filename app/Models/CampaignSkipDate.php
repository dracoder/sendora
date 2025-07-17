<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignSkipDate extends Model
{
    protected $fillable = ['campaign_id', 'from', 'to'];

    protected $casts = [
        'from' => 'date:Y-m-d',
        'to' => 'date:Y-m-d',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}
