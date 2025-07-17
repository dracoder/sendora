<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
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
            'name' => $this->name,
            'organization_id' => $this->organization_id,
            'template_id' => $this->template_id,
            'start_at' => $this->start_at,
            'is_active' => $this->is_active,
            'description' => $this->description,
            'start_at' => $this->start_at,

            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'template' => new TemplateResource($this->whenLoaded('template')),
            'emails' => EmailResource::collection($this->whenLoaded('emails')),
            'skip_dates' => CampaignSkipDateResource::collection($this->whenLoaded('skip_dates')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'subscriberCampaigns' => SubscriberCampaignResource::collection($this->whenLoaded('subscriberCampaigns')),

            'subscribers_count' => $this->subscribersCount(),
            'subscribers_list' => $this->subscribersList(),
            'opened_count' => $this->whenLoaded('subscriberCampaigns', function() {
                return $this->subscriberCampaigns->where('opened', 1)->count();
            }, 0),
            
            'open_stats' => $this->when(isset($this->open_stats), $this->open_stats),
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
