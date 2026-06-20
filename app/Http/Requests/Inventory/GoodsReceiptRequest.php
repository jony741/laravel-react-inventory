<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'store_id' => ['required', 'exists:stores,id'],
            'received_date' => ['required', 'date'],
            'supplier_invoice_no' => ['nullable', 'string', 'max:100'],
            'supplier_invoice_date' => ['nullable', 'date'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'custom_duty' => ['nullable', 'numeric', 'min:0'],
            'other_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'exists:purchase_order_items,id'],
            'items.*.product_variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.ordered_qty' => ['required', 'integer', 'min:0'],
            'items.*.received_qty' => ['required', 'integer', 'min:0'],
            'items.*.accepted_qty' => ['required', 'integer', 'min:0'],
            'items.*.rejected_qty' => ['nullable', 'integer', 'min:0'],
            'items.*.rejection_reason' => ['nullable', 'string'],
            'items.*.unit_purchase_cost_price' => ['required', 'numeric', 'min:0'],
            'items.*.unit_shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.unit_custom_duty' => ['nullable', 'numeric', 'min:0'],
            'items.*.unit_other_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.total_cost_price' => ['required', 'numeric', 'min:0'],
            'items.*.batch_number' => ['nullable', 'string', 'max:100'],
            'items.*.expiry_date' => ['nullable', 'date'],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }
}
