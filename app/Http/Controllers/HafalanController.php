<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHafalanRequest;
use App\Models\Hafalan;
use App\Models\Profile;
use App\Models\Surah;
use App\Support\AuditLogger;
use App\Support\ScopeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HafalanController extends Controller
{
    public function __construct(private ScopeService $scope)
    {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('view-hafalan');

        $user = $request->user();
        $filters = $request->only(['student_id', 'surah_id', 'from_date', 'to_date']);

        $hafalansQuery = $this->scope
            ->applyHafalanScope(Hafalan::query(), $user)
            ->with([
                'student.user:id,name',
                'teacher.user:id,name',
                'surah:id,code,name',
            ])
            ->when($filters['student_id'] ?? null, function ($query, $studentId) use ($user) {
                $profile = Profile::find($studentId);

                if (! $profile) {
                    return $query;
                }

                if (! $this->scope->canAccessProfile($user, $profile)) {
                    return $query;
                }

                return $query->where('student_id', $studentId);
            })
            ->when($filters['surah_id'] ?? null, fn ($query, $surahId) => $query->where('surah_id', $surahId))
            ->betweenDates($filters['from_date'] ?? null, $filters['to_date'] ?? null)
            ->orderByDesc('date');

        $hafalans = $hafalansQuery
            ->get()
            ->map(function (Hafalan $hafalan) {
                return [
                    'id' => $hafalan->id,
                    'date' => $hafalan->date->format('Y-m-d'),
                    'student_id' => $hafalan->student_id,
                    'surah_id' => $hafalan->surah_id,
                    'surah' => [
                        'name' => $hafalan->surah->name,
                        'code' => $hafalan->surah->code,
                    ],
                    'from_ayah' => $hafalan->from_ayah,
                    'teacher' => $hafalan->teacher?->user?->name,
                    'student' => $hafalan->student?->user?->name ?? 'Unknown Student',
                    'notes' => $hafalan->notes,
                    'status' => $hafalan->status,
                ];
            })
            ->values();

        $students = $this->scope
            ->profilesForUser($user)
            ->map(fn (Profile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user->name,
            ]);

        $surahs = Surah::query()
            ->orderBy('id')
            ->get(['id', 'code', 'name', 'ayah_count']);

        return Inertia::render('hafalan/Index', [
            'hafalans' => $hafalans,
            'filters' => $filters,
            'students' => $students,
            'surahs' => $surahs,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('input-hafalan');

        $user = Auth::user();

        $students = $this->scope
            ->profilesForUser($user)
            ->map(fn (Profile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user->name,
            ]);

        $surahs = Surah::query()
            ->orderBy('id')
            ->get(['id', 'code', 'name', 'ayah_count'])
            ->map(fn (Surah $surah) => [
                'id' => $surah->id,
                'code' => $surah->code,
                'name' => $surah->name,
                'ayah_count' => $surah->ayah_count,
            ]);

        $latestIds = $this->scope
            ->applyHafalanScope(
                Hafalan::query()
                    ->selectRaw('MAX(id) as id')
                    ->groupBy('student_id', 'surah_id', 'from_ayah'),
                $user,
            )
            ->pluck('id');

        $repeatNotices = Hafalan::query()
            ->whereIn('id', $latestIds)
            ->where('status', 'murojaah')
            ->with(['surah:id,code,name'])
            ->get()
            ->groupBy('student_id')
            ->map(fn ($items) => $items
                ->map(fn (Hafalan $hafalan) => [
                    'id' => $hafalan->id,
                    'label' => sprintf(
                        '%s - %s ayat %d (%s)',
                        $hafalan->surah?->code ?? 'Surah',
                        $hafalan->surah?->name ?? 'Tidak diketahui',
                        $hafalan->from_ayah,
                        $hafalan->date->format('d M Y'),
                    ),
                ])
                ->values()
                ->all()
            )
            ->all();

        return Inertia::render('hafalan/Create', [
            'students' => $students,
            'surahs' => $surahs,
            'defaultDate' => now()->toDateString(),
            'repeats' => $repeatNotices,
        ]);
    }

    public function store(StoreHafalanRequest $request): RedirectResponse
    {
        Gate::authorize('input-hafalan');

        $data = $request->validated();
        $teacherId = Auth::user()->profile?->id;

        $hafalan = Hafalan::create([
            'student_id' => $data['student_id'],
            'teacher_id' => $teacherId,
            'surah_id' => $data['surah_id'],
            'from_ayah' => $data['from_ayah'],
            'to_ayah' => $data['to_ayah'],
            'date' => $data['date'],
            'status' => $data['status'],
            'score' => $data['score'] ?? 0,  // Default score 0 jika tidak ada
            'notes' => $data['notes'] ?? null,
        ]);

        AuditLogger::log(
            'hafalan.store',
            'Mencatat setoran hafalan santri',
            [
                'hafalan_id' => $hafalan->id,
                'student_id' => $hafalan->student_id,
                'teacher_id' => $hafalan->teacher_id,
                'surah_id' => $hafalan->surah_id,
                'date' => $hafalan->date->toDateString(),
            ]
        );

        return redirect()
            ->route('hafalan.index')
            ->with('success', 'Setoran hafalan tersimpan.')
            ->with('flashId', (string) Str::uuid());
    }
}
