<?php

namespace App\Services;

use App\Models\CreditPackage;
use App\Models\CreditTransaction;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreditService
{

    public function addSubscriptionCredits(User $user, Subscription $subscription, int $amount, $description = null)
    {
        return $this->createTransaction(
            $user,
            CreditTransaction::TYPE_SUBSCRIPTION,
            CreditTransaction::TRANSACTION_PURCHASE,
            $amount,
            $description,
            $subscription
        );
    }

    public function addPackageCredits(User $user, CreditPackage $creditPackage, int $amount, $description = null)
    {
        return $this->createTransaction(
            $user,
            CreditTransaction::TYPE_PACKAGE,
            CreditTransaction::TRANSACTION_PURCHASE,
            $amount,
            $description,
            $creditPackage
        );
    }

    public function useCredits(User $user, int $amount, $description = null, $metadata = null)
    {
        if ($user->available_credits < $amount) {
            throw new \Exception(__('messages.insufficient_credits'));
        }

        return $user->deductCredits($amount);
    }

    private function createTransaction(
        User $user,
        string $type,
        string $transactionType,
        int $amount,
        ?string $description = null,
        $transactionable = null,
        ?array $metadata = null
    ) {
        return DB::transaction(function () use ($user, $type, $transactionType, $amount, $description, $transactionable, $metadata) {
            return CreditTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'transaction_type' => $transactionType,
                'amount' => $amount,
                'usage' => 0,
                'status' => CreditTransaction::STATUS_ACTIVE,
                'description' => $description,
                'transactionable_type' => $transactionable ? get_class($transactionable) : null,
                'transactionable_id' => $transactionable ? $transactionable->id : null,
                'metadata' => $metadata,
            ]);
        });
    }

    public function getCreditHistory(User $user)
    {
        return $user->creditTransactions()
            ->with('transactionable')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function adjustUserCredits(User $user, int $amount)
    {
        if ($amount < 0 && $user->available_credits < abs($amount)) {
            throw new \Exception(__('messages.insufficient_credits'));
        }
        
        if ($amount < 0) {
            return $user->deductCredits(abs($amount));
        }
        
        return true;
    }
}