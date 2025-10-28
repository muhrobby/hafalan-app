<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
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
        $teacher = $this->route('teacher'); // This is now a Profile model

        return [
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($teacher->user_id ?? null)],
            'nip'        => ['nullable', 'string', 'max:50', Rule::unique('profiles', 'nip')->ignore($teacher->id ?? null)],
            'phone'      => ['nullable', 'string', 'max:30'],
            'birth_date' => ['nullable', 'date'],
            'class_ids'  => ['nullable', 'array'],
            'class_ids.*' => ['exists:classes,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nip' => $this->filled('nip')
                ? trim($this->string('nip')->toString())
                : null,
            'phone' => $this->filled('phone')
                ? trim($this->string('phone')->toString())
                : null,
        ]);
    }
}
