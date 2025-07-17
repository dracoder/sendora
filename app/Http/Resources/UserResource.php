<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'is_affiliate' => $this->is_affiliate,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'used_credits' => $this->used_credits,
            'total_credits' => $this->total_credits,

            'details' => UserDetailResource::collection($this->whenLoaded('details')),
            'subscriptions' => SubscriptionResource::collection($this->whenLoaded('subscrpitions')),
            'credit_purchases' => SubscriptionResource::collection($this->whenLoaded('creditPurchases')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
