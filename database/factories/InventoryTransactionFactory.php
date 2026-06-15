<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use App\Models\InventoryTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryTransaction>
 */
class InventoryTransactionFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $type = fake()->randomElement(['PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT']);
        $isIn = in_array($type, ['PURCHASE', 'TRANSFER_IN'], true);

        return [
            'date' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'store_id' => Store::factory(),
            'variant_id' => ProductVariant::factory(),
            'transaction_type' => $type,
            'reference_type' => null,
            'reference_id' => null,
            'qty_in' => $isIn ? fake()->numberBetween(1, 100) : 0,
            'qty_out' => $isIn ? 0 : fake()->numberBetween(1, 100),
            'unit_cost' => fake()->randomFloat(2, 5, 100),
            'unit_price' => fake()->randomFloat(2, 10, 200),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
