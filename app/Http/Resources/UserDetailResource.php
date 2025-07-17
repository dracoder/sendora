<?php

namespace App\Http\Resources;

use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDetailResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country_code' => $this->country_code,
            'country_name' => Country::where('code', $this->country_code)->first() ? Country::where('code', $this->country_code)->first()->name : '',
            'tax_code' => $this->tax_code,
            'vat_number' => $this->vat_number,
            'pec' => $this->pec,
            'sdi' => $this->sdi,

            'user' => UserDetailResource::collection($this->whenLoaded('user')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
