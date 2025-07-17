<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'type_translated' => __('messages.'.$this->type),
            'transaction_type' => $this->transaction_type,
            'transaction_type_translated' => __('messages.'.$this->transaction_type),
            'amount' => $this->amount,
            'usage' => $this->usage,
            'status' => $this->status,
            'status_translated' => __('messages.'.$this->status),
            'description' => $this->description,
            'transactionable_type' => $this->transactionable_type,
            'transactionable_id' => $this->transactionable_id,
            'transactionable' => $this->whenLoaded('transactionable'),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}