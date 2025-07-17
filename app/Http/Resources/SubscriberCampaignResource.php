<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriberCampaignResource extends JsonResource
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
            'subscriber_id' => $this->subscriber_id,
            'campaign_id' => $this->campaign_id,
            'next_at' => $this->next_at,
            'progress' => $this->progress,

            'subscriber' => new SubscriberResource($this->whenLoaded('subscriber')),
            'campaign' => new CampaignResource($this->whenLoaded('campaign')),
            'emails' => EmailResource::collection($this->whenLoaded('emails')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
