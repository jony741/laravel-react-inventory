<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesOrderItem>
 */
class SalesOrderItemFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 50);
        $price = fake()->randomFloat(2, 10, 200);

        return [
            'sales_order_id' => SalesOrder::factory(),
            'variant_id' => ProductVariant::factory(),
            'qty' => $qty,
            'price' => $price,
            'subtotal' => round($qty * $price, 2),
            'shipped_qty' => 0,
        ];
    }
}
