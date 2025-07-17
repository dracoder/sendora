<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
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
            'subscription_product_id' => $this->subscription_product_id,
            'is_active' => $this->is_active,
            'is_private' => $this->is_private,
            'frequency' => $this->frequency,
            'stripe_id' => $this->stripe_id,
            'name' => $this->name,
            'description' => $this->description,
            'features' => $this->features,
            'is_custom_price' => $this->is_custom_price,
            'price' => $this->price,
            'price_per_unit' => $this->price_per_unit,
            'is_popular' => $this->is_popular,
            'is_upgradable' => $this->is_upgradable,
            'monthly_credits' => $this->monthly_credits,

            'product' => new SubscriptionProductResource($this->whenLoaded('product')),
            'users' => UserResource::collection($this->whenLoaded('users')),
            'user_ids' => $this->when($this->is_private, $this->users->pluck('id')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
