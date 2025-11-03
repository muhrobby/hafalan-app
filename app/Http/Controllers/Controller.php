<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Support\ScopeService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Carbon;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * Resolve period from query parameters
     * 
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function resolvePeriod(?string $from, ?string $to): array
    {
        $fromDate = $from ? Carbon::parse($from) : now()->startOfMonth();
        $toDate = $to ? Carbon::parse($to) : now();

        if ($fromDate->greaterThan($toDate)) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        return [$fromDate->startOfDay(), $toDate->endOfDay()];
    }

    /**
     * Resolve student filter with access check
     */
    protected function resolveStudentFilter($user, $studentId, ScopeService $scope): ?int
    {
        if (!$studentId) {
            return null;
        }

        $profile = Profile::find($studentId);

        if (!$profile) {
            return null;
        }

        return $scope->canAccessProfile($user, $profile) ? $profile->id : null;
    }
}
