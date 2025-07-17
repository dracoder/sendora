<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriberCampaignEmailResource extends JsonResource
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
            'subscriber_campaign_id' => $this->subscriber_campaign_id,
            'subscriber_id' => $this->subscriber_id,
            'campaign_id' => $this->campaign_id,
            'email_id' => $this->email_id,
            'scheduled_at' => $this->scheduled_at,
            'sent' => $this->sent,
            'sent_at' => $this->sent_at,
            'retry' => $this->retry,
            'exception' => $this->exception,
            'failed_at' => $this->failed_at,
            'opened' => $this->opened,
            'opened_at' => $this->opened_at,

            'subscriberCampaign' => new SubscriberCampaignResource($this->whenLoaded('subscriberCampaign')),
            'subscriber' => new SubscriberResource($this->whenLoaded('subscriber')),
            'campaign' => new CampaignResource($this->whenLoaded('campaign')),
            'email' => new EmailResource($this->whenLoaded('email')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
