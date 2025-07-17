<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subscription_product_id',
        'is_active',
        'is_private',
        'frequency',
        'stripe_id',
        'name',
        'description',
        'features',
        'is_custom_price',
        'price',
        'price_per_unit',
        'is_popular',
        'is_upgradable',
        'monthly_credits'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_private' => 'boolean',
        'features' => 'array',
        'price' => 'float',
        'is_custom_price' => 'boolean',
        'is_popular' => 'boolean',
        'is_upgradable' => 'boolean',
    ];

    protected $appends = ['user_ids'];

    public function setFeaturesAttribute($value)
    {
        $this->attributes['features'] = json_encode($value);
    }

    public function getFeaturesAttribute($value)
    {
        return json_decode($value, true);
    }

    public function getUserIdsAttribute()
    {
        return $this->users()->pluck('users.id')->toArray();
    }

    public function product()
    {
        return $this->belongsTo(SubscriptionProduct::class, 'subscription_product_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'subscription_plan_users');
    }
}
