<?php

namespace App\Http\Controllers;

use App\Exports\GuardiansExport;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
use App\Imports\GuardianImport;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuardianController extends ProfileController
{
    protected function getRoleType(): string
    {
        return 'wali'; // Using 'wali' role name
    }

    protected function getPagePath(): string
    {
        return 'guardians/index';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Profile::class);

        $query = Profile::query()
            ->whereHas('user', fn($q) => $q->role('wali')) // Only guardians
            ->with(['user:id,name,email'])
            ->withCount('students')
            ->when(
                $request->input('search'),
                fn ($q, $search) => $q->where(function ($qq) use ($search) {
                    $qq->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('phone', 'like', "%{$search}%");
                })
            )
            ->when(
                $request->filled('has_student'),
                function ($q) use ($request) {
                    $hasStudent = $request->input('has_student');
                    // Handle both boolean and string values
                    if ($hasStudent === true || $hasStudent === 'true' || $hasStudent === '1') {
                        return $q->has('students');
                    } elseif ($hasStudent === false || $hasStudent === 'false' || $hasStudent === '0') {
                        return $q->doesntHave('students');
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
        
        $allowedSorts = ['created_at', 'updated_at', 'id'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortOrder);

        $guardians = $query->paginate(25)
            ->withQueryString()
            ->through(function (Profile $profile) {
                // Load student IDs and names for display
                $students = $profile->students()
                    ->with('user:id,name')
                    ->get();
                    
                $studentIds = $students->pluck('id')->toArray();
                $studentNames = $students->pluck('user.name')->toArray();
                
                return [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'phone' => $profile->phone,
                    'address' => $profile->address,
                    'students_count' => $profile->students_count,
                    'student_ids' => $studentIds,
                    'student_names' => $studentNames,
                    'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $profile->updated_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $profile->created_at->diffForHumans(),
                    'updated_at_human' => $profile->updated_at->diffForHumans(),
                ];
            });

        $availableStudents = $this->getCachedStudents();

        return Inertia::render($this->getPagePath(), [
            'guardians' => $guardians,
            'filters' => [
                'search' => $request->input('search'),
                'has_student' => $request->input('has_student'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ],
            'canManage' => $request->user()?->can('manage-users') ?? false,
            'availableStudents' => $availableStudents->values()->toArray(),
        ]);
    }

    public function store(StoreGuardianRequest $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        
        DB::transaction(function () use ($request) {
            $profile = $this->upsertProfile($request->validated());
            
            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
        });

        return redirect()->route('guardians.index')
            ->with('success', 'Wali berhasil dibuat.')
            ->with('flashId', (string) Str::uuid());
    }

    public function quickStore(StoreGuardianRequest $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        
        $profile = DB::transaction(function () use ($request) {
            $profile = $this->upsertProfile($request->validated());
            
            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
            
            return $profile;
        });

        return back()->with([
            'success' => 'Wali baru berhasil dibuat.',
            'newGuardian' => [
                'id' => $profile->id,
                'name' => $profile->user->name,
                'email' => $profile->user->email,
            ],
            'flashId' => (string) Str::uuid(),
        ]);
    }

    public function update(UpdateGuardianRequest $request, Profile $guardian): RedirectResponse
    {
        $this->authorize('update', $guardian);
        
        DB::transaction(function () use ($request, $guardian) {
            $this->upsertProfile($request->validated(), $guardian);
            
            // Clear cache
            Cache::forget('available_guardians');
            Cache::forget('available_students');
        });

        return redirect()->route('guardians.index')
            ->with('success', 'Data wali berhasil diperbarui.')
            ->with('flashId', (string) Str::uuid());
    }

    public function destroy(Profile $guardian): RedirectResponse
    {
        $this->authorize('delete', $guardian);
        
        $guardian->delete();
        
        // Clear cache
        Cache::forget('available_guardians');
        Cache::forget('available_students');

        return redirect()->route('guardians.index')
            ->with('success', 'Wali berhasil dihapus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $import = new GuardianImport();

        Excel::import($import, $file);

        Cache::forget('available_guardians');
        Cache::forget('available_students');

        $created = $import->getCreatedCount();
        $updated = $import->getUpdatedCount();

        return redirect()->route('guardians.index')
            ->with('success', "Import berhasil: {$created} wali ditambahkan, {$updated} diperbarui.")
            ->with('flashId', (string) Str::uuid());
    }

    public function export(Request $request): BinaryFileResponse
    {
        $this->authorize('viewAny', Profile::class);

        $filters = $request->only(['search', 'has_student', 'date_from', 'date_to']);
        $fileName = 'wali-' . date('Y-m-d-His') . '.xlsx';

        return Excel::download(new GuardiansExport($filters), $fileName);
    }
}
