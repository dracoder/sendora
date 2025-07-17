<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CreditTransaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
        'expires_at' => 'datetime',
    ];

    const TYPE_SUBSCRIPTION = 'subscription_credit';
    const TYPE_PACKAGE = 'package_credit';

    const TRANSACTION_PURCHASE = 'purchase';
    const TRANSACTION_USAGE = 'usage';

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';

    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($transaction) {
    //         if ($transaction->transaction_type === self::TRANSACTION_PURCHASE && $transaction->status !== self::STATUS_ACTIVE) {
    //             $transaction->status = self::STATUS_ACTIVE;
    //         }
    //     });

    //     static::retrieved(function ($transaction) {
    //         if ($transaction->transaction_type === self::TRANSACTION_PURCHASE && 
    //             $transaction->type === self::TYPE_SUBSCRIPTION && 
    //             $transaction->status === self::STATUS_ACTIVE) {
                
    //             $expiryDate = Carbon::parse($transaction->created_at)->addMonth();
                
    //             if (Carbon::now()->gt($expiryDate)) {
    //                 $transaction->status = self::STATUS_INACTIVE;
    //                 $transaction->save();
    //             }
    //         }
    //     });
    // }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function scopePurchases($query)
    {
        return $query->where('transaction_type', self::TRANSACTION_PURCHASE);
    }

    public function scopeUsage($query)
    {
        return $query->where('transaction_type', self::TRANSACTION_USAGE);
    }

    public function scopeSubscriptionCredits($query)
    {
        return $query->where('type', self::TYPE_SUBSCRIPTION);
    }

    public function scopePackageCredits($query)
    {
        return $query->where('type', self::TYPE_PACKAGE);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function getAvailableCreditsAttribute()
    {
        if ($this->transaction_type !== self::TRANSACTION_PURCHASE) {
            return 0;
        }
        
        return max(0, $this->amount - $this->usage);
    }

    public function deductCredits($amount)
    {
        if ($this->transaction_type !== self::TRANSACTION_PURCHASE || 
            $this->status !== self::STATUS_ACTIVE || 
            ($this->amount - $this->usage) < $amount) {
            return 0;
        }

        $deducted = min($amount, $this->amount - $this->usage);
        $this->usage += $deducted;
        $this->save();
        
        return $deducted;
    }
}