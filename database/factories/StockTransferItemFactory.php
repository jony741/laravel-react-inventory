<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockTransferItem>
 */
class StockTransferItemFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 100);

        return [
            'transfer_id' => StockTransfer::factory(),
            'variant_id' => ProductVariant::factory(),
            'qty' => $qty,
            'received_qty' => 0,
        ];
    }
}
