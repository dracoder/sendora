<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationSetting extends Model
{
    protected $fillable = [
        'organization_id',
        'daily_limit',
        'smtp',
    ];

    protected $casts = [
        'smtp' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function setSmtpAttribute($value)
    {
        $this->attributes['smtp'] = json_encode($value);
    }

    public function getSmtpAttribute($value)
    {
        return json_decode($value, true);
    }
}
