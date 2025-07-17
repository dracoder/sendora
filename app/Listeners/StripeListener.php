<?php

namespace App\Listeners;

use App\Jobs\AllocateSubscriptionCredits;
use App\Mail\PaymentFailed;
use App\Models\Subscription;
use App\Models\User;
use App\Repositories\CreditRepository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Cashier\Billable;
use Laravel\Cashier\Events\WebhookReceived;
use Stripe\Customer;
use Stripe\Invoice;
use Stripe\Stripe;

class StripeListener
{
    use InteractsWithQueue, Billable;
    /**
     * Handle the event. This listener will be fired when a Stripe webhook event is received.
     */
    public function handle(WebhookReceived $event): void
    {
        // On Subscription Renewal [Event: invoice.payment_succeeded]
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            $this->handleInvoiceSuccess($event->payload);
        }
        $payload = $event->payload;

        if ($payload['type'] === 'invoice.payment_failed' || $payload['type'] === 'invoice.overdue') {
            $this->handlePaymentFailed($payload);
        }
    }

    public function handleInvoiceSuccess($payload)
    {
        $billingReason = $payload['data']['object']['billing_reason'];

        // If Billing Reason is subscription_cycle
        if ($payload['data'] && isset($payload['data']['object']['billing_reason']) && $payload['data']['object']['billing_reason'] && $billingReason == "subscription_cycle") {
            $subscriptionId = $payload['data']['object']['subscription'];
            $subscription = ($subscriptionId) ? Subscription::where('stripe_id', $subscriptionId)->first() : null;

            if ($subscription) {
                if ($subscription->stripe_status == 'pastDue') {
                    $subscription->stripe_status = 'active';
                    $subscription->save();
                }
                
                // Allocate new credits for the renewed subscription
                $this->allocateRenewalCredits($subscription);
            }
        }
    }

    protected function handlePaymentFailed($payload)
    {
        Stripe::setApiKey(config('cashier.secret'));

        $customer = Customer::retrieve($payload['data']['object']['customer']);
        $user = User::where('stripe_id', $customer->id)->first();
        if (!$user) {
            Log::error('Payment failed not found user', $payload);
            return;
        }

        $subscription = $user->activeSubscription();
        $subscription->stripe_status = 'pastDue';
        $subscription->save();

        $invoice = Invoice::retrieve($payload['data']['object']['id']);

        Mail::send(new PaymentFailed($user, $invoice));
    }
    
    protected function allocateRenewalCredits(Subscription $subscription)
    {
        try {
            $creditRepository = new CreditRepository();
            
            $expiredCount = $creditRepository->expireSubscriptionCredits();
            Log::info("Expired {$expiredCount} credit transactions during renewal for subscription {$subscription->id}");
            
            $monthlyCredits = $subscription->subscription_plan->monthly_credits ?? 0;
            
            if ($monthlyCredits > 0 && $subscription->user) {
                $creditRepository->addSubscriptionCredits(
                    $subscription->user,
                    $subscription,
                    $monthlyCredits,
                    'Subscription renewal credits'
                );
                
                Log::info("Added {$monthlyCredits} renewal credits to user {$subscription->user_id} for subscription {$subscription->id}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to allocate renewal credits for subscription {$subscription->id}: " . $e->getMessage());
        }
    }
}
