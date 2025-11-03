<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nis' => fake()->optional()->numerify('##########'),
            'nip' => fake()->optional()->numerify('##########'),
            'phone' => fake()->optional()->numerify('08##########'),
            'birth_date' => fake()->date('Y-m-d', '-10 years'),
            'address' => fake()->optional()->address(),
            'class_id' => fake()->optional()->randomElement(Classe::pluck('id')->toArray() ?: [null]),
            'entry_year' => fake()->optional()->year(),
        ];
    }

    /**
     * Indicate that this profile is for a student
     */
    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'nis' => fake()->unique()->numerify('##########'),
            'nip' => null,
        ]);
    }

    /**
     * Indicate that this profile is for a teacher
     */
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'nip' => fake()->unique()->numerify('##########'),
            'nis' => null,
            'class_id' => null,
        ]);
    }

    /**
     * Set specific NIS
     */
    public function withNis(string $nis): static
    {
        return $this->state(fn (array $attributes) => [
            'nis' => $nis,
        ]);
    }

    /**
     * Set specific phone number
     */
    public function withPhone(string $phone): static
    {
        return $this->state(fn (array $attributes) => [
            'phone' => $phone,
        ]);
    }

    /**
     * Set specific class
     */
    public function withClass(int $classId): static
    {
        return $this->state(fn (array $attributes) => [
            'class_id' => $classId,
        ]);
    }
}
