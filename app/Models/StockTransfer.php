<?php

namespace App\Models;

use Database\Factories\StockTransferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $transfer_number
 * @property int $from_store_id
 * @property int $to_store_id
 * @property Carbon $transfer_date
 * @property Carbon|null $received_date
 * @property string $status
 * @property string|null $notes
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['transfer_number', 'from_store_id', 'to_store_id', 'transfer_date', 'received_date', 'status', 'notes', 'created_by'])]
class StockTransfer extends Model
{
    /** @use HasFactory<StockTransferFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'transfer_date' => 'date',
            'received_date' => 'date',
        ];
    }

    /** @return BelongsTo<Store, $this> */
    public function fromStore(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'from_store_id');
    }

    /** @return BelongsTo<Store, $this> */
    public function toStore(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'to_store_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<StockTransferItem> */
    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class, 'transfer_id');
    }
}
