<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $faker = Faker::create('id_ID');

        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => 'Admin '.$i,
                'email' => "admin{$i}@hafalan.local",
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('admin');
        }


        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => 'Ustadz '.$i,
                'email' => "ustadz{$i}@hafalan.local",
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('teacher');

            Teacher::create([
                'user_id' => $user->id,
                'nip' => 'UST' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'phone' => $faker->phoneNumber(),
            ]);
        }

        $teachers = Teacher::all();
        foreach (range(1, 5) as $i) {
            Classe::create([
                'name' => 'Kelas '.$i,
                'teacher_id' => $teachers->random()->id,
            ]);
        }

        $classes = Classe::all();
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => 'Santri '.$i,
                'email' => "santri{$i}@hafalan.local",
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('student');

            Student::create([
                'user_id' => $user->id,
                'nis' => 'ST' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'birth_date' => $faker->date('Y-m-d', '2015-01-01'),
                'class_id' => $classes->random()->id,
            ]);
        }

        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => 'Wali '.$i,
                'email' => "wali{$i}@hafalan.local",
                'password' => Hash::make('Password!123'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('wali');

            $guardian = Guardian::create([
                'user_id' => $user->id,
                'phone' => $faker->phoneNumber(),
            ]);
        }

$randomStudents = Student::inRandomOrder()->limit(rand(1, 2))->pluck('id');
$guardian->students()->syncWithoutDetaching($randomStudents);


    }
}
