<?php

namespace App\Http\Controllers;

use App\Exports\TeachersExport;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Imports\TeacherImport;
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

class TeachersController extends ProfileController
{
    protected function getRoleType(): string
    {
        return 'teacher';
    }

    protected function getPagePath(): string
    {
        return 'teachers/index';
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Profile::class);

        $query = Profile::query()
            ->whereNotNull('nip') // Only teachers
            ->with(['user:id,name,email'])
            ->withCount('classes')
            ->when(
                $request->input('search'),
                fn ($q, $search) => $q->where(function ($qq) use ($search) {
                    $qq->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('nip', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                })
            )
            ->when(
                $request->filled('has_class'),
                function ($q) use ($request) {
                    $hasClass = $request->input('has_class');
                    if ($hasClass === true || $hasClass === 'true' || $hasClass === '1') {
                        return $q->has('classes');
                    } elseif ($hasClass === false || $hasClass === 'false' || $hasClass === '0') {
                        return $q->doesntHave('classes');
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
        
        $allowedSorts = ['created_at', 'updated_at', 'nip', 'id'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortOrder);

        $teachers = $query->paginate(25)
            ->withQueryString()
            ->through(function (Profile $profile) {
                // Load class IDs and names for display
                $classes = $profile->classes()->get();
                $classIds = $classes->pluck('id')->toArray();
                $classNames = $classes->pluck('name')->toArray();
                
                return [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'nip' => $profile->nip,
                    'phone' => $profile->phone,
                    'birth_date' => $profile->birth_date?->format('Y-m-d'),
                    'classes_count' => $profile->classes_count,
                    'class_ids' => $classIds,
                    'class_names' => $classNames,
                    'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $profile->updated_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $profile->created_at->diffForHumans(),
                    'updated_at_human' => $profile->updated_at->diffForHumans(),
                ];
            });

        $availableClasses = $this->getCachedClasses();

        return Inertia::render($this->getPagePath(), [
            'teachers' => $teachers,
            'filters' => [
                'search' => $request->input('search'),
                'has_class' => $request->input('has_class'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ],
            'canManage' => $request->user()?->can('manage-users') ?? false,
            'availableClasses' => $availableClasses,
        ]);
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);
        
        DB::transaction(function () use ($request) {
            $profile = $this->upsertProfile($request->validated());
            
            // Clear cache
            Cache::forget('available_classes');
        });

        return redirect()->route('teachers.index')
            ->with('success', 'Guru berhasil dibuat.')
            ->with('flashId', (string) Str::uuid());
    }

    public function update(UpdateTeacherRequest $request, Profile $teacher): RedirectResponse
    {
        $this->authorize('update', $teacher);
        
        DB::transaction(function () use ($request, $teacher) {
            $this->upsertProfile($request->validated(), $teacher);
            
            // Clear cache
            Cache::forget('available_classes');
        });

        return redirect()->route('teachers.index')
            ->with('success', 'Data guru berhasil diperbarui.')
            ->with('flashId', (string) Str::uuid());
    }

    public function destroy(Profile $teacher): RedirectResponse
    {
        $this->authorize('delete', $teacher);
        
        $teacher->delete();
        
        // Clear cache
        Cache::forget('available_classes');

        return redirect()->route('teachers.index')
            ->with('success', 'Guru berhasil dihapus.')
            ->with('flashId', (string) Str::uuid());
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Profile::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $import = new TeacherImport();

        Excel::import($import, $file);

        Cache::forget('available_classes');

        $created = $import->getCreatedCount();
        $updated = $import->getUpdatedCount();

        return redirect()->route('teachers.index')
            ->with('success', "Import berhasil: {$created} guru ditambahkan, {$updated} diperbarui.")
            ->with('flashId', (string) Str::uuid());
    }

    public function template(): StreamedResponse
    {
        $this->authorize('create', Profile::class);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-guru.csv"',
            'Cache-Control' => 'no-store, no-cache',
            'Pragma' => 'no-cache',
        ];

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($handle, ['name', 'email', 'nip', 'phone', 'birth_date', 'class_names']);
            fputcsv($handle, ['Ahmad Fauzi', 'ahmad.guru@example.com', '199001012020121001', '081234567890', '1990-01-01', 'Kelas 1A,Kelas 2A']);
            fputcsv($handle, ['Siti Aisyah', 'siti.guru@example.com', '199002022020122002', '081234567891', '1990-02-02', 'Kelas 1B']);
            fputcsv($handle, ['Muhammad Rizki', 'rizki.guru@example.com', '199003032020123003', '081234567892', '1990-03-03', '']);
            
            fclose($handle);
        }, 'template-guru.csv', $headers);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $this->authorize('viewAny', Profile::class);

        $filters = $request->only(['search', 'has_class', 'date_from', 'date_to']);
        $fileName = 'guru-' . date('Y-m-d-His') . '.xlsx';

        return Excel::download(new TeachersExport($filters), $fileName);
    }
}
