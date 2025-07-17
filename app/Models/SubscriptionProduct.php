<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionProduct extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'key',
        'stripe_id'
    ];
}
