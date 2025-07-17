<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignSkipDateResource extends JsonResource
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
            'from' => $this->from,
            'to' => $this->to,

            'campaign' => new CampaignResource($this->whenLoaded('campaign')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
