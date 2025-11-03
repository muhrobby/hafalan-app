<?php

namespace Tests;

use Database\Seeders\RoleSeeder;
use Database\Seeders\SurahSeeder;

trait TestHelpers
{
    /**
     * Setup roles and surahs needed for tests
     */
    protected function setUpTestData(): void
    {
        // Seed roles (admin, teacher, student, wali)
        $this->seed(RoleSeeder::class);
        
        // Seed surahs if needed
        $this->seed(SurahSeeder::class);
    }

    /**
     * Create an admin user for testing
     */
    protected function createAdminUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    /**
     * Create a teacher user for testing
     */
    protected function createTeacherUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('teacher');
        return $user;
    }

    /**
     * Create a student user for testing
     */
    protected function createStudentUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('student');
        return $user;
    }

    /**
     * Create a guardian/wali user for testing
     */
    protected function createGuardianUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('wali');
        return $user;
    }
}
