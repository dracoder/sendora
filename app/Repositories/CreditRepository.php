<?php

namespace App\Repositories;

use App\Models\CreditTransaction;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CreditRepository
{

    public function addSubscriptionCredits(User $user, Subscription $subscription, int $amount, string $description = 'Subscription credits'): CreditTransaction
    {
        return CreditTransaction::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'transaction_type' => CreditTransaction::TRANSACTION_PURCHASE,
            'type' => CreditTransaction::TYPE_SUBSCRIPTION,
            'amount' => $amount,
            'description' => $description,
            'status' => CreditTransaction::STATUS_ACTIVE,
            'expires_at' => Carbon::now()->addMonth(),
        ]);
    }

    public function expireSubscriptionCredits($userId = null): int
    {
        $query = CreditTransaction::where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE)
            ->where('type', CreditTransaction::TYPE_SUBSCRIPTION)
            ->where('status', CreditTransaction::STATUS_ACTIVE)
            ->where('expires_at', '<', now());
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $expiredTransactions = $query->get();

        $count = 0;
        foreach ($expiredTransactions as $transaction) {
            $transaction->status = CreditTransaction::STATUS_EXPIRED;
            $transaction->save();
            $count++;
            
            Log::info("Expired subscription credits: Transaction ID {$transaction->id}, User ID {$transaction->user_id}");
        }
        
        return $count;
    }

    public function needsRenewal(Subscription $subscription): bool
    {
        // If subscription is not active, it needs renewal
        if (!in_array($subscription->stripe_status, ['active', 'pastDue'])) {
            return true;
        }
        
        // If subscription has an end date and it's in the past, it needs renewal
        if ($subscription->ends_at && $subscription->ends_at->isPast()) {
            return true;
        }
        
        return false;
    }

    public function getActiveSubscriptionsForCredits()
    {
        return Subscription::whereIn('stripe_status', ['active', 'pastDue'])
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->with(['user', 'subscription_plan'])
            ->get();
    }

    public function handlePlanChange(User $user, Subscription $oldSubscription, Subscription $newSubscription): void
    {
        // Expire credits from old subscription
        $this->expireSubscriptionCredits($user->id);
        
        // Get the new plan
        $newPlan = $newSubscription->subscription_plan;
        
        // Add credits for new subscription
        if ($newPlan && $newPlan->monthly_credits > 0) {
            $this->addSubscriptionCredits(
                $user,
                $newSubscription,
                $newPlan->monthly_credits,
                'Plan change credits'
            );
            
            Log::info("Added {$newPlan->monthly_credits} credits for plan change", [
                'user_id' => $user->id,
                'old_subscription_id' => $oldSubscription->id,
                'new_subscription_id' => $newSubscription->id
            ]);
        }
    }
}