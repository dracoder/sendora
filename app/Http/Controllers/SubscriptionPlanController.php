<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class SubscriptionPlanController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Plans/Index');
    }

    public function create(): Response
    {
        return Inertia::render('Plans/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }
        $stripe = new \Stripe\StripeClient(config('cashier.secret'));

        $fields = app(SubscriptionPlan::class)->getFillable();

        $data = $request->only($fields);

        $data['stripe_id'] = 'temporary';
        $data['key'] = $data['name'];
        $data['is_custom_price'] = false;
        $data['frequency'] = $data['frequency'] ?? 'monthly';
        $subscriptionProduct = SubscriptionProduct::first();
        
        try {
            $stripeProduct = $stripe->products->retrieve($subscriptionProduct->stripe_id);
        } catch (\Exception $e) {
            // If product doesn't exist, create a new one
            try {
                Log::warning("Stripe product not found: {$subscriptionProduct->stripe_id}. Creating a new one.");
                $stripeProduct = $stripe->products->create([
                    'name' => $subscriptionProduct->name
                ]);
                
                // Update the product with the new Stripe ID
                $subscriptionProduct->update([
                    'stripe_id' => $stripeProduct->id
                ]);
                
                Log::info("Created new Stripe product with ID: {$stripeProduct->id}");
            } catch (\Exception $createError) {
                Log::error("Failed to create Stripe product: " . $createError->getMessage());
                return response()->json(['message' => 'Failed to create Stripe product: ' . $createError->getMessage()], 500);
            }
        }
        
        $data['subscription_product_id'] = $subscriptionProduct->id;
        $subscriptionPlan = SubscriptionPlan::create($data);

        try {

            // if ($data['is_custom_price']) {
            //     $plan = $stripe->plans->create([
            //         'product' => $subscriptionProduct->stripe_id,
            //         'nickname' => $subscriptionPlan['name'],
            //         'interval' => 'month',
            //         'interval_count' => 1,
            //         'recurring' => [
            //             'interval' => 'month',
            //             'usage_type' => 'metered',
            //         ],
            //         'billing_scheme' => 'per_unit',
            //         'unit_amount' => $subscriptionPlan['price_per_unit'] * 100,
            //         'currency' => config('cashier.currency'),
            //     ]);
            // } else {

            $plan = $stripe->plans->create([
                'product' => $subscriptionProduct->stripe_id,
                'nickname' => $subscriptionPlan['name'],
                'interval' => str_replace('ly', '', $subscriptionPlan['frequency']),
                'interval_count' => 1,
                'amount' => $subscriptionPlan['price'] * 100,
                'currency' => config('cashier.currency'),
            ]);
        
            //}
           
            $subscriptionPlan->update([
                'stripe_id' => $plan->id
            ]);
        } catch (\Exception $e) {
            // If plan creation fails, delete the subscription plan and return error
            $subscriptionPlan->delete();
            Log::error("Failed to create Stripe plan: " . $e->getMessage());
            return response()->json(['message' => 'Failed to create Stripe plan: ' . $e->getMessage()], 500);
        }

        if ($data['is_private'] && !empty($request->input('user_ids'))) {
            $subscriptionPlan->users()->sync($request->input('user_ids'));
        }

        return response()->json(['message' => 'Subscription plan created successfully']);
    }

    public function show(SubscriptionPlan $plan): Response
    {
        return Inertia::render('Plans/Show', [
            'plan' => new SubscriptionPlanResource($plan),
        ]);
    }

    public function edit(Request $request, SubscriptionPlan $plan): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Plans/Edit', [
            'plan' => new SubscriptionPlanResource($plan),
        ]);
    }

    public function update(Request $request, SubscriptionPlan $plan)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $data = $request->all();
        $plan->update($data);

        if ($plan->stripe_id && $plan->stripe_id !== 'temporary' && $plan->stripe_id !== '.') {
            try {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripeId = trim($plan->stripe_id);
                $stripe->plans->update($stripeId, [
                    'nickname' => $plan->name,
                ]);
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
        }

        if ($plan->is_private) {
            $plan->users()->sync($request->input('user_ids', []));
        } else {
            $plan->users()->detach();
        }

        return response()->json(['message' => 'Subscription plan updated successfully']);
    }

    public function destroy(SubscriptionPlan $plan)
    {
        $stripe_id = trim($plan->stripe_id);
        if ($stripe_id && $stripe_id !== 'temporary' && $stripe_id !== '.') {
            try {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripe->plans->delete($stripe_id);
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
        }
        $plan->delete();
        return response()->json(['message' => 'Subscription plan deleted successfully']);
    }
}
