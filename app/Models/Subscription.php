<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    protected $fillable = [
        'user_id',
        'type',
        'stripe_id',
        'stripe_status',
        'stripe_price',
        'quantity',
        'trial_ends_at',
        'ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription_plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'stripe_price', 'stripe_id');
    }

    public function items()
    {
        return $this->hasMany(SubscriptionItem::class);
    }
}
