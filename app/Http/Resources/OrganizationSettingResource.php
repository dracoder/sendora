<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationSettingResource extends JsonResource
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
            'organization_id' => $this->organization_id,
            'daily_limit' => $this->daily_limit,
            'smtp' => $this->smtp,

            'organization' => new OrganizationResource($this->whenLoaded('organization')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
