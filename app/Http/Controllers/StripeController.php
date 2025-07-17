<?php

namespace App\Http\Controllers;

use App\Http\Requests\StripeSubscribeRequest;
use App\Http\Resources\UserDetailResource;
use App\Models\Config;
use App\Models\Country;
use App\Models\SubscriptionPlan;
use App\Repositories\CreditRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use Stripe\StripeClient;
use Inertia\Inertia;
use Inertia\Response;

class StripeController extends Controller
{
    public function subscribe(Request $request): Response
    {
        $user = $request->user();
    
        // create stripe customer to set stripe_id
        if (!$user->stripe_id) {
            $stripe = new StripeClient(config('cashier.secret'));
            $customer = $stripe->customers->create([
                'email' => $user->email,
                'name' => $user->name,
            ]);
    
            $user->stripe_id = $customer->id;
            $user->save();
        }
    
        $activeSubscription = $user ? $user->activeSubscription() : false;
    
        $plans = [];
    
        $dbPlans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->where(function($query) use ($user) {
                $query->where('is_private', false)
                      ->orWhereHas('users', function($q) use ($user) {
                          $q->where('users.id', $user->id);
                      });
            })
            ->get();
            
        $dbPlansHandled = [];
        foreach ($dbPlans as $plan) {
            if (!isset($dbPlansHandled[$plan->name])) {
                $dbPlansHandled[$plan->name] = [];
            }
            $dbPlansHandled[$plan->name][$plan->frequency] = $plan;
        }
    
        foreach ($dbPlansHandled as $plan) {
            $referencePlan = null;
            if (isset($plan['monthly'])) {
                $referencePlan = $plan['monthly'];
            } else {
                $referencePlan = $plan['yearly'];
            }
            $cta = '';
            $disabled = false;
            if ($activeSubscription && $activeSubscription->type === $referencePlan->name) {
                $cta = Lang::get('messages.current_plan');
                $disabled = true;
            } elseif ($activeSubscription && $activeSubscription->type !== $referencePlan->name) {
                $cta = Lang::get('messages.switch_to_this_plan');
            } else {
                $cta = Lang::get('messages.get_started');
            }
            $plans[] = [
                'id' => $referencePlan->id,
                'name' => $referencePlan->name,
                'stripe' => [
                    'monthly' => isset($plan['monthly']) ? $plan['monthly']->stripe_id : null,
                    'yearly' => isset($plan['yearly']) ? $plan['yearly']->stripe_id : null,
                ],
                'is_custom_price' => $referencePlan->is_custom_price,
                'price' => [
                    'monthly' => isset($plan['monthly']) ? $plan['monthly']->price : null,
                    'yearly' => isset($plan['yearly']) ? $plan['yearly']->price : null,
                ],
                'price_per_unit' => $referencePlan->price_per_unit,
                'description' => $referencePlan->description,
                'is_popular' => $referencePlan->is_popular,
                'features' => $referencePlan->features,
                'cta' => $cta,
                'disabled' => $disabled,
            ];
        }
    
        $plans[] = [
            'id' => 'free',
            'name' => Lang::get('plans.credits.name'),
            'stripe_id' => Config::where('key', 'credits_stripe_id')->first()->value,
            'price' => [
                'monthly' => Lang::get('plans.credits.price'),
                'yearly' => Lang::get('plans.credits.price'),
            ],
            'is_custom_price' => true,
            'description' => Lang::get('plans.credits.description'),
            'price_per_unit' => Config::where('key', 'credits_price')->first()->value,
            'features' => [],
            'cta' => Lang::get('plans.credits.cta'),
            'highlighted' => true,
        ];
    
        if ($activeSubscription) {
            $stripe = new StripeClient(config('cashier.secret'));
            
            try {
                $sub = $stripe->subscriptions->retrieve($activeSubscription->stripe_id);
                
                // Only update if subscription exists in Stripe
                $stripe->subscriptions->update(
                    $activeSubscription->stripe_id,
                    ['cancel_at_period_end' => true]
                );
                
                $activeSubscription->update([
                    'stripe_status' => 'cancelled',
                    'ends_at' => date('Y-m-d H:i:s', $sub->cancel_at),
                ]);
            } catch (\Stripe\Exception\ApiErrorException $e) {
                // If subscription doesn't exist in Stripe, mark it as cancelled in our database
                if ($e->getStripeCode() === 'resource_missing') {
                    $activeSubscription->update([
                        'stripe_status' => 'cancelled',
                        'ends_at' => now(),
                    ]);
                }
            }
            
            // Expire existing subscription credits when changing plans
            $creditRepository = new CreditRepository();
            $creditRepository->expireSubscriptionCredits($user->id);
        }
    
        $billingData = $user->details()->orderBy('id', 'desc')->first();
    
        return Inertia::render('Subscribe', [
            'plans' => $plans,
            'billing_data' => $billingData ? (new UserDetailResource($billingData)) : null
        ]);
    }

