<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuardianRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage-users') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:100'],
            'email'       => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'phone'       => ['nullable', 'string', 'max:30', Rule::unique('profiles', 'phone')],
            'address'     => ['nullable', 'string', 'max:500'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:profiles,id'],
        ];
    }
}
