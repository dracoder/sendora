<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'credits' => $this->credits,
            'price' => $this->price,
            'is_active' => $this->is_active,
            'featured' => $this->featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}