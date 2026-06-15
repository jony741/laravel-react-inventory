<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'po_number' => 'PO-'.strtoupper(Str::random(8)),
            'supplier_id' => Supplier::factory(),
            'store_id' => Store::factory(),
            'order_date' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'expected_date' => fake()->optional()->dateTimeBetween('now', '+1 month')?->format('Y-m-d'),
            'received_date' => null,
            'status' => fake()->randomElement(['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED']),
            'subtotal' => 0,
            'tax' => 0,
            'discount' => 0,
            'total_amount' => 0,
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
