<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
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
        $student = $this->route('student'); // This is now a Profile model

        return [
            'name'         => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($student->user_id ?? null)],
            'class_name'   => ['nullable', 'string', 'max:100'],
            'birth_date'   => ['nullable', 'date'],
            'nis'          => ['nullable', 'string', 'max:50', Rule::unique('profiles', 'nis')->ignore($student->id ?? null)],
            'phone'        => ['nullable', 'string', 'max:30'],
            'guardian_ids' => ['required', 'array', 'min:1'],
            'guardian_ids.*' => ['exists:profiles,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'class_name' => $this->filled('class_name') ? $this->string('class_name')->toString() : null,
            'birth_date' => $this->filled('birth_date') ? $this->string('birth_date')->toString() : null,
            'nis' => $this->filled('nis') ? $this->string('nis')->toString() : null,
            'phone' => $this->filled('phone') ? $this->string('phone')->toString() : null,
        ]);
    }
}
