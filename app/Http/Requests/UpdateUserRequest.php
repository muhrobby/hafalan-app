<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()?->hasRole('admin') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id')->id ?? null;

        return [
             'name'  => ['required','string','max:100'],
      'email' => ['required','email','max:150', Rule::unique('users','email')->ignore($userId)],
      'role'  => ['required','in:admin,ustadz,santri,wali'],

      'nis'        => ['nullable','string','max:50', Rule::unique('students','nis')->ignore(optional($this->route('user')->student)->id)],
      'nip'        => ['nullable','string','max:50', Rule::unique('teachers','nip')->ignore(optional($this->route('user')->teacher)->id)],
      'phone'      => ['nullable','string','max:30'],
      'address'    => ['nullable','string','max:255'],
      'class_id'   => ['nullable','exists:classes,id'],
      'birth_date' => ['nullable','date'],
        ];
    }
}
