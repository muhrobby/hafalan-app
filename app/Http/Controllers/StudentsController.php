<?php

namespace App\Http\Controllers;

use App\Exports\StudentsExport;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Imports\StudentImport;
// use App\Models\Classe; // Removed - class system deprecated
use App\Models\Profile;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentsController extends ProfileController
{
    protected function getRoleType(): string
    {
        return 'student';
    }

    protected function getPagePath(): string
    {
        return 'students/index';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Profile::class);

        $query = Profile::query()
            ->with(['user:id,name,email']) // DEPRECATED: removed 'class:id,name'
            ->withCount('guardians')
            ->whereNotNull('nis') // Only students
            ->when(
                $request->input('search'),
                fn ($q, $search) => $q->where(function ($qq) use ($search) {
                    $qq->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('nis', 'like', "%{$search}%");
                })
            )
            // DEPRECATED: Class filtering removed
            // ->when(
            //     $request->input('class_id'),
            //     fn ($q, $classId) => $q->where('class_id', $classId)
            // )
            ->when(
                $request->filled('has_guardian'),
                function ($q) use ($request) {
                    $hasGuardian = $request->input('has_guardian');
                    if ($hasGuardian === true || $hasGuardian === 'true' || $hasGuardian === '1') {
                        return $q->has('guardians');
                    } elseif ($hasGuardian === false || $hasGuardian === 'false' || $hasGuardian === '0') {
                        return $q->doesntHave('guardians');
                    }
                    return $q;
                }
            )
            ->when(
                $request->input('date_from'),
                fn ($q, $dateFrom) => $q->whereDate('created_at', '>=', $dateFrom)
            )
            ->when(
                $request->input('date_to'),
                fn ($q, $dateTo) => $q->whereDate('created_at', '<=', $dateTo)
            );

        // Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');
        
        $allowedSorts = ['created_at', 'updated_at', 'nis', 'id'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortOrder);

        $students = $query->paginate(25)
            ->withQueryString()
            ->through(function (Profile $profile) {
                // Load guardian IDs and names for display
                $guardians = $profile->guardians()
                    ->with('user:id,name')
                    ->get();
                    
                $guardianIds = $guardians->pluck('id')->toArray();
                $guardianNames = $guardians->pluck('user.name')->toArray();
                
                return [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'nis' => $profile->nis,
                    // 'class' => $profile->class?->name, // DEPRECATED: Class system removed
                    // 'class_id' => $profile->class_id, // DEPRECATED: Class system removed
                    // 'class_name' => $profile->class?->name, // DEPRECATED: Class system removed
                    'phone' => $profile->phone,
                    'birth_date' => $profile->birth_date?->format('Y-m-d'),
                    'guardians_count' => $profile->guardians_count,
                    'guardian_ids' => $guardianIds,
                    'guardian_names' => $guardianNames,
                    'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $profile->updated_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $profile->created_at->diffForHumans(),
                    'updated_at_human' => $profile->updated_at->diffForHumans(),
                ];
            });

        $availableGuardians = $this->getCachedGuardians();
        $availableClasses = $this->getCachedClasses(); // Returns empty array (deprecated)

        return Inertia::render($this->getPagePath(), [
            'students' => $students,
            'filters' => [
                'search' => $request->input('search'),
                // 'class_id' => $request->input('class_id'), // DEPRECATED: Class system removed
                'has_guardian' => $request->input('has_guardian'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ],
            'canManage' => $request->user()?->can('manage-users') ?? false,
            'availableGuardians' => $availableGuardians,
            'availableClasses' => $availableClasses,
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        
        DB::transaction(function () use ($request) {
            $profile = $this->upsertProfile($request->validated());
            
            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
        });

        return redirect()->route('students.index')
            ->with('success', 'Santri berhasil dibuat.')
            ->with('flashId', (string) Str::uuid());
    }

    public function storeWithGuardian(Request $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        
        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'student_email' => 'required|email|unique:users,email',
            'student_class_name' => 'required|string|max:255',
            'student_birth_date' => 'nullable|date',
            'student_nis' => 'nullable|string|unique:profiles,nis',
            'student_phone' => 'nullable|string|max:20',
            'guardian_name' => 'required|string|max:255',
            'guardian_email' => 'required|email|unique:users,email',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_address' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Create Student
            $studentUser = User::create([
                'name' => $validated['student_name'],
                'email' => $validated['student_email'],
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $studentUser->assignRole('student');

            // Class system removed - no longer create class
            // $studentClass = Classe::firstOrCreate(['name' => $validated['student_class_name']]);

            $studentProfile = Profile::create([
                'user_id' => $studentUser->id,
                'type' => 'student',
                'nis' => $validated['student_nis'] ?? Profile::generateNis(),
                'birth_date' => $validated['student_birth_date'] ?? null,
                'phone' => $validated['student_phone'] ?? null,
                // 'class_id' => $studentClass->id, // Removed
            ]);

            // 2. Create Guardian
            $guardianUser = User::create([
                'name' => $validated['guardian_name'],
                'email' => $validated['guardian_email'],
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $guardianUser->assignRole('wali');

            $guardianProfile = Profile::create([
                'user_id' => $guardianUser->id,
                'type' => 'guardian',
                'phone' => $validated['guardian_phone'] ?? null,
                'address' => $validated['guardian_address'] ?? null,
            ]);

            // 3. Link Student and Guardian in profile_relations
            $studentProfile->guardians()->attach($guardianProfile->id, [
                'relation_type' => 'guardian'
            ]);

            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
        });

        return redirect()->route('students.index')
            ->with('success', 'Santri dan wali berhasil dibuat sekaligus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function update(UpdateStudentRequest $request, Profile $student): RedirectResponse
    {
        $this->authorize('update', $student);
        
        DB::transaction(function () use ($request, $student) {
            $this->upsertProfile($request->validated(), $student);
            
            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
        });

        return redirect()->route('students.index')
            ->with('success', 'Data santri berhasil diperbarui.')
            ->with('flashId', (string) Str::uuid());
    }

    public function destroy(Profile $student): RedirectResponse
    {
        $this->authorize('delete', $student);
        
        $student->delete();
        
        // Clear cache
        Cache::forget('available_guardians');
        Cache::forget('available_students');

        return redirect()->route('students.index')
            ->with('success', 'Santri berhasil dihapus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $import = new StudentImport();

        Excel::import($import, $file);

        Cache::forget('available_students');
        Cache::forget('available_guardians');

        $created = $import->getCreatedCount();
        $updated = $import->getUpdatedCount();
        $guardiansCreated = $import->getGuardiansCreatedCount();
        $guardiansLinked = $import->getGuardiansLinkedCount();

        $messageParts = [];
        if ($created > 0) {
            $messageParts[] = "{$created} santri baru";
        }
        if ($updated > 0) {
            $messageParts[] = "{$updated} santri diperbarui";
        }
        if ($guardiansCreated > 0) {
            $messageParts[] = "{$guardiansCreated} wali baru dibuat";
        }
        if ($guardiansLinked > 0) {
            $messageParts[] = "{$guardiansLinked} relasi ditambahkan";
        }

        $summary = empty($messageParts)
            ? 'Tidak ada data baru yang diimpor.'
            : 'Import selesai: ' . implode(', ', $messageParts) . '.';

        return redirect()->route('students.index')
            ->with('success', $summary)
            ->with('flashId', (string) Str::uuid());
    }

    public function template(): StreamedResponse
    {
        $this->authorize('create', Profile::class);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-santri.csv"',
            'Cache-Control' => 'no-store, no-cache',
            'Pragma' => 'no-cache',
        ];

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($handle, [
                'name',
                'email',
                'class_name',
                'birth_date',
                'phone',
                'nis',
                'guardian_emails',
                'guardian_name',
                'guardian_email',
                'guardian_phone',
                'guardian_address'
            ]);
            
            // Example 1: Student with existing guardians (using guardian_emails)
            fputcsv($handle, [
                'Ahmad Fauzi',
                'ahmad.fauzi@example.com',
                'Kelas 1A',
                '2012-03-14',
                '081234567890',
                '251026000001',
                'wali.existing@example.com', // Link to existing guardian
                '',  // guardian_name (empty because using guardian_emails)
                '',  // guardian_email
                '',  // guardian_phone
                ''   // guardian_address
            ]);
            
            // Example 2: Student with NEW guardian (auto-create)
            fputcsv($handle, [
                'Aisyah Nur',
                'aisyah.nur@example.com',
                'Kelas 1A',
                '2011-08-21',
                '081234567891',
                '251026000002',
                '',  // guardian_emails (empty because creating new)
                'Ibu Aisyah',  // NEW guardian will be created
                'ibu.aisyah@example.com',
                '082345678901',
                'Jl. Contoh No. 123'
            ]);
            
            // Example 3: Student only (no guardian)
            fputcsv($handle, [
                'Muhammad Rizki',
                'rizki.muhammad@example.com',
                'Kelas 1B',
                '2012-05-10',
                '081234567892',
                '',
                '',  // No guardian
                '',
                '',
                '',
                ''
            ]);
            
            fclose($handle);
        }, 'template-santri.csv', $headers);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $this->authorize('viewAny', Profile::class);

        $filters = $request->only(['search', 'has_guardian', 'date_from', 'date_to']); // DEPRECATED: removed 'class_id'
        $fileName = 'santri-' . date('Y-m-d-His') . '.xlsx';

        return Excel::download(new StudentsExport($filters), $fileName);
    }
}
