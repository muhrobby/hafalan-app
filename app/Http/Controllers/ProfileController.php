<?php

namespace App\Http\Controllers;

// use App\Models\Classe; // Removed - class system deprecated
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

abstract class ProfileController extends Controller
{
    /**
     * Get role type untuk controller ini
     */
    abstract protected function getRoleType(): string;

    /**
     * Get Inertia page path
     */
    abstract protected function getPagePath(): string;

    /**
     * Upsert profile dengan data yang diberikan
     */
    protected function upsertProfile(array $data, ?Profile $profile = null): Profile
    {
        $roleType = $this->getRoleType();
        
        // For students without email, generate a unique email
        if ($roleType === 'student' && empty($data['email'])) {
            // Generate email based on name or NIS
            $baseEmail = !empty($data['nis']) 
                ? $data['nis'] 
                : strtolower(str_replace(' ', '', $data['name']));
            $data['email'] = $baseEmail . '@student.local';
            
            // Ensure uniqueness
            $counter = 1;
            while (User::where('email', $data['email'])->exists()) {
                $data['email'] = $baseEmail . $counter . '@student.local';
                $counter++;
            }
        }
        
        // Create/update user
        $existingUser = $profile?->user ?? User::where('email', $data['email'])->first();
        
        $user = $existingUser ?? new User(['email' => $data['email']]);
        $user->name = $data['name'];
        
        if (!$user->exists) {
            $user->password = Hash::make('Password!123');
            $user->email_verified_at = now();
        } else {
            $user->email = $data['email'];
        }
        $user->save();
        
        // Assign role
        if (!$user->hasRole($roleType)) {
            $user->assignRole($roleType);
        }
        
        // Create/update profile
        $profileModel = $profile ?? Profile::firstOrNew(['user_id' => $user->id]);
        
        // Map data berdasarkan role
        switch ($roleType) {
            case 'student':
                $this->fillStudentData($profileModel, $data);
                break;
            case 'guardian':
                $this->fillGuardianData($profileModel, $data);
                break;
            case 'teacher':
                $this->fillTeacherData($profileModel, $data);
                break;
        }
        
        $profileModel->user_id = $user->id;
        $profileModel->save();
        
        // Handle relations
        $this->syncRelations($profileModel, $data);
        
        return $profileModel;
    }

    /**
     * Fill student-specific data
     */
    protected function fillStudentData(Profile $profile, array $data): void
    {
        if (!empty($data['nis'])) {
            $profile->nis = $data['nis'];
        } elseif (!$profile->nis) {
            $profile->nis = Profile::generateNis();
        }
        
        $profile->birth_date = $data['birth_date'] ?? $profile->birth_date;
        $profile->phone = $data['phone'] ?? $profile->phone;
        
        // Class system removed
        // if (!empty($data['class_name'])) {
        //     $class = Classe::firstOrCreate(['name' => $data['class_name']]);
        //     $profile->class_id = $class->id;
        // }
    }

    /**
     * Fill guardian-specific data
     */
    protected function fillGuardianData(Profile $profile, array $data): void
    {
        $profile->phone = $data['phone'] ?? $profile->phone;
        $profile->address = $data['address'] ?? $profile->address;
    }

    /**
     * Fill teacher-specific data
     */
    protected function fillTeacherData(Profile $profile, array $data): void
    {
        if (!empty($data['nip'])) {
            $profile->nip = $data['nip'];
        } elseif (!$profile->nip) {
            $profile->nip = Profile::generateNip();
        }
        
        $profile->phone = $data['phone'] ?? $profile->phone;
    }

    /**
     * Sync relations berdasarkan role
     */
    protected function syncRelations(Profile $profile, array $data): void
    {
        $roleType = $this->getRoleType();
        
        switch ($roleType) {
            case 'student':
                // Sync guardians with relation_type
                if (isset($data['guardian_ids'])) {
                    $syncData = [];
                    foreach ($data['guardian_ids'] as $guardianId) {
                        $syncData[$guardianId] = ['relation_type' => 'guardian'];
                    }
                    $profile->guardians()->sync($syncData);
                }
                break;
                
            case 'guardian':
                // Sync students with relation_type
                if (isset($data['student_ids'])) {
                    $syncData = [];
                    foreach ($data['student_ids'] as $studentId) {
                        $syncData[$studentId] = ['relation_type' => 'guardian'];
                    }
                    $profile->students()->sync($syncData);
                }
                break;
                
            case 'teacher':
                // DEPRECATED: Class system removed
                // Sync classes
                // if (isset($data['class_ids'])) {
                //     $profile->classes()->sync($data['class_ids']);
                // }
                break;
        }
    }

    /**
     * Get cached guardians for dropdown
     */
    protected function getCachedGuardians()
    {
        return Cache::remember('available_guardians', 3600, function () {
            return Profile::query()
                ->whereHas('user', fn($q) => $q->role('wali'))
                ->with('user:id,name,email')
                ->get()
                ->map(fn($p) => [
                    'value' => $p->id,
                    'label' => $p->user->name . ' (' . $p->user->email . ')',
                ]);
        });
    }

    /**
     * Get cached classes for dropdown
     * DEPRECATED: Class system removed
     */
    protected function getCachedClasses()
    {
        return []; // Class system removed
        // return Cache::remember('available_classes', 3600, function () {
        //     return Classe::select('id', 'name')
        //         ->orderBy('name')
        //         ->get()
        //         ->map(fn($c) => [
        //             'value' => $c->id,
        //             'label' => $c->name,
        //         ]);
        // });
    }

    /**
     * Get cached students for dropdown
     */
    protected function getCachedStudents()
    {
        return Cache::remember('available_students', 3600, function () {
            return Profile::query()
                ->whereNotNull('nis')
                ->with('user:id,name,email')
                ->get()
                ->map(fn($p) => [
                    'value' => $p->id,
                    'label' => $p->user->name . ' - NIS: ' . $p->nis,
                ]);
        });
    }
}
