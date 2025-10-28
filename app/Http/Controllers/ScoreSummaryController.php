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

class ScoreSummaryController extends Controller
{
    public function __construct(private ScopeService $scope)
    {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('view-hafalan');

        $user = $request->user();
        [$from, $to] = $this->resolvePeriod(
            $request->query('from'),
            $request->query('to'),
        );

        $studentFilter = $request->query('student_id');
        $classFilter = $request->query('class_id');

        $profiles = $this->scope
            ->profilesForUser($user)
            ->when($studentFilter, fn ($collection) => $collection->where('id', (int) $studentFilter))
            ->when($classFilter, fn ($collection) => $collection->filter(fn (Profile $profile) => $profile->class_id == (int) $classFilter))
            ->values();

        $profileIds = $profiles->pluck('id');

        $summaries = $this->scope
            ->applyHafalanScope(Hafalan::query(), $user)
            ->whereIn('student_id', $profileIds)
            ->when($classFilter, fn ($query) => $query->whereHas('student', fn ($q) => $q->where('class_id', $classFilter)))
            ->betweenDates($from->toDateString(), $to->toDateString())
            ->selectRaw('student_id, COUNT(*) as total_records')
            ->selectRaw("SUM(CASE WHEN status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
            ->selectRaw("SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $rows = $profiles->map(function (Profile $profile) use ($summaries) {
            $summary = $summaries->get($profile->id);

            return [
                'id' => $profile->id,
                'name' => $profile->user->name,
                'class' => $profile->class?->name,
                'totalSetoran' => (int) ($summary->total_records ?? 0),
                'totalMurojaah' => (int) ($summary->total_murojaah ?? 0),
                'totalSelesai' => (int) ($summary->total_selesai ?? 0),
                'records' => (int) ($summary->total_records ?? 0),
            ];
        })
            ->filter(fn ($row) => $row['records'] > 0)
            ->values()
            ->toArray();

        return Inertia::render('akademik/Recap', [
            'rows' => $rows,
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'student_id' => $studentFilter,
                'class_id' => $classFilter,
            ],
            'availableFilters' => [
                'students' => $profiles
                    ->map(fn (Profile $profile) => [
                        'id' => $profile->id,
                        'name' => $profile->user->name,
                    ])
                    ->values()
                    ->toArray(),
                'classes' => $profiles
                    ->pluck('class')
                    ->filter()
                    ->unique('id')
                    ->map(fn ($class) => [
                        'id' => $class->id,
                        'name' => $class->name,
                    ])
                    ->values()
                    ->toArray(),
            ],
        ]);
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
}