<?php

namespace App\Providers;

use App\Models\Guardian;
use App\Models\Profile;
use App\Models\Student;
use App\Models\Teacher;
use App\Policies\GuardianPolicy;
use App\Policies\ProfilePolicy;
use App\Policies\StudentPolicy;
use App\Policies\TeacherPolicy;
use App\Support\ScopeService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Profile::class => ProfilePolicy::class,
        // Keep old policies for backward compatibility
        Guardian::class => GuardianPolicy::class,
        Student::class => StudentPolicy::class,
        Teacher::class => TeacherPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {

        Gate::define('manage-users', fn ($user) => $user->hasRole('admin'));
        Gate::define('input-hafalan', fn ($user) => $user->hasAnyRole(['admin', 'teacher']));
        Gate::define('view-hafalan', fn ($user) => $user->hasAnyRole(['admin', 'teacher', 'guardian', 'wali', 'student']));
        Gate::define('view-analytics', fn ($user) => $user->hasAnyRole(['admin', 'teacher', 'student']));
        Gate::define('view-wali-analytics', fn ($user) => $user->hasAnyRole(['guardian', 'wali']));
        Gate::define('view-student-report', function ($user, Profile $student) {
            /** @var ScopeService $scope */
            $scope = app(ScopeService::class);

            return $scope->canAccessProfile($user, $student);
        });
    }
}
