<?php

namespace Database\Seeders;

use App\Models\Hafalan;
use App\Models\Student;
use App\Models\Surah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class HafalanSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::with(['class.teacher'])->get();
        $surahs = Surah::all();

        if ($students->isEmpty() || $surahs->isEmpty()) {
            $this->command?->warn('HafalanSeeder: Tidak ada data santri atau surah untuk disemai.');
            return;
        }

        $studentIds = $students->pluck('id');
        $cutoff = Carbon::today()->subDays(90)->toDateString();

        Hafalan::query()
            ->whereIn('student_id', $studentIds)
            ->where('date', '>=', $cutoff)
            ->delete();

        $today = Carbon::today();
        $payload = [];

        foreach ($students as $student) {
            $teacherId = $student->class?->teacher?->id;

            for ($day = 0; $day < 90; $day++) {
                $date = $today->copy()->subDays($day);
                $surah = $surahs->random();

                $fromAyah = random_int(1, $surah->ayah_count);
                $toAyah = min($surah->ayah_count, $fromAyah + random_int(0, 3));

                $status = random_int(0, 10) > 3 ? 'selesai' : 'murojaah';
                $notes = $status === 'murojaah' ? 'Perlu penguatan bacaan pada bagian ini.' : null;

                $payload[] = [
                    'student_id' => $student->id,
                    'teacher_id' => $teacherId,
                    'surah_id' => $surah->id,
                    'from_ayah' => $fromAyah,
                    'to_ayah' => $toAyah,
                    'date' => $date->toDateString(),
                    'status' => $status,
                    'notes' => $notes,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        collect($payload)
            ->chunk(1000)
            ->each(fn ($chunk) => Hafalan::insert($chunk->toArray()));

        $this->command?->info(sprintf(
            'HafalanSeeder: Membuat %d data hafalan untuk %d santri (90 hari terakhir).',
            count($payload),
            $students->count(),
        ));
    }
}
