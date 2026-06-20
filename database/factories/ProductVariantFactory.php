<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $sku = strtoupper(Str::random(3)).'-'.fake()->unique()->bothify('#####');

        return [
            'product_id' => Product::factory(),
            'sku' => $sku,
            'barcode' => fake()->unique()->ean13(),
            'color' => fake()->safeColorName(),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL', '42', '44']),
            'price' => fake()->randomFloat(2, 10, 200),
            'reorder_level' => fake()->numberBetween(5, 50),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
