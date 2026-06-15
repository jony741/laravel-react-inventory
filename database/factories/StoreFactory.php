<?php

namespace Database\Factories;

use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Store',
            'type' => fake()->randomElement(['STORE', 'WAREHOUSE']),
            'code' => strtoupper(fake()->unique()->bothify('??##')),
            'address' => fake()->address(),
            'phone' => fake()->e164PhoneNumber(),
            'is_active' => true,
        ];
    }

    public function warehouse(): static
    {
        return $this->state(fn (): array => ['type' => 'WAREHOUSE']);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
