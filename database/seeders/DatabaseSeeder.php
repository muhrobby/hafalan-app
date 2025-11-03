<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\SurahSeeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RoleSeeder::class,
            SurahSeeder::class,
            // GuardianStudentSeeder::class,
            // HafalanSeeder::class,

        ]);

        $u = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $u->syncRoles(['admin']);
    }
}
