<?php

namespace App\Http\Controllers;

use App\Http\Resources\CreditTransactionResource;
use App\Models\CreditPackage;
use App\Models\CreditTransaction;
use App\Repositories\CreditTransactionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CreditTransactionController extends Controller
{
    protected $transactionRepository;

    public function __construct(CreditTransactionRepository $transactionRepository) {
        $this->transactionRepository = $transactionRepository;
    }

    public function index(Request $request)
    {
       
        $transactions = $this->transactionRepository->getUserTransactionsPaginated(
            $request->user(),
            $request->perPage ?? 10,
            $request->search ?? '',
            $request->orderBy ?? 'created_at',
            $request->orderDir ?? 'desc'
        );
            
        $transactions->setCollection($transactions->getCollection());
        if ($request->wantsJson()) {  
            return CreditTransactionResource::collection($transactions);
        }

        return Inertia::render('CreditTransactions/Index', [
            'data' => $transactions,
            'availableCredits' => $this->transactionRepository->getUserAvailableCredits($request->user()),
        ]);
    }

    public function show(Request $request, CreditTransaction $creditTransaction)
    {
        if ($creditTransaction->user_id !== $request->user()->id && !$request->user()->role === 'admin') {
            abort(403);
        }
        return new CreditTransactionResource($creditTransaction->load('transactionable'));
    }

    public function getBalance(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'available_credits' => $this->transactionRepository->getUserAvailableCredits($user),
            'subscription_credits' => $this->transactionRepository->getUserSubscriptionCredits($user),
            'package_credits' => $this->transactionRepository->getUserPackageCredits($user)
        ]);
    }

    public function purchase(Request $request, CreditPackage $creditPackage)
    {
        if (!$creditPackage->is_active) {
            return response()->json([
                'message' => __('messages.package_not_active')
            ], 400);
        }

        $user = $request->user();
        
        // Check if user has an active subscription
        if (!$user->activeSubscription()) {
            return response()->json([
                'message' => __('messages.active_subcsription_required')
            ], 403);
        }
        
        try {
            $stripe = new \Stripe\StripeClient(config('cashier.secret'));
            
            $paymentIntent = $stripe->paymentIntents->create([
                'amount' => $creditPackage->price * 100,
                'currency' => config('cashier.currency', 'eur'),
                //'customer' => $user->stripe_id,
                'metadata' => [
                    'user_id' => $user->id,
                    'credit_package_id' => $creditPackage->id,
                    'credits' => $creditPackage->credits,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'package' => $creditPackage,
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'message' => __('messages.failed_to_create_payment_intent')
            ], 500);
        }
    }

    public function confirmPurchase(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);
    
        try {
            $stripe = new \Stripe\StripeClient(config('cashier.secret'));
            $paymentIntent = $stripe->paymentIntents->retrieve($request->payment_intent_id);
            
            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'message' => __('messages.payment_intent_not_succeeded')
                ], 400);
            }
            
            $user = $request->user();
            $packageId = $paymentIntent->metadata->credit_package_id;
            $creditPackage = \App\Models\CreditPackage::findOrFail($packageId);
            
            DB::beginTransaction();
    
            $transaction = CreditTransaction::create([
                'user_id' => $user->id,
                'amount' => $creditPackage->credits,
                'type' => 'package_credit',
                'transaction_type' => 'purchase',
                'metadata' => [
                    'package_id' => $creditPackage->id,
                    'package_name' => $creditPackage->name,
                    'price' => $creditPackage->price,
                    'payment_intent_id' => $paymentIntent->id,
                ],
                'transactionable_type' => get_class($creditPackage),
                'transactionable_id' => $creditPackage->id,
            ]);
    
            DB::commit();
    
            return response()->json([
                'message' => __('messages.purchase_confirmed'),
                'data' => $transaction,
                'available_credits' => $user->available_credits
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                Log::error($e->getMessage()),
                'message' => __('messages.failed_to_confirm_purchase')
            ], 500);
        }
    }
}