<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockAdjustmentItem>
 */
class StockAdjustmentItemFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $type = fake()->randomElement(['IN', 'OUT']);

        return [
            'adjustment_id' => StockAdjustment::factory(),
            'variant_id' => ProductVariant::factory(),
            'qty' => fake()->numberBetween(1, 50),
            'type' => $type,
            'note' => fake()->optional()->sentence(),
        ];
    }
}
