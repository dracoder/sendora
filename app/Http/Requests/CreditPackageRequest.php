<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreditPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable',
            'credits' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'featured' => 'boolean'
        ];
    }
}