<?php

namespace App\Models;

use Database\Factories\PurchaseOrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $purchase_order_id
 * @property int $variant_id
 * @property int $qty
 * @property string $cost
 * @property string $subtotal
 * @property bool $discount_percentage
 * @property string|null $discount
 * @property string|null $tax_percentage
 * @property int $received_qty
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['purchase_order_id', 'variant_id', 'qty', 'cost', 'subtotal', 'discount_percentage', 'discount', 'tax_percentage', 'received_qty'])]
class PurchaseOrderItem extends Model
{
    /** @use HasFactory<PurchaseOrderItemFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'received_qty' => 'integer',
            'cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_percentage' => 'boolean',
        ];
    }

    /** @return BelongsTo<PurchaseOrder, $this> */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
