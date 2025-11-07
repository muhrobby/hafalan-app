<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Validators\Failure;

class StudentGuardianImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            DB::transaction(function () use ($row, $index) {
                Log::info("Processing row {$index}: " . json_encode($row->toArray()));
                
                // 1. Create or find Guardian
                $guardianUser = User::where('email', $row['email_wali'])->first();

                if (!$guardianUser) {
                    // Create guardian user
                    $guardianUser = User::create([
                        'name' => $row['nama_wali'],
                        'email' => $row['email_wali'],
                        'password' => Hash::make('password123'), // Default password
                        'email_verified_at' => now(),
                    ]);

                    // Assign wali role (not guardian)
                    $guardianUser->assignRole('wali');

                    // Create guardian profile (role_type column removed)
                    Profile::create([
                        'user_id' => $guardianUser->id,
                        'name' => $row['nama_wali'],
                        'phone' => $row['telepon_wali'],
                        'address' => $row['alamat_wali'] ?? null,
                    ]);
                }

                // 2. Create Student
                // Check if student already exists (by name + birth_date for uniqueness)
                $birthDate = $this->parseDate($row['tanggal_lahir']);
                $existingStudent = Profile::whereHas('user', function ($query) use ($row) {
                    $query->where('name', $row['nama_santri']);
                })
                ->where('birth_date', $birthDate)
                ->first();

                if ($existingStudent) {
                    // Student already exists, just attach to guardian
                    Log::info("Student {$row['nama_santri']} already exists, skipping creation and attaching to guardian");
                    
                    $guardianProfile = Profile::where('user_id', $guardianUser->id)->first();
                    if ($guardianProfile) {
                        $existingStudent->guardians()->syncWithoutDetaching([$guardianProfile->id]);
                    }
                    
                    return; // Skip to next row
                }
                
                // Always auto-generate unique NIS
                $nis = now()->format('YmdHis') . rand(100, 999);
                while (Profile::where('nis', $nis)->exists()) {
                    $nis = now()->format('YmdHis') . rand(100, 999);
                }
                
                // Always auto-generate email from student name (email_santri removed from template)
                $baseEmail = Str::slug($row['nama_santri']);
                $studentEmail = $baseEmail . '@student.local';
                
                // Check for duplicates and add counter if needed
                $counter = 1;
                while (User::where('email', $studentEmail)->exists()) {
                    $studentEmail = $baseEmail . $counter . '@student.local';
                    $counter++;
                }
                
                // Create student user
                $studentUser = User::create([
                    'name' => $row['nama_santri'],
                    'email' => $studentEmail,
                    'password' => Hash::make('student123'), // Default password
                    'email_verified_at' => now(),
                ]);

                // Assign student role
                $studentUser->assignRole('student');

                // Create student profile (role_type column removed)
                $studentProfile = Profile::create([
                    'user_id' => $studentUser->id,
                    'name' => $row['nama_santri'],
                    'nis' => $nis,
                    'birth_date' => $birthDate,
                    'phone' => $row['telepon_santri'] ?? null,
                    'address' => $row['alamat_santri'] ?? null,
                ]);

                // 3. Attach student to guardian
                $guardianProfile = Profile::where('user_id', $guardianUser->id)
                    ->first();

                if ($guardianProfile) {
                    // Attach in pivot table (many-to-many)
                    $studentProfile->guardians()->syncWithoutDetaching([$guardianProfile->id]);
                }
                
                Log::info("Successfully imported student {$studentProfile->name} with guardian {$guardianProfile->name}");
            });
        }
    }

    /**
     * Parse date from various formats
     */
    private function parseDate($date)
    {
        if (!$date) {
            return null;
        }

        // If already a valid date string
        if (strtotime($date)) {
            return date('Y-m-d', strtotime($date));
        }

        // If Excel serial number (e.g., 44561)
        if (is_numeric($date)) {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date)->format('Y-m-d');
        }

        return null;
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'nama_santri' => 'required|string|max:255',
            'tanggal_lahir' => 'required',
            'telepon_santri' => 'nullable|string|max:20',
            'alamat_santri' => 'nullable|string|max:500',
            
            'nama_wali' => 'required|string|max:255',
            'email_wali' => 'required|email',
            'telepon_wali' => 'required|string|max:20',
            'alamat_wali' => 'nullable|string|max:500',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages()
    {
        return [
            'nama_santri.required' => 'Nama santri harus diisi',
            'tanggal_lahir.required' => 'Tanggal lahir santri harus diisi',
            
            'nama_wali.required' => 'Nama wali harus diisi',
            'email_wali.required' => 'Email wali harus diisi',
            'email_wali.email' => 'Format email wali tidak valid',
            'telepon_wali.required' => 'Telepon wali harus diisi',
        ];
    }
}
