<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

class HafalanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Profile::factory(),
            'teacher_id' => Profile::factory(),
            'surah_id' => Surah::factory(),
            'from_ayah' => fake()->numberBetween(1, 10),
            'to_ayah' => fake()->numberBetween(11, 20),
            'date' => fake()->date(),
            'status' => fake()->randomElement(['murojaah', 'selesai']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function murojaah(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'murojaah',
        ]);
    }

    public function selesai(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'selesai',
        ]);
    }

    public function forDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => $date,
        ]);
    }

    public function withAyahRange(int $from, int $to): static
    {
        return $this->state(fn (array $attributes) => [
            'from_ayah' => $from,
            'to_ayah' => $to,
        ]);
    }
}
