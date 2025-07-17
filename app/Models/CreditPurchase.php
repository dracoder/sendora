<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditPurchase extends Model
{
    protected $table = 'credit_purchases';

    protected $fillable = ['user_id', 'credits', 'price'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
