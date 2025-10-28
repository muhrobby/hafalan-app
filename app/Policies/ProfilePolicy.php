<?php

namespace App\Policies;

use App\Models\Profile;
use App\Models\User;

class ProfilePolicy
{
    /**
     * Determine whether the user can view any profiles.
     */
    public function viewAny(User $user): bool
    {
        // Everyone can view list (will be filtered by role)
        return true;
    }

    /**
     * Determine whether the user can view the profile.
     */
    public function view(User $user, Profile $profile): bool
    {
        // Own profile or has manage-users permission
        return $user->id === $profile->user_id || $user->can('manage-users');
    }

    /**
     * Determine whether the user can create profiles.
     */
    public function create(User $user): bool
    {
        return $user->can('manage-users');
    }

    /**
     * Determine whether the user can update the profile.
     */
    public function update(User $user, Profile $profile): bool
    {
        return $user->can('manage-users');
    }

    /**
     * Determine whether the user can delete the profile.
     */
    public function delete(User $user, Profile $profile): bool
    {
        return $user->can('manage-users');
    }

    /**
     * Determine whether the user can restore the profile.
     */
    public function restore(User $user, Profile $profile): bool
    {
        return $user->can('manage-users');
    }

    /**
     * Determine whether the user can permanently delete the profile.
     */
    public function forceDelete(User $user, Profile $profile): bool
    {
        return $user->can('manage-users');
    }
}
