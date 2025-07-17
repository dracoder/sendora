<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'owner_name' => $this->owner_name,
            'phone' => $this->phone,

            'user' => new UserResource($this->whenLoaded('user')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'settings' => new OrganizationSettingResource($this->whenLoaded('settings')),
            'subscribers' => SubscriberResource::collection($this->whenLoaded('subscribers')),
            'templates' => TemplateResource::collection($this->whenLoaded('templates')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
