<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GuardianStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $examples = [
            [
                'guardian' => [
                    'name' => 'Siti Nurhaliza',
                    'email' => 'wali.siti@example.com',
                    'phone' => '081234567890',
                ],
                'student' => [
                    'name' => 'Aisyah Rahma',
                    'email' => 'aisyah.rahma@example.com',
                    'class' => 'Kelas 3',
                ],
            ],
            [
                'guardian' => [
                    'name' => 'Ahmad Fauzi',
                    'email' => 'wali.ahmad@example.com',
                    'phone' => '081298765432',
                ],
                'student' => [
                    'name' => 'Muhammad Yusuf',
                    'email' => 'muhammad.yusuf@example.com',
                    'class' => 'Kelas 4',
                ],
            ],
        ];

        foreach ($examples as $pair) {
            $guardianUser = User::firstOrCreate(
                ['email' => $pair['guardian']['email']],
                [
                    'name' => $pair['guardian']['name'],
                    'password' => Hash::make('Password!123'),
                    'email_verified_at' => now(),
                ],
            );
            $guardianUser->assignRole('wali');

            $guardian = Guardian::firstOrCreate(
                ['user_id' => $guardianUser->id],
                ['phone' => $pair['guardian']['phone']],
            );

            $classe = Classe::firstOrCreate(['name' => $pair['student']['class']]);

            $studentUser = User::firstOrCreate(
                ['email' => $pair['student']['email']],
                [
                    'name' => $pair['student']['name'],
                    'password' => Hash::make('Password!123'),
                    'email_verified_at' => now(),
                ],
            );
            $studentUser->assignRole('student');

            $student = Student::firstOrCreate(
                ['user_id' => $studentUser->id],
                [
                    'nis' => Student::generateNis(),
                    'class_id' => $classe->id,
                ],
            );

            $guardian->students()->syncWithoutDetaching([$student->id]);
        }

        Guardian::with(['user:id,name,email', 'students.user:id,name'])
            ->get()
            ->each(function (Guardian $guardian) {
                $rows = $guardian->students->map(
                    fn (Student $student) => sprintf(
                        '- %s (%s)',
                        $student->user->name,
                        $student->user->email,
                    ),
                )->implode(PHP_EOL);

                info(PHP_EOL.'Wali: '.$guardian->user->name.' ('.$guardian->user->email.')'.PHP_EOL.$rows.PHP_EOL);
            });
    }
}
