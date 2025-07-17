<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailResource extends JsonResource
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
            'campaign_id' => $this->campaign_id,
            'is_active' => $this->is_active,
            'title' => $this->title,
            'subject' => $this->subject,
            'content' => $this->content,
            'step' => $this->step,
            'delay_unit' => $this->delay_unit,
            'delay_value' => $this->delay_value,
            'sent_subscribers_count' => $this->when(isset($this->sent_subscribers_count), $this->sent_subscribers_count, 0),

            'campaign' => new CampaignResource($this->whenLoaded('campaign')),
            'subscribersCampaigns' => SubscriberCampaignResource::collection($this->whenLoaded('subscribersCampaigns')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
