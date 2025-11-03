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

class WaliAnalyticsController extends Controller
{
    public function __construct(private ScopeService $scope)
    {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('view-wali-analytics');

        return redirect()->route('dashboard', array_filter([
            'from' => $request->query('from'),
            'to' => $request->query('to'),
            'student_id' => $request->query('student_id'),
        ]));
    }

    public function data(Request $request): array
    {
        Gate::authorize('view-wali-analytics');

        $user = $request->user();
        [$from, $to] = $this->resolvePeriod(
            $request->query('from'),
            $request->query('to'),
        );

        $studentId = $this->resolveStudentFilter($user, $request->query('student_id'), $this->scope);

        $baseQuery = $this->scope
            ->applyHafalanScope(Hafalan::query(), $user)
            ->when($studentId, fn ($query, $id) => $query->where('student_id', $id))
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
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
            ->selectRaw("SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
            ->first();

        $summary = [
            'totalSetoran' => (int) ($aggregate->total ?? 0),
            'totalMurojaah' => (int) ($aggregate->total_murojaah ?? 0),
            'totalSelesai' => (int) ($aggregate->total_selesai ?? 0),
        ];

        $perChild = (clone $baseQuery)
            ->join('profiles', 'profiles.id', '=', 'hafalans.student_id')
            ->join('users', 'users.id', '=', 'profiles.user_id')
            ->selectRaw('profiles.id as student_id')
            ->selectRaw('users.name as student_name')
            ->selectRaw('COUNT(hafalans.id) as total')
            ->selectRaw("SUM(CASE WHEN hafalans.status = 'murojaah' THEN 1 ELSE 0 END) as total_murojaah")
            ->selectRaw("SUM(CASE WHEN hafalans.status = 'selesai' THEN 1 ELSE 0 END) as total_selesai")
            ->groupBy('profiles.id', 'users.name')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($row) => [
                'student_id' => $row->student_id,
                'student_name' => $row->student_name,
                'total' => (int) $row->total,
                'total_murojaah' => (int) $row->total_murojaah,
                'total_selesai' => (int) $row->total_selesai,
            ]);

        $availableStudents = $this->scope->studentOptions($user);

        $filters = [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'student_id' => $studentId ? (string) $studentId : null,
        ];

        return [
            'summary' => $summary,
            'trend' => $trend,
            'perChild' => $perChild,
            'filters' => $filters,
            'availableStudents' => $availableStudents,
        ];
    }
}
