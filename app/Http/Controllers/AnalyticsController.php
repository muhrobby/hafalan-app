<?php

namespace App\Http\Controllers;

use App\Models\Hafalan;
use App\Models\Profile;
use App\Support\ScopeService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AnalyticsController extends Controller
{
    public function __construct(private ScopeService $scope)
    {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('view-analytics');

        $user = $request->user();
        $variant = $this->determineVariant($user);

        [$from, $to] = $this->resolvePeriod(
            $request->query('from'),
            $request->query('to'),
        );

        $studentId = $this->resolveStudentFilter($user, $request->query('student_id'));
        $teacherId = $request->query('teacher_id');
        $classId = $request->query('class_id');

        $baseQuery = $this->scope
            ->applyHafalanScope(Hafalan::query(), $user)
            ->when($studentId, fn ($query, $id) => $query->where('student_id', $id))
            ->when($teacherId && $user->hasRole('admin'), fn ($query) => $query->where('teacher_id', $teacherId))
            ->when($classId, fn ($query, $id) => $query->whereHas('student.profile', fn ($q) => $q->where('class_id', $id)))
            ->betweenDates($from->toDateString(), $to->toDateString());

        $trend = (clone $baseQuery)
            ->selectRaw('date(date) as day')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
            ->selectRaw("SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'total' => (int) $row->total,
                'total_murojaah' => (int) $row->total_murojaah,
                'total_selesai' => (int) $row->total_selesai,
            ]);

        $aggregate = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_records')
            ->selectRaw("SUM(CASE WHEN status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
            ->selectRaw("SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
            ->first();

        $summary = [
            'totalAyat' => (int) ($aggregate->total_records ?? 0),
            'totalMurojaah' => (int) ($aggregate->total_murojaah ?? 0),
            'totalSelesai' => (int) ($aggregate->total_selesai ?? 0),
        ];

        $rolesDistribution = [];
        if ($user->hasRole('admin')) {
            $rolesDistribution = Role::withCount('users')
                ->get(['name', 'users_count'])
                ->map(fn (Role $role) => [
                    'name' => ucfirst($role->name),
                    'count' => $role->users_count,
                ]);
        }

        $classPerformance = [];
        if ($user->hasRole('admin')) {
            $classPerformance = (clone $baseQuery)
                ->leftJoin('profiles', 'profiles.id', '=', 'hafalans.student_id')
                ->leftJoin('classes', 'classes.id', '=', 'profiles.class_id')
                ->selectRaw('COALESCE(classes.name, "Tidak ada Kelas") as class_name')
                ->selectRaw('COUNT(hafalans.id) as total')
                ->selectRaw("SUM(CASE WHEN hafalans.status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
                ->selectRaw("SUM(CASE WHEN hafalans.status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
                ->groupBy('class_name')
                ->orderBy('class_name')
                ->get()
                ->map(fn ($row) => [
                    'class_name' => $row->class_name,
                    'total' => (int) $row->total,
                    'total_murojaah' => (int) $row->total_murojaah,
                    'total_selesai' => (int) $row->total_selesai,
                ]);
        }

        $availableFilters = [
            'students' => $this->scope->studentOptions($user),
            'teachers' => $user->hasRole('admin') ? $this->scope->teacherOptions() : collect(),
            'classes' => $this->scope->classOptionsFor($user),
        ];

        $filters = [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'student_id' => $studentId ? (string) $studentId : null,
            'teacher_id' => $teacherId ? (string) $teacherId : null,
            'class_id' => $classId ? (string) $classId : null,
        ];

        return Inertia::render('analytics/Index', [
            'variant' => $variant,
            'summary' => $summary,
            'trend' => $trend,
            'roles' => $rolesDistribution,
            'classPerformance' => $classPerformance,
            'filters' => $filters,
            'availableFilters' => $availableFilters,
        ]);
    }

    private function determineVariant($user): string
    {
        if ($user->hasRole('admin')) {
            return 'admin';
        }

        if ($user->hasRole('teacher')) {
            return 'teacher';
        }

        return 'student';
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolvePeriod(?string $from, ?string $to): array
    {
        $fromDate = $from ? Carbon::parse($from) : now()->startOfMonth();
        $toDate = $to ? Carbon::parse($to) : now();

        if ($fromDate->greaterThan($toDate)) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        return [$fromDate->startOfDay(), $toDate->endOfDay()];
    }

    private function resolveStudentFilter($user, $profileId): ?int
    {
        if (!$profileId) {
            return null;
        }

        $profile = Profile::find($profileId);

        if (!$profile) {
            return null;
        }

        return $this->scope->canAccessProfile($user, $profile) ? $profile->id : null;
    }
}