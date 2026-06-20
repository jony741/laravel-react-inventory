<?php

namespace App\Models;

use Database\Factories\PurChaseOrderReceiptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $grn_number
 * @property int $purchase_order_id
 * @property int $store_id
 * @property Carbon $received_date
 * @property int $received_by
 * @property string|null $supplier_invoice_no
 * @property Carbon|null $supplier_invoice_date
 * @property string $shipping_cost
 * @property string $custom_duty
 * @property string $other_cost
 * @property string $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'grn_number', 'purchase_order_id', 'store_id', 'received_date', 'received_by',
    'supplier_invoice_no', 'supplier_invoice_date', 'shipping_cost', 'custom_duty',
    'other_cost', 'status', 'notes'
])]
class PurChaseOrderReceipt extends Model
{
    /** @use HasFactory<PurChaseOrderReceiptFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'purchase_order_receipts';

    protected function casts(): array
    {
        return [
            'received_date' => 'date',
            'supplier_invoice_date' => 'date',
            'shipping_cost' => 'decimal:2',
            'custom_duty' => 'decimal:2',
            'other_cost' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<PurchaseOrder, $this> */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /** @return BelongsTo<User, $this> */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /** @return HasMany<PurChaseOrderReceiptItem> */
    public function items(): HasMany
    {
        return $this->hasMany(PurChaseOrderReceiptItem::class, 'purchase_order_receipt_id');
    }
}
