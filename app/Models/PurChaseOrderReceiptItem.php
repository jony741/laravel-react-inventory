<?php

namespace App\Models;

use Database\Factories\PurChaseOrderReceiptItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $purchase_order_receipt_id
 * @property int $purchase_order_item_id
 * @property int $product_variant_id
 * @property int $ordered_qty
 * @property int $received_qty
 * @property int $accepted_qty
 * @property int $rejected_qty
 * @property string|null $rejection_reason
 * @property string $unit_purchase_cost_price
 * @property string $unit_shipping_cost
 * @property string $unit_custom_duty
 * @property string $unit_other_cost
 * @property string $total_cost_price
 * @property string|null $batch_number
 * @property Carbon|null $expiry_date
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'purchase_order_receipt_id', 'purchase_order_item_id', 'product_variant_id',
    'ordered_qty', 'received_qty', 'accepted_qty', 'rejected_qty', 'rejection_reason',
    'unit_purchase_cost_price', 'unit_shipping_cost', 'unit_custom_duty', 'unit_other_cost',
    'total_cost_price', 'batch_number', 'expiry_date', 'notes',
])]
class PurChaseOrderReceiptItem extends Model
{
    /** @use HasFactory<PurChaseOrderReceiptItemFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'purchase_order_receipt_items';

    protected function casts(): array
    {
        return [
            'ordered_qty' => 'integer',
            'received_qty' => 'integer',
            'accepted_qty' => 'integer',
            'rejected_qty' => 'integer',
            'unit_purchase_cost_price' => 'decimal:2',
            'unit_shipping_cost' => 'decimal:2',
            'unit_custom_duty' => 'decimal:2',
            'unit_other_cost' => 'decimal:2',
            'total_cost_price' => 'decimal:2',
            'expiry_date' => 'date',
        ];
    }

    /** @return BelongsTo<PurChaseOrderReceipt, $this> */
    public function receipt(): BelongsTo
    {
        return $this->belongsTo(PurChaseOrderReceipt::class, 'purchase_order_receipt_id');
    }

    /** @return BelongsTo<PurchaseOrderItem, $this> */
    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
