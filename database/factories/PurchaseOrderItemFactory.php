<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 100);
        $cost = fake()->randomFloat(2, 5, 100);

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'variant_id' => ProductVariant::factory(),
            'qty' => $qty,
            'cost' => $cost,
            'subtotal' => round($qty * $cost, 2),
            'received_qty' => 0,
        ];
    }
}
