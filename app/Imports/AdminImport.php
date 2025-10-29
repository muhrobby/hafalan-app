<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class AdminImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure, SkipsEmptyRows
{
    use SkipsFailures;

    private int $created = 0;
    private int $updated = 0;

    public function model(array $row)
    {
        $name = $row['name'];
        $email = $row['email'];
        $password = $row['password'] ?? null;

        $user = User::firstOrNew(['email' => $email]);
        $wasExisting = $user->exists;
        $user->name = $name;
        if (! empty($password)) {
            $user->password = Hash::make($password);
        } elseif (! $user->exists) {
            $user->password = Hash::make('Password!123');
        }
        if (! $user->exists) {
            $user->email_verified_at = now();
        }
        $user->save();
        $user->syncRoles(['admin']);

        if ($wasExisting) {
            $this->updated++;
        } else {
            $this->created++;
        }

        return $user;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'max:150'],
            'password' => ['nullable', 'string', 'min:8'],
        ];
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
