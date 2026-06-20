<?php

namespace App\Models;

use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $po_number
 * @property int $supplier_id
 * @property int $store_id
 * @property Carbon $order_date
 * @property Carbon|null $expected_date
 * @property Carbon|null $received_date
 * @property string $status
 * @property string $shipping_cost
 * @property string $custom_duty
 * @property string $other_cost
 * @property string $payment_status
 * @property int|null $approved_by
 * @property string $discount_type
 * @property string $supplier_invoice_number
 * @property Carbon|null $supplier_invoice_date
 * @property string $subtotal
 * @property string $tax
 * @property string $discount
 * @property string $total_amount
 * @property string|null $notes
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'po_number', 'supplier_id', 'store_id', 'order_date', 'expected_date', 'received_date',
    'shipping_cost', 'custom_duty', 'other_cost', 'payment_status', 'approved_by', 'discount_type', 'supplier_invoice_number',
    'supplier_invoice_date', 'status', 'subtotal', 'tax', 'discount', 'total_amount', 'notes', 'created_by'
])]
class PurchaseOrder extends Model
{
    /** @use HasFactory<PurchaseOrderFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'expected_date' => 'date',
            'received_date' => 'date',
            'supplier_invoice_date' => 'date',
            'shipping_cost' => 'decimal:2',
            'custom_duty' => 'decimal:2',
            'other_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** @return HasMany<PurchaseOrderItem> */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
