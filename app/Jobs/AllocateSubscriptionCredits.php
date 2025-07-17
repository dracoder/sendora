<?php

namespace App\Jobs;

use App\Repositories\CreditRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AllocateSubscriptionCredits implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function handle(): void
    {
        $creditRepository = new CreditRepository();
        $activeSubscriptions = $creditRepository->getActiveSubscriptionsForCredits();

        foreach ($activeSubscriptions as $subscription) {
            try {
                // Get the monthly credit allocation from the subscription plan
                $monthlyCredits = $subscription->subscription_plan->monthly_credits ?? 0;
                
                if ($monthlyCredits > 0 && $subscription->user) {
                    $creditRepository->addSubscriptionCredits(
                        $subscription->user,
                        $subscription,
                        $monthlyCredits,
                        'Monthly subscription credits'
                    );
                    
                    Log::info("Added {$monthlyCredits} monthly credits to user {$subscription->user_id} for subscription {$subscription->id}");
                }
            } catch (\Exception $e) {
                Log::error("Failed to allocate monthly credits for subscription {$subscription->id}: " . $e->getMessage());
            }
        }
    }
}