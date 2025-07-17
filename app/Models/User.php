<?php

namespace App\Models;

use App\Notifications\CustomResetPassword;
use App\Notifications\LoginInstructions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role',
        'is_affiliate',
        'first_name',
        'last_name',
        'email',
        'password',
        'email_verified_at',
        'remember_token',
        'used_credits',
        'total_credits',
    ];

    protected $appends = [
        'available_credits',
        'subscription_credits',
        'package_credits',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_affiliate' => 'boolean',
        ];
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailLoginInstructions()
    {
        $this->notify(new LoginInstructions());
    }

    public function details()
    {
        return $this->hasMany(UserDetail::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function creditPurchases()
    {
        return $this->hasMany(CreditPurchase::class);
    }

    // active subscriptions
    public function activeSubscription()
    {
        return $this->subscriptions()->whereIn('stripe_status', ['active', 'pastDue'])->with('subscription_plan')->first();
    }
    public function currentSubscription()
    {
        return $this->subscriptions()
            ->where(function ($query) {
                $query->whereIn('stripe_status', ['active', 'pastDue'])
                    ->orWhere(function ($query) {
                        $query->where('stripe_status', 'cancelled')
                            ->where('ends_at', '>', now());
                    });
            })
            ->with('subscription_plan')
            ->first();
    }

    public function availableCredits()
    {
        // $purchased = $this->creditPackagePurchases()->sum('credits');
        // $used = $this->creditUsage()->sum('credits');
        
        // return max(0, $purchased - $used);
        $activeTransactions = $this->creditTransactions()
            ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
            ->where('status', CreditTransaction::STATUS_ACTIVE)
            ->get();
            
        return $activeTransactions->sum(function($transaction) {
            return max(0, $transaction->amount - $transaction->usage);
        });
    }

    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }


    public function getSubscriptionCreditsAttribute()
    {
        $activeTransactions = $this->creditTransactions()
            ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
            ->where('type', CreditTransaction::TYPE_SUBSCRIPTION)
            ->where('status', CreditTransaction::STATUS_ACTIVE)
            ->get();
            
        return $activeTransactions->sum(function($transaction) {
            return max(0, $transaction->amount - $transaction->usage);
        });
    }

    public function getPackageCreditsAttribute()
    {
        $activeTransactions = $this->creditTransactions()
            ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
            ->where('type', CreditTransaction::TYPE_PACKAGE)
            ->where('status', CreditTransaction::STATUS_ACTIVE)
            ->get();
            
        return $activeTransactions->sum(function($transaction) {
            return max(0, $transaction->amount - $transaction->usage);
        });
    }

    public function getAvailableCreditsAttribute()
    {
        return $this->subscription_credits + $this->package_credits;
    }

    public function organization()
    {
        return $this->hasOne(Organization::class);
    }

    public function deductCredits($amount)
    {
        $remainingAmount = $amount;
        
        $subscriptionTransactions = $this->creditTransactions()
            ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
            ->where('type', CreditTransaction::TYPE_SUBSCRIPTION)
            ->where('status', CreditTransaction::STATUS_ACTIVE)
            ->orderBy('created_at', 'asc')
            ->get();
            
        foreach ($subscriptionTransactions as $transaction) {
            $deducted = $transaction->deductCredits($remainingAmount);
            $remainingAmount -= $deducted;
            
            if ($remainingAmount <= 0) {
                break;
            }
        }
        
        if ($remainingAmount > 0) {
            $packageTransactions = $this->creditTransactions()
                ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
                ->where('type', CreditTransaction::TYPE_PACKAGE)
                ->where('status', CreditTransaction::STATUS_ACTIVE)
                ->orderBy('created_at', 'asc')
                ->get();
                
            foreach ($packageTransactions as $transaction) {
                $deducted = $transaction->deductCredits($remainingAmount);
                $remainingAmount -= $deducted;
                
                if ($remainingAmount <= 0) {
                    break;
                }
            }
        }
        
        if ($remainingAmount > 0) {
            throw new \Exception(__('messages.insufficient_credits'));
        }
        
        return true;
    }

    public function availablePlans()
    {
        return $this->belongsToMany(SubscriptionPlan::class, 'plan_user');
    }
}
