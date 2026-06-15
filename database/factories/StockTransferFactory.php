<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StockTransfer>
 */
class StockTransferFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'transfer_number' => 'ST-'.strtoupper(Str::random(8)),
            'from_store_id' => Store::factory(),
            'to_store_id' => Store::factory(),
            'transfer_date' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'received_date' => null,
            'status' => fake()->randomElement(['DRAFT', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED']),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
