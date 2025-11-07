<?php

namespace App\Imports;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class TeacherImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, SkipsEmptyRows
{
    use SkipsFailures;

    private int $created = 0;
    private int $updated = 0;

    public function model(array $row)
    {
        $name = $row['name'];
        $email = $row['email'];
        $phone = $row['phone'] ?? null;
        $birthDate = $row['birth_date'] ?? null;

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        if (! $user->exists) {
            $user->password = Hash::make('Password!123');
            $user->email_verified_at = now();
        }
        $user->save();

        if (! $user->hasRole('teacher')) {
            $user->assignRole('teacher');
        }

        $profile = Profile::firstOrNew(['user_id' => $user->id]);
        $wasExisting = $profile->exists;

        // Always auto-generate NIP if not exists
        if (! $profile->nip) {
            $profile->nip = Profile::generateNip();
        }

        $profile->phone = $phone ?: null;
        $profile->birth_date = $birthDate ?: null;
        $profile->save();

        if ($wasExisting) {
            $this->updated++;
        } else {
            $this->created++;
        }

        return $profile;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:150'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'birth_date' => ['nullable', 'date'],
        ];
    }

    public function prepareForValidation(array $data, $index)
    {
        if (! array_key_exists('nip', $data) || trim((string) ($data['nip'] ?? '')) === '') {
            $data['nip'] = null;
        } elseif ($data['nip'] !== null) {
            $data['nip'] = trim((string) $data['nip']);
        }

        if (isset($data['phone']) && $data['phone'] !== null) {
            $data['phone'] = trim((string) $data['phone']);
        }

        return $data;
    }

    public function getCreatedCount(): int
    {
        return $this->created;
    }

    public function getUpdatedCount(): int
    {
        return $this->updated;
    }
}
