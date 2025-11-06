<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\HafalanController;
use App\Http\Controllers\ScoreSummaryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\TeachersController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WaliAnalyticsController;
use App\Models\Classe;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
            return redirect()
            ->route('login');
})->name('home');

Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();

        $analytics = [
            'students' => Profile::whereNotNull('nis')->count(),
            'teachers' => Profile::whereNotNull('nip')->count(),
            'guardians' => Profile::whereHas('user', fn($q) => $q->role('wali'))->count(),
            'classes'  => Classe::count(),
            'users'    => User::count(),
        ];

        $guardianAnalytics = null;
        $dashboardAnalytics = null;

        // Guardian Analytics
        if ($user && $user->hasAnyRole(['guardian', 'wali'])) {
            $guardianAnalytics = app(WaliAnalyticsController::class)->data($request);
        }

        // Admin & Teacher Analytics
        if ($user && $user->hasAnyRole(['admin', 'teacher', 'guru'])) {
            $dashboardAnalytics = app(AnalyticsController::class)->getData($request);
        }

        return Inertia::render('dashboard', [
            'analytics' => $analytics,
            'guardianAnalytics' => $guardianAnalytics,
            'dashboardAnalytics' => $dashboardAnalytics,
        ]);
    })->name('dashboard');

    Route::resource('users', UserController::class)->except('show', 'create', 'edit');
    Route::resource('students', StudentsController::class)->except('create', 'show', 'edit');
    Route::post('students/with-guardian', [StudentsController::class, 'storeWithGuardian'])->name('students.with-guardian');
    Route::post('students/import', [StudentsController::class, 'import'])->name('students.import');
    Route::get('students/template', [StudentsController::class, 'template'])->name('students.template');
    Route::get('students/export', [StudentsController::class, 'export'])->name('students.export');

    Route::resource('teachers', TeachersController::class)->except('create', 'show', 'edit');
    Route::post('teachers/import', [TeachersController::class, 'import'])->name('teachers.import');
    Route::get('teachers/template', [TeachersController::class, 'template'])->name('teachers.template');
    Route::get('teachers/export', [TeachersController::class, 'export'])->name('teachers.export');

    Route::resource('guardians', GuardianController::class)->except('create', 'show', 'edit');
    Route::post('guardians/quick', [GuardianController::class, 'quickStore'])->name('guardians.quick');
    Route::post('guardians/import', [GuardianController::class, 'import'])->name('guardians.import');
    Route::get('guardians/export', [GuardianController::class, 'export'])->name('guardians.export');

    Route::resource('admins', AdminUserController::class)->except('create', 'show', 'edit');
    Route::post('admins/import', [AdminUserController::class, 'import'])->name('admins.import');
    Route::get('admins/export', [AdminUserController::class, 'export'])->name('admins.export');

    Route::resource('hafalan', HafalanController::class)->only(['index', 'create', 'store']);

    Route::post('/admin/password/temp', [ResetPasswordController::class, 'setTemporary'])
        ->name('admin.password.temp');

    Route::get('/reports/students/{student}', [ReportController::class, 'student'])
        ->name('reports.students');

    Route::get('/analytics', [AnalyticsController::class, 'index'])
        ->name('analytics.index');

    Route::get('/wali/analytics', [WaliAnalyticsController::class, 'index'])
        ->name('wali.analytics.index');

    Route::get('/akademik/rekap-nilai', [ScoreSummaryController::class, 'index'])
        ->name('akademik.recap');
});

// Route model binding untuk Profile
Route::bind('student', function ($value) {
    return \App\Models\Profile::whereNotNull('nis')->findOrFail($value);
});

Route::bind('guardian', function ($value) {
    return \App\Models\Profile::whereHas('user', fn($q) => $q->role('wali'))->findOrFail($value);
});

Route::bind('teacher', function ($value) {
    return \App\Models\Profile::whereNotNull('nip')->findOrFail($value);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
