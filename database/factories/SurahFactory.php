<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SurahFactory extends Factory
{
    public function definition(): array
    {
        static $surahNumber = 1;
        
        $surahs = [
            ['code' => '001', 'name' => 'Al-Fatihah', 'ayah_count' => 7],
            ['code' => '002', 'name' => 'Al-Baqarah', 'ayah_count' => 286],
            ['code' => '003', 'name' => 'Ali-Imran', 'ayah_count' => 200],
            ['code' => '004', 'name' => 'An-Nisa', 'ayah_count' => 176],
            ['code' => '005', 'name' => 'Al-Maidah', 'ayah_count' => 120],
            ['code' => '006', 'name' => 'Al-Anam', 'ayah_count' => 165],
            ['code' => '007', 'name' => 'Al-Araf', 'ayah_count' => 206],
            ['code' => '008', 'name' => 'Al-Anfal', 'ayah_count' => 75],
            ['code' => '009', 'name' => 'At-Taubah', 'ayah_count' => 129],
            ['code' => '010', 'name' => 'Yunus', 'ayah_count' => 109],
        ];

        $index = ($surahNumber - 1) % count($surahs);
        $surah = $surahs[$index];
        $surahNumber++;

        return [
            'code' => $surah['code'],
            'name' => $surah['name'],
            'ayah_count' => $surah['ayah_count'],
        ];
    }

    public function alFatihah(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => '001',
            'name' => 'Al-Fatihah',
            'ayah_count' => 7,
        ]);
    }

    public function alBaqarah(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => '002',
            'name' => 'Al-Baqarah',
            'ayah_count' => 286,
        ]);
    }

    public function withAyahCount(int $count): static
    {
        return $this->state(fn (array $attributes) => [
            'ayah_count' => $count,
        ]);
    }
}
