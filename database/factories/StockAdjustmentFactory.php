<?php

namespace Database\Factories;

use App\Models\StockAdjustment;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StockAdjustment>
 */
class StockAdjustmentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'reference_number' => 'ADJ-'.strtoupper(Str::random(8)),
            'store_id' => Store::factory(),
            'adjustment_date' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'reason' => fake()->randomElement(['DAMAGE', 'EXPIRY', 'THEFT', 'STOCKTAKE', 'OTHER']),
            'description' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(['PENDING', 'APPROVED', 'REJECTED']),
            'created_by' => User::factory(),
        ];
    }
}
