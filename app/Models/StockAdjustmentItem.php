<?php

namespace App\Models;

use Database\Factories\StockAdjustmentItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $adjustment_id
 * @property int $variant_id
 * @property int $qty
 * @property string $type
 * @property string|null $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['adjustment_id', 'variant_id', 'qty', 'type', 'note'])]
class StockAdjustmentItem extends Model
{
    /** @use HasFactory<StockAdjustmentItemFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
        ];
    }

    /** @return BelongsTo<StockAdjustment, $this> */
    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(StockAdjustment::class, 'adjustment_id');
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
