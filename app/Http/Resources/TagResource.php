<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
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
            'user_id' => $this->user_id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,

            'user' => new UserResource($this->user),
            'organization' => new OrganizationResource($this->organization),
            'subscribers' => SubscriberResource::collection($this->subscribers),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
