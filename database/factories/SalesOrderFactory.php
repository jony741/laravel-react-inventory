<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\SalesOrder;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SalesOrder>
 */
class SalesOrderFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'order_number' => 'SO-'.strtoupper(Str::random(8)),
            'customer_id' => Customer::factory(),
            'store_id' => Store::factory(),
            'order_date' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'shipped_date' => null,
            'status' => fake()->randomElement(['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
            'subtotal' => 0,
            'tax' => 0,
            'discount' => 0,
            'total_amount' => 0,
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
