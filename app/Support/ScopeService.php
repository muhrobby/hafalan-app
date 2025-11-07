<?php

namespace App\Support;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ScopeService
{
    public function accessibleProfileIds(User $user): ?Collection
    {
        if ($user->hasRole('admin')) {
            return null;
        }

        if ($user->hasRole('teacher')) {
            // Teacher dapat mengakses semua student (tidak dibatasi oleh kelas)
            return null; // null = access all students
        }

        if ($user->hasAnyRole(['guardian', 'wali'])) {
            $profile = $user->profile;

            if (!$profile) {
                return collect();
            }

            // Explicitly select the student profile IDs to avoid ambiguity
            return Profile::query()
                ->select('profiles.id')
                ->join('profile_relations', 'profiles.id', '=', 'profile_relations.profile_id')
                ->where('profile_relations.related_profile_id', $profile->id)
                ->where('profile_relations.relation_type', 'guardian')
                ->pluck('profiles.id')
                ->unique();
        }

        if ($user->hasRole('student')) {
            $profile = $user->profile;

            if (!$profile) {
                return collect();
            }

            return collect([$profile->id]);
        }

        return collect();
    }

    public function profilesForUser(User $user): Collection
    {
        $query = Profile::query()
            ->with('user:id,name')
            ->whereNotNull('nis');

        if (!$user->hasRole('admin')) {
            $profileIds = $this->accessibleProfileIds($user);
            if ($profileIds !== null) {
                $query->whereIn('id', $profileIds);
            }
        }

        return $query->get();
    }

    public function applyHafalanScope(Builder $query, User $user): Builder
    {
        $profileIds = $this->accessibleProfileIds($user);

        if ($profileIds === null) {
            return $query;
        }

        return $query->whereIn('student_id', $profileIds);
    }

    public function applyProfileScope(Builder $query, User $user): Builder
    {
        $profileIds = $this->accessibleProfileIds($user);

        if ($profileIds === null) {
            return $query;
        }

        return $query->whereIn('profiles.id', $profileIds);
    }

    public function canAccessProfile(User $user, Profile $profile): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        // Teacher dapat mengakses semua student
        if ($user->hasRole('teacher')) {
            return true;
        }

        $profileIds = $this->accessibleProfileIds($user);
        
        // Jika null, artinya bisa akses semua
        if ($profileIds === null) {
            return true;
        }
        
        return $profileIds->contains($profile->id);
    }

    public function studentOptions(User $user): Collection
    {
        $query = Profile::query()
            ->select(['profiles.id', 'users.name'])
            ->join('users', 'users.id', '=', 'profiles.user_id')
            ->whereNotNull('profiles.nis');

        if (!$user->hasRole('admin')) {
            $query = $this->applyProfileScope($query, $user);
        }

        return $query
            ->orderBy('users.name')
            ->get()
            ->map(fn ($profile) => [
                'id' => $profile->id,
                'name' => $profile->name,
            ]);
    }

    public function teacherOptions(): Collection
    {
        return Profile::query()
            ->select(['profiles.id', 'users.name'])
            ->join('users', 'users.id', '=', 'profiles.user_id')
            ->whereNotNull('profiles.nip')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($profile) => [
                'id' => $profile->id,
                'name' => $profile->name,
            ]);
    }

    /**
     * DEPRECATED: Class system removed
     */
    public function classOptionsFor(User $user): Collection
    {
        return collect([]); // Class system removed
        
        // $query = \App\Models\Classe::query()
        //     ->select(['classes.id', 'classes.name']);

        // if ($user->hasRole('teacher')) {
        //     $query->whereHas('teachers', fn ($q) => $q->where('profiles.user_id', $user->id));
        // } elseif ($user->hasRole('student')) {
        //     $query->whereHas('students', fn ($q) => $q->where('profiles.user_id', $user->id));
        // } elseif ($user->hasAnyRole(['guardian', 'wali'])) {
        //     $query->whereHas('students', function ($q) use ($user) {
        //         $q->whereIn('profiles.id', function ($sq) use ($user) {
        //             $sq->select('profile_relations.profile_id')
        //                 ->from('profile_relations')
        //                 ->where('profile_relations.related_profile_id', $user->profile->id)
        //                 ->where('profile_relations.relation_type', 'guardian');
        //         });
        //     });
        // }

        // return $query
        //     ->orderBy('classes.name')
        //     ->get()
        //     ->map(fn ($class) => [
        //         'id' => $class->id,
        //         'name' => $class->name,
        //     ]);
    }
}