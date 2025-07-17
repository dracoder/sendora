<?php

namespace App\Http\Resources;

use App\Models\SubscriberCampaignEmail;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriberResource extends JsonResource
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
            'is_subscribed' => $this->is_subscribed,
            'organization_id' => $this->organization_id,
            'email' => $this->email,
            'phone' => $this->phone,
            'title' => $this->title,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email_status' => $this->email_status,
            'company' => $this->company,
            'industry' => $this->industry,
            'location' => $this->location,
            //'profile_picture' => $this->profile_picture,
            'linkedin_url' => $this->linkedin_url,
            'note' => $this->note,

            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'tag_ids' => $this->tag_ids,
            'campaigns' => SubscriberCampaignResource::collection($this->whenLoaded('campaigns')),
            'emails' => SubscriberCampaignEmailResource::collection($this->whenLoaded('emails')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
