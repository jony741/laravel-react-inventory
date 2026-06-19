<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\PurchaseOrderRequest;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\Store;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inventory/purchase-orders/index', [
            'purchaseOrders' => Inertia::defer(fn () => PurchaseOrder::with(['supplier', 'store', 'items.variant.product'])
                ->latest()
                ->paginate(10)),
            'suppliers' => Supplier::where('is_active', true)->get(['id', 'name', 'phone', 'address']),
            'stores' => Store::where('is_active', true)->get(['id', 'name']),
            'variants' => ProductVariant::with('product')
                ->where('is_active', true)
                ->get(['id', 'product_id', 'sku', 'barcode', 'color', 'size', 'cost', 'price']),
        ]);
    }

    public function store(PurchaseOrderRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('items');
        $data['created_by'] = Auth::id();
        $data['po_number'] = $this->generatePoNumber();
        $data['status'] = 'DRAFT';

        $purchaseOrder = PurchaseOrder::create($data);

        if ($request->has('items')) {
            foreach ($request->validated('items') as $item) {
                $purchaseOrder->items()->create($item);
            }
        }

        $this->recalculateTotals($purchaseOrder);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase order created.')]);

        return back();
    }

    public function update(PurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $data = $request->safe()->except('items');

        $purchaseOrder->update($data);

        if ($request->has('items')) {
            $itemIds = [];

            foreach ($request->validated('items') as $itemData) {
                if (isset($itemData['id'])) {
                    $item = $purchaseOrder->items()->find($itemData['id']);
                    if ($item) {
                        $item->update($itemData);
                        $itemIds[] = $item->id;
                    }
                } else {
                    $newItem = $purchaseOrder->items()->create($itemData);
                    $itemIds[] = $newItem->id;
                }
            }

            $purchaseOrder->items()->whereNotIn('id', $itemIds)->delete();
        }

        $this->recalculateTotals($purchaseOrder);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase order updated.')]);

        return back();
    }

    public function approve(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $purchaseOrder->update([
            'status' => 'APPROVED',
            'approved_by' => Auth::id(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase order approved.')]);

        return back();
    }

    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $purchaseOrder->items()->delete();
        $purchaseOrder->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase order deleted.')]);

        return back();
    }

    private function generatePoNumber(): string
    {
        $latest = PurchaseOrder::withTrashed()->latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;

        return 'PO-'.date('Y').'-'.str_pad($nextId, 4, '0', STR_PAD_LEFT);
    }

    private function recalculateTotals(PurchaseOrder $purchaseOrder): void
    {
        $purchaseOrder->load('items');

        $subtotal = 0;
        $totalTax = 0;

        foreach ($purchaseOrder->items as $item) {
            $itemSubtotal = $item->qty * $item->cost;

            if ($item->discount) {
                if ($item->discount_percentage) {
                    $itemSubtotal -= $itemSubtotal * (floatval($item->discount) / 100);
                } else {
                    $itemSubtotal -= floatval($item->discount);
                }
            }

            if ($item->tax_percentage) {
                $totalTax += $itemSubtotal * (floatval($item->tax_percentage) / 100);
            }

            $subtotal += $itemSubtotal;
        }

        // Calculate discount based on discount_type
        $discountValue = floatval($purchaseOrder->discount);
        $discount = $purchaseOrder->discount_type === 'PERCENTAGE'
            ? ($subtotal * $discountValue / 100)
            : $discountValue;

        $shippingCost = floatval($purchaseOrder->shipping_cost);
        $totalAmount = $subtotal + $totalTax - $discount + $shippingCost;

        $purchaseOrder->update([
            'subtotal' => $subtotal,
            'tax' => $totalTax,
            'total_amount' => $totalAmount,
        ]);
    }
}