    public function createSetupIntent(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $intent = $user->createSetupIntent([
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return response()->json([
            'client_secret' => $intent->client_secret
        ]);
    }

    public function createSubscription(StripeSubscribeRequest $request)
    {
        $user = $request->user();
        $billingData = $request->billing_details;

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $setup = $user->findSetupIntent($request->setup_intent_id);

        if (!$setup) {
            return response()->json(['message' => 'Invalid setup intent'], 400);
        }

        if ($setup->status !== 'succeeded') {
            return response()->json(['message' => 'Invalid setup intent status'], 400);
        }

        if ($request->has('is_credits') && $request->is_credits) {
            $user->update([
                'total_credits' => $user->total_credits + $billingData['emails_amount'],
            ]);
    
            $user->creditPurchases()->create([
                'credits' => $billingData['emails_amount'],
                'price' => $request->plan['price_per_unit'] * $billingData['emails_amount'],
            ]);
    
            return response()->json([
                'credit_purchase' => $user->creditPurchases->last()->first()
            ]);
        }
    
        $plan = SubscriptionPlan::query()->where('stripe_id', $request->plan)->first();
    
        if (!$plan) {
            return response()->json(['message' => 'Invalid plan'], 400);
        }
    
        $activeSubscription = $user->activeSubscription();
    
        // Handle existing subscription
        if ($activeSubscription) {
            $stripe = new StripeClient(config('cashier.secret'));
            $sub = $stripe->subscriptions->retrieve($activeSubscription->stripe_id);
            $stripe->subscriptions->update(
                $activeSubscription->stripe_id,
                ['cancel_at_period_end' => true]
            );
            $activeSubscription->update([
                'stripe_status' => 'cancelled',
                'ends_at' => date('Y-m-d H:i:s', $sub->cancel_at),
            ]);
            
            // Expire existing subscription credits when changing plans
            $creditRepository = new CreditRepository();
            $creditRepository->expireSubscriptionCredits($user->id);
        }
    
        // Create new subscription
        if ($plan->is_custom_price) {
            $subscription = $user->newSubscription($plan->name, $plan->stripe_id)
                ->quantity($billingData['emails_amount'])
                ->create($setup->payment_method, [
                    'name' => $billingData['first_name'] . ' ' . $billingData['last_name'],
                    'email' => $billingData['email'],
                    'phone' => $billingData['phone'],
                    'address' => [
                        'line1' => $billingData['address'],
                        'city' => $billingData['city'],
                        'state' => $billingData['state'],
                        'postal_code' => $billingData['postal_code'],
                        'country' => $billingData['country_code']
                    ]
                ]);
        } else {
            $subscription = $user->newSubscription($plan->name, $plan->stripe_id)
                ->create($setup->payment_method, [
                    'name' => $billingData['first_name'] . ' ' . $billingData['last_name'],
                    'email' => $billingData['email'],
                    'phone' => $billingData['phone'],
                    'address' => [
                        'line1' => $billingData['address'],
                        'city' => $billingData['city'],
                        'state' => $billingData['state'],
                        'postal_code' => $billingData['postal_code'],
                        'country' => $billingData['country_code']
                    ]
                ]);
        }
    
        // Add initial subscription credits
        if ($subscription && $plan->monthly_credits > 0) {
            $creditRepository = new CreditRepository();
            $creditRepository->addSubscriptionCredits(
                $user,
                $subscription,
                $plan->monthly_credits,
                'Initial subscription credits'
            );
        }
    
        $user->details()->updateOrCreate([
            'first_name' => $billingData['first_name'],
            'last_name' => $billingData['last_name'],
            'email' => $billingData['email'],
            'phone' => $billingData['phone'],
            'address' => $billingData['address'] ?? null,
            'city' => $billingData['city'] ?? null,
            'state' => $billingData['state'] ?? null,
            'postal_code' => $billingData['postal_code'] ?? null,
            'country_code' => $billingData['country_code'] ?? null,
            'tax_code' => $billingData['tax_code'] ?? null,
            'vat_number' => $billingData['vat_number'] ?? null,
            'pec' => $billingData['pec'] ?? null,
            'sdi' => $billingData['sdi'] ?? null
        ]);
    
        return response()->json([
            'subscription' => $subscription
        ]);
    }

    public function paymentHistory(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $stripe = new StripeClient(config('cashier.secret'));

        // $invoices = $stripe->invoices->all([
        //     'customer' => $user->stripe_id,
        //     ['expand' => ['data.subscription.plan.product']]
        // ]);

        $charges = $stripe->charges->all([
            'customer' => $user->stripe_id,
            ['expand' => ['data.customer', 'data.invoice.subscription']]
        ]);

        $payments = [];

        foreach ($charges->data as $charge) {
            if ($charge->invoice && $charge->invoice->subscription && $charge->invoice->subscription->plan && $charge->invoice->subscription->plan->id) {
                $subscription = SubscriptionPlan::query()->where('stripe_id', $charge->invoice->subscription->plan->id)->first();
                $charge['subscription'] = $subscription;
            }
            $payments[] = $charge;
        }

        return response()->json($payments);
    }

    public function cancelSubscription(Request $request)
    {
        // https://docs.stripe.com/billing/subscriptions/cancel#cancel-at-the-end-of-the-current-billing-cycle
        $user = $request->user();
    
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $subscription = $user->activeSubscription();
    
        if (!$subscription) {
            return response()->json(['message' => 'No subscription found'], 400);
        }
    
        $stripe = new StripeClient(config('cashier.secret'));
        $sub = $stripe->subscriptions->retrieve($subscription->stripe_id);
    
        $stripe->subscriptions->update(
            $subscription->stripe_id,
            ['cancel_at_period_end' => true]
        );
    
        $subscription->update([
            'stripe_status' => 'cancelled', // maybe with webhook, it's not necessary
            'ends_at' => date('Y-m-d H:i:s', $sub->cancel_at),
        ]);

        return response()->json(['message' => 'Subscription cancelled']);
    }

    public function updatePaymentMethod(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscription = $user->activeSubscription();

        if (!$subscription) {
            return response()->json(['message' => 'No subscription found'], 400);
        }

        $stripe = new StripeClient(config('cashier.secret'));

        $cus = $stripe->customers->retrieve($user->stripe_id);

        $sub = $stripe->subscriptions->retrieve(
            $subscription->stripe_id,
            ['expand' => ['default_payment_method']]
        );

        dd($sub);

        $data = $stripe->paymentMethods->update(
            $request->payment_method,
            ['expand' => ['data.link']]
        );

        dd($data);

        return response()->json([
            'link' => $intent->client_secret
        ]);
    }


    public function handleSubscriptionRenewal($subscriptionId)
    {
        $subscription = \App\Models\Subscription::where('stripe_id', $subscriptionId)->first();
        
        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }
        
        $user = $subscription->user;
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        $plan = $subscription->subscription_plan;
        
        if (!$plan) {
            return response()->json(['message' => 'Subscription plan not found'], 404);
        }
        
        // Expire old subscription credits
        $creditRepository = new CreditRepository();
        $creditRepository->expireSubscriptionCredits($user->id);
        
        // Allocate new credits for the renewed subscription
        if ($plan->monthly_credits > 0) {
            $creditRepository->addSubscriptionCredits(
                $user,
                $subscription,
                $plan->monthly_credits,
                'Subscription renewal credits'
            );
        }
        
        return response()->json([
            'message' => 'Subscription renewed and credits allocated',
            'subscription_id' => $subscriptionId,
            'credits_allocated' => $plan->monthly_credits
        ]);
    }
    
    public function checkSubscriptionStatus(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $subscription = $user->activeSubscription();
        
        if (!$subscription) {
            return response()->json([
                'status' => 'no_subscription',
                'message' => 'No active subscription found'
            ]);
        }
        
        $creditRepository = new CreditRepository();
        $needsRenewal = $creditRepository->needsRenewal($subscription);
        
        if ($needsRenewal) {
            return response()->json([
                'status' => 'needs_renewal',
                'message' => 'Subscription needs renewal',
                'subscription' => $subscription
            ]);
        }
        
        $lastCreditTransaction = \App\Models\CreditTransaction::where('user_id', $user->id)
            ->where('subscription_id', $subscription->id)
            ->where('transaction_type', \App\Models\CreditTransaction::TRANSACTION_PURCHASE)
            ->where('type', \App\Models\CreditTransaction::TYPE_SUBSCRIPTION)
            ->orderBy('created_at', 'desc')
            ->first();
        
        $shouldAllocateCredits = false;
        
        if (!$lastCreditTransaction) {
            $shouldAllocateCredits = true;
        } else {
            $currentBillingCycleStart = $subscription->created_at->copy();
            while ($currentBillingCycleStart->lt(now())) {
                $nextCycle = $subscription->frequency === 'monthly' 
                    ? $currentBillingCycleStart->copy()->addMonth() 
                    : $currentBillingCycleStart->copy()->addYear();
                
                if ($currentBillingCycleStart->lte(now()) && $nextCycle->gt(now())) {
                    break;
                }
                
                $currentBillingCycleStart = $nextCycle;
            }
            
            $shouldAllocateCredits = $lastCreditTransaction->created_at->lt($currentBillingCycleStart);
        }
        
        if ($shouldAllocateCredits) {
            $plan = $subscription->subscription_plan;
            
            if ($plan && $plan->monthly_credits > 0) {
                // Expire old credits first
                $creditRepository->expireSubscriptionCredits($user->id);
                
                // Add new credits
                $creditRepository->addSubscriptionCredits(
                    $user,
                    $subscription,
                    $plan->monthly_credits,
                    'New billing cycle credits'
                );
                
                return response()->json([
                    'status' => 'credits_allocated',
                    'message' => 'New credits allocated for current billing cycle',
                    'credits_allocated' => $plan->monthly_credits
                ]);
            }
        }
        
        return response()->json([
            'status' => 'active',
            'message' => 'Subscription is active',
            'subscription' => $subscription,
            'available_credits' => $user->available_credits
        ]);
    }
    
    public function getUserCredits(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $subscriptionCredits = $user->subscription_credits;
        $packageCredits = $user->package_credits;
        $totalCredits = $user->available_credits;
        
        $creditTransactions = \App\Models\CreditTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        $activeSubscription = $user->activeSubscription();
        
        return response()->json([
            'subscription_credits' => $subscriptionCredits,
            'package_credits' => $packageCredits,
            'total_credits' => $totalCredits,
            'credit_transactions' => $creditTransactions,
            'has_active_subscription' => $activeSubscription ? true : false,
            'subscription' => $activeSubscription
        ]);
    }
}
