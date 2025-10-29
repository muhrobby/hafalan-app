<?php

namespace App\Http\Controllers;

use App\Models\Hafalan;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function student(Profile $student, Request $request)
    {
        if (!$student->isStudent()) {
            abort(404, 'Not a student profile');
        }
        Gate::authorize('view-student-report', $student);

        $fromInput = $request->query('from');
        $toInput = $request->query('to');

        $fromDate = $fromInput ? Carbon::parse($fromInput) : null;
        $toDate = $toInput ? Carbon::parse($toInput) : null;

        $hafalanQuery = Hafalan::query()
            ->with([
                'surah:id,code,name',
                'teacher.user:id,name',
            ])
            ->where('student_id', $student->id)
            ->betweenDates($fromDate?->toDateString(), $toDate?->toDateString())
            ->orderBy('date');

        $entries = $hafalanQuery->get();

        $summary = [
            'totalSetoran' => $entries->count(),
            'totalMurojaah' => $entries->where('status', 'murojaah')->count(),
            'totalSelesai' => $entries->where('status', 'selesai')->count(),
        ];

        $period = [
            'from' => $fromDate?->toDateString(),
            'to' => $toDate?->toDateString(),
        ];

        $student->loadMissing([
            'user:id,name,email',
            'class.teachers.user:id,name',
        ]);

        $viewData = [
            'student' => $student,
            'hafalan' => $entries,
            'summary' => $summary,
            'period' => $period,
            'generatedAt' => now(),
            'schoolHeadName' => config('app.school_head_name', 'Ustadz Ahmad'),
            'fromInput' => $fromInput,
            'toInput' => $toInput,
        ];

        $filenameBase = Str::slug($student->user->name ?: "santri-{$student->id}");
        $filename = "rapor-santri-{$filenameBase}.pdf";

        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.student_report', $viewData);

            return $pdf->download($filename);
        }

        return response()
            ->view('pdf.student_report', $viewData)
            ->header('Content-Type', 'text/html');
    }
}
