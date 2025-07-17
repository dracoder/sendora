<?php

namespace Database\Seeders;

use App\Models\Config;
use App\Models\Country;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionProduct;
use FFI;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SubscriptionPlanTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Sendora SAAS Plan',
                'plans' => [
                    [
                        'name' => 'Silver',
                        'interval' => 'month',
                        'interval_count' => 1,
                        'is_custom_price' => false,
                        'price' => 12.00,
                        'description' => 'Good for small sized businesses',
                        'features' => [
                            "Unlimited phone calls",
                            "30 second checks",
                            "Single-user account",
                            "20 monitors",
                            "Up to 6 seats",
                        ],
                        'monthly_credits' => 100,
                        'is_upgradable' => true,
                    ],
                    [
                        'name' => 'Silver',
                        'interval' => 'year',
                        'interval_count' => 1,
                        'is_custom_price' => false,
                        'price' => 120.00,
                        'description' => 'Good for small sized businesses',
                        'features' => [
                            "Unlimited phone calls",
                            "30 second checks",
                            "Single-user account",
                            "20 monitors",
                            "Up to 6 seats",
                        ],
                        'monthly_credits' => 1000,
                        'is_upgradable' => true,
                    ],
                    [
                        'name' => 'Gold',
                        'interval' => 'month',
                        'interval_count' => 1,
                        'is_custom_price' => false,
                        'price' => 28.00,
                        'description' => 'Good for large sized businesses',
                        'features' => [
                            "Unlimited phone calls",
                            "30 second checks",
                            "Single-user account",
                            "20 monitors",
                            "Up to 6 seats",
                        ],
                        'monthly_credits' => 250,
                        'is_popular' => true,
                    ],
                    [
                        'name' => 'Gold',
                        'interval' => 'year',
                        'interval_count' => 1,
                        'is_custom_price' => false,
                        'price' => 280.00,
                        'description' => 'Good for large sized businesses',
                        'features' => [
                            "Unlimited phone calls",
                            "30 second checks",
                            "Single-user account",
                            "20 monitors",
                            "Up to 6 seats",
                        ],
                        'monthly_credits' => 3000,
                        'is_popular' => true,
                    ],
                    [
                        'name' => 'Platinum',
                        'interval' => 'month',
                        'interval_count' => 1,
                        'is_custom_price' => true,
                        'price_per_unit' => 0.0004,
                        'description' => 'Good for giant sized businesses',
                        'features' => [
                            "Unlimited phone calls",
                            "30 second checks",
                            "Single-user account",
                            "20 monitors",
                            "Up to 6 seats",
                        ],
                       'monthly_credits' => 20,
                    ]
                ]
            ]
        ];

        $stripe = new \Stripe\StripeClient(config('cashier.secret'));
        $subscriptionProduct = null;
        foreach ($products as $product) {
            $subscriptionProduct = null;
            
            $existingProduct = SubscriptionProduct::where('name', $product['name'])
                ->orWhere('key', Str::slug($product['name'], '_'))
                ->first();
                
            if ($existingProduct) {
                $subscriptionProduct = $existingProduct;
                
                // Verify the Stripe product exists
                try {
                    $stripe->products->retrieve($existingProduct->stripe_id);
                } catch (\Exception $e) {
                    $subscriptionProduct = null;
                }
            }
            
            if (!$subscriptionProduct) {
                $stripeProductExists = false;
                foreach ($stripe->products->all(['limit' => 100]) as $stripeProduct) {
                    if ($stripeProduct->name == $product['name']) {
                        $subscriptionProduct = SubscriptionProduct::updateOrCreate(
                            ['stripe_id' => $stripeProduct->id],
                            [
                                'name' => $product['name'],
                                'key' => Str::slug($product['name'], '_'),
                            ]
                        );
                        $stripeProductExists = true;
                        break;
                    }
                }
                
                // Create new product if not found in Stripe
                if (!$stripeProductExists) {
                    $stripeProduct = $stripe->products->create([
                        'name' => $product['name']
                    ]);
                    $subscriptionProduct = SubscriptionProduct::updateOrCreate(
                        ['key' => Str::slug($product['name'], '_')],
                        [
                            'name' => $product['name'],
                            'stripe_id' => $stripeProduct->id,
                        ]
                    );
                }
            }

            foreach ($product['plans'] as $planData) {
                $frequency = $planData['interval'] == 'month' ? 'monthly' : 'yearly';
                
                // Check if plan exists in the db
                $subscriptionPlan = SubscriptionPlan::query()
                    ->where('name', $planData['name'])
                    ->where('frequency', $frequency)
                    ->where('subscription_product_id', $subscriptionProduct->id)
                    ->first();
                    
                if (!$subscriptionPlan) {
                    // Create the plan in the db with a temporary stripe_id
                    if ($planData['is_custom_price']) {
                        $subscriptionPlan = SubscriptionPlan::create([
                            'subscription_product_id' => $subscriptionProduct->id,
                            'name' => $planData['name'],
                            'description' => $planData['description'],
                            'frequency' => 'monthly',
                            'is_custom_price' => $planData['is_custom_price'],
                            'price_per_unit' => $planData['price_per_unit'],
                            'stripe_id' => '.',
                            'is_popular' => $planData['is_popular'] ?? false,
                            'is_upgradable' => $planData['is_upgradable'] ?? false,
                            'features' => $planData['features'] ?? null,
                        ]);

                        // Create the plan in Stripe
                        try {
                            $stripePlan = $stripe->plans->create([
                                'product' => $subscriptionProduct->stripe_id,
                                'nickname' => $planData['name'],
                                'interval' => 'month',
                                'interval_count' => 1,
                                'usage_type' => 'licensed',
                                'billing_scheme' => 'per_unit',
                                'amount_decimal' => $planData['price_per_unit'] * 100,
                                'currency' => config('cashier.currency'),
                            ]);
                            
                            // Update the plan with the actual stripe_id
                            $subscriptionPlan->update(['stripe_id' => $stripePlan->id]);
                        } catch (\Exception $e) {
                            Log::error($e->getMessage());
                            $subscriptionPlan->delete();
                        }
                    } else {
                        $subscriptionPlan = SubscriptionPlan::create([
                            'subscription_product_id' => $subscriptionProduct->id,
                            'name' => $planData['name'],
                            'description' => $planData['description'],
                            'frequency' => $frequency,
                            'price' => $planData['price'],
                            'stripe_id' => '.',
                            'is_popular' => $planData['is_popular'] ?? false,
                            'is_upgradable' => $planData['is_upgradable'] ?? false,
                            'features' => $planData['features'] ?? null,
                            'monthly_credits' => $planData['monthly_credits'] ?? 0,
                        ]);

                        // Create the plan in Stripe
                        try {
                            $stripePlan = $stripe->plans->create([
                                'product' => $subscriptionProduct->stripe_id,
                                'nickname' => $planData['name'],
                                'interval' => $planData['interval'],
                                'interval_count' => 1,
                                'amount' => $planData['price'] * 100,
                                'currency' => config('cashier.currency'),
                            ]);
                            
                            // Update the plan with the actual stripe_id
                            $subscriptionPlan->update(['stripe_id' => $stripePlan->id]);
                        } catch (\Exception $e) {
                            Log::error($e->getMessage());
                            $subscriptionPlan->delete();
                        }
                    }
                }
            }
        }

        // Check if credits product already exists
        $creditsProduct = SubscriptionProduct::where('key', 'credits')->first();
        
        if (!$creditsProduct) {
            try {
                $stripeCreditsProduct = $stripe->products->create([
                    'name' => 'Sendora SAAS Credits'
                ]);

                $creditsProduct = SubscriptionProduct::create([
                    'name' => 'Credits',
                    'key' => 'credits',
                    'stripe_id' => $stripeCreditsProduct->id,
                ]);

                $priceCredits = $stripe->prices->create([
                    'product' => $stripeCreditsProduct->id,
                    'unit_amount' => config('cashier.credit_price') * 100,
                    'currency' => config('cashier.currency'),
                    'nickname' => 'Credits',
                ]);

                Config::updateOrCreate(
                    ['key' => 'credits_price'],
                    [
                        'value' => config('cashier.credit_price'),
                        'type' => 'text',
                        'description' => 'The price of each credit',
                    ]
                );

                Config::updateOrCreate(
                    ['key' => 'credits_stripe_id'],
                    [
                        'value' => $priceCredits->id,
                        'type' => 'text',
                        'description' => 'The stripe id of the credits product',
                    ]
                );
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
        }
    }
}
