<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string',
            'last_name' => 'nullable|string',
            'email' => $this->route('user') ? 'required|email|unique:users,email,' . $this->user()->id : 'required|email|unique:users,email',
            'role' => 'required|in:admin,user',
            'is_affiliate' => 'required|boolean',
        ];
    }
}
