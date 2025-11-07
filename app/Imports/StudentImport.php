<?php

namespace App\Imports;

// use App\Models\Classe; // DEPRECATED: Class system removed
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentImport implements 
    ToCollection, 
    WithHeadingRow, 
    WithValidation, 
    WithChunkReading,
    SkipsOnFailure, 
    SkipsEmptyRows
{
    use SkipsFailures;

    private int $created = 0;
    private int $updated = 0;
    private int $guardiansCreated = 0;
    private int $guardiansLinked = 0;
    private array $errors = [];

    /**
     * Process collection in chunks
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                DB::beginTransaction();
                
                $this->processRow($row);
                
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->errors[] = [
                    'row' => $index + 2, // +2 because of header and 0-based index
                    'error' => $e->getMessage(),
                ];
            }
        }
    }

    /**
     * Process individual row
     */
    private function processRow(Collection $row)
    {
        $name = $row['name'];
        $email = $row['email'];
        $nisInput = $row['nis'] ?? null;
        $className = $row['class_name'] ?? null;
        $birthDate = $row['birth_date'] ?? null;
        $phone = $row['phone'] ?? null;
        $guardianEmails = $row['guardian_emails'] ?? null;
        
        // Guardian data (NEW for Opsi 3)
        $guardianName = $row['guardian_name'] ?? null;
        $guardianEmail = $row['guardian_email'] ?? null;
        $guardianPhone = $row['guardian_phone'] ?? null;
        $guardianAddress = $row['guardian_address'] ?? null;

        // Create/update user
        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        if (!$user->exists) {
            $user->password = Hash::make('Password!123');
            $user->email_verified_at = now();
        }
        $user->save();

        // Assign role
        if (!$user->hasRole('student')) {
            $user->assignRole('student');
        }

        // DEPRECATED: Class system removed
        // Handle class
        // $class = null;
        // if ($className) {
        //     $class = Classe::firstOrCreate(['name' => trim($className)]);
        // }

        // Create/update profile
        $profile = Profile::firstOrNew(['user_id' => $user->id]);
        $wasExisting = $profile->exists;

        // Handle NIS
        if ($nisInput) {
            $nisInput = trim($nisInput);
            $conflict = Profile::where('nis', $nisInput)
                ->when($wasExisting, fn($query) => $query->where('id', '!=', $profile->id))
                ->exists();
            $profile->nis = $conflict ? Profile::generateNis() : $nisInput;
        } elseif (!$profile->nis) {
            $profile->nis = Profile::generateNis();
        }

        $profile->birth_date = $birthDate ?: null;
        // $profile->class_id = $class?->id ?? $profile->class_id; // DEPRECATED: Class system removed
        $profile->phone = $phone ? trim($phone) : $profile->phone;
        $profile->user_id = $user->id;
        $profile->save();

        // Handle guardian relationships
        $guardianIds = [];
        
        // Option 1: guardian_emails (existing guardians)
        if ($guardianEmails) {
            $guardianIds = array_merge($guardianIds, $this->getGuardianIds($guardianEmails));
        }
        
        // Option 2: guardian data columns (NEW - create or link guardian)
        if ($guardianEmail) {
            $guardianId = $this->findOrCreateGuardian(
                $guardianName,
                $guardianEmail,
                $guardianPhone,
                $guardianAddress
            );
            if ($guardianId) {
                $guardianIds[] = $guardianId;
            }
        }
        
        // Sync guardians with relation_type
        if (!empty($guardianIds)) {
            $guardianIds = array_unique($guardianIds);
            $existingIds = $profile->guardians()->pluck('related_profile_id')->toArray();
            
            // Only count new links
            $newLinks = array_diff($guardianIds, $existingIds);
            $this->guardiansLinked += count($newLinks);
            
            // Prepare sync data with relation_type
            $syncData = [];
            foreach ($guardianIds as $guardianId) {
                $syncData[$guardianId] = ['relation_type' => 'guardian'];
            }
            
            $profile->guardians()->syncWithoutDetaching($syncData);
        }

        if ($wasExisting) {
            $this->updated++;
        } else {
            $this->created++;
        }
    }

    /**
     * Get guardian IDs from comma-separated emails
     */
    private function getGuardianIds(string $emails): array
    {
        $emailArray = array_map('trim', explode(',', $emails));
        
        return Profile::whereHas('user', function ($q) use ($emailArray) {
            $q->whereIn('email', $emailArray)->role('guardian');
        })->pluck('id')->toArray();
    }
    
    /**
     * Find or create guardian by email
     */
    private function findOrCreateGuardian(
        ?string $name,
        string $email,
        ?string $phone,
        ?string $address
    ): ?int {
        $email = trim($email);
        
        // Find existing user by email
        $user = User::where('email', $email)->first();
        
        if ($user) {
            // User exists, check if has guardian profile
            $profile = Profile::where('user_id', $user->id)
                ->where('type', 'guardian')
                ->first();
            
            if ($profile) {
                // Guardian exists, optionally update data
                if ($phone) $profile->phone = trim($phone);
                if ($address) $profile->address = trim($address);
                $profile->save();
                
                return $profile->id;
            } else {
                // User exists but not a guardian, skip
                return null;
            }
        }
        
        // User doesn't exist, create new guardian
        if (!$name) {
            // Can't create without name
            return null;
        }
        
        $user = User::create([
            'name' => trim($name),
            'email' => $email,
            'password' => Hash::make('Password!123'),
            'email_verified_at' => now(),
        ]);
        
        $user->assignRole('guardian');
        
        $profile = Profile::create([
            'user_id' => $user->id,
            'type' => 'guardian',
            'phone' => $phone ? trim($phone) : null,
            'address' => $address ? trim($address) : null,
        ]);
        
        $this->guardiansCreated++;
        
        return $profile->id;
    }

    /**
     * Chunk size for reading
     */
    public function chunkSize(): int
    {
        return 50; // Process 50 rows at a time
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:150'],
            'nis'        => ['nullable', 'string', 'max:50'],
            // 'class_name' => ['nullable', 'string', 'max:100'], // DEPRECATED: Class system removed
            'birth_date' => ['nullable', 'date'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'guardian_emails' => ['nullable', 'string'],
            // NEW columns for Opsi 3
            'guardian_name' => ['nullable', 'string', 'max:100'],
            'guardian_email' => ['nullable', 'email', 'max:150'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'guardian_address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get statistics
     */
    public function getCreatedCount(): int
    {
        return $this->created;
    }

    public function getUpdatedCount(): int
    {
        return $this->updated;
    }
    
    public function getGuardiansCreatedCount(): int
    {
        return $this->guardiansCreated;
    }
    
    public function getGuardiansLinkedCount(): int
    {
        return $this->guardiansLinked;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function hasErrors(): bool
    {
        return count($this->errors) > 0;
    }

    /**
     * Prepare data for validation
     */
    public function prepareForValidation($data, $index)
    {
        // Clean NIS
        if (!array_key_exists('nis', $data) || trim((string) $data['nis']) === '') {
            $data['nis'] = null;
        } elseif ($data['nis'] !== null) {
            $data['nis'] = trim((string) $data['nis']);
        }

        // Clean class_name - DEPRECATED: Class system removed
        // if (isset($data['class_name']) && $data['class_name'] !== null) {
        //     $data['class_name'] = trim((string) $data['class_name']);
        // }

        // Clean phone
        if (isset($data['phone']) && $data['phone'] !== null) {
            $data['phone'] = trim((string) $data['phone']);
        }

        // Clean guardian_emails
        if (isset($data['guardian_emails']) && $data['guardian_emails'] !== null) {
            $data['guardian_emails'] = trim((string) $data['guardian_emails']);
        }
        
        // Clean guardian data (NEW for Opsi 3)
        if (isset($data['guardian_name']) && $data['guardian_name'] !== null) {
            $data['guardian_name'] = trim((string) $data['guardian_name']);
        }
        if (isset($data['guardian_email']) && $data['guardian_email'] !== null) {
            $data['guardian_email'] = trim((string) $data['guardian_email']);
        }
        if (isset($data['guardian_phone']) && $data['guardian_phone'] !== null) {
            $data['guardian_phone'] = trim((string) $data['guardian_phone']);
        }
        if (isset($data['guardian_address']) && $data['guardian_address'] !== null) {
            $data['guardian_address'] = trim((string) $data['guardian_address']);
        }

        return $data;
    }
}
