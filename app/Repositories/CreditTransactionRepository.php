<?php

namespace App\Repositories;

use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class CreditTransactionRepository
{
    public function getUserTransactionsPaginated( User $user, int $perPage = 10, string $search = '', string $orderBy = 'created_at', string $orderDir = 'desc'): LengthAwarePaginator {
        $query = CreditTransaction::query()
            ->with('transactionable')
            ->where('transaction_type', CreditTransaction::TRANSACTION_PURCHASE);
        
        //if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        //}

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('type', 'like', "%{$search}%");
            });
        }

        return $query->orderBy($orderBy, $orderDir)->paginate($perPage);
    }

    public function getUserSubscriptionCredits(User $user): int
    {
        return $user->subscription_credits;
    }

    public function getUserPackageCredits(User $user): int
    {
        return $user->package_credits;
    }

    public function getUserAvailableCredits(User $user): int
    {
        return $user->available_credits;
    }

    public function createTransaction(
        User $user, $type, $transactionType, int $amount, $description = null, $transactionable = null, $metadata = null): CreditTransaction {
        return CreditTransaction::create([
            'user_id' => $user->id,
            'type' => $type,
            'transaction_type' => $transactionType,
            'amount' => $amount,
            'description' => $description,
            'transactionable_type' => $transactionable ? get_class($transactionable) : null,
            'transactionable_id' => $transactionable ? $transactionable->id : null,
            'metadata' => $metadata,
        ]);
    }
}