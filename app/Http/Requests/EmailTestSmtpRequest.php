<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmailTestSmtpRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'organization_name' => 'required|string',
            'receiver' => 'required|email',
            'data' => 'required|array',
        ];
    }
}
