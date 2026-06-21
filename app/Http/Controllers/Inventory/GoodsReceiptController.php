<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\GoodsReceiptRequest;
use App\Models\PurchaseOrder;
use App\Models\PurChaseOrderReceipt;
use App\Models\PurChaseOrderReceiptItem;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GoodsReceiptController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inventory/goods-receipts/index', [
            'goodsReceipts' => Inertia::defer(fn () => PurChaseOrderReceipt::with(['purchaseOrder.supplier', 'store', 'receiver', 'items.variant.product'])
                ->latest()
                ->paginate(10)),
            'approvedPurchaseOrders' => PurchaseOrder::with([
                'supplier',
                'store',
                'items' => fn ($query) => $query->with('variant.product')->withSum('receiptItems', 'accepted_qty'),
            ])
                ->whereIn('status', ['APPROVED', 'PARTIALLY_RECEIVED'])
                ->get(),
            'stores' => Store::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function create(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load([
            'supplier',
            'store',
            'items' => fn ($query) => $query->with('variant.product')->withSum('receiptItems', 'accepted_qty'),
        ]);

        return Inertia::render('admin/inventory/goods-receipts/create', [
            'purchaseOrder' => $purchaseOrder,
            'stores' => Store::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(GoodsReceiptRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('items');
        $data['grn_number'] = $this->generateGrnNumber();
        $data['received_by'] = Auth::id();
        $data['status'] = 'COMPLETED';

        DB::transaction(function () use ($data, $request) {
            $receipt = PurChaseOrderReceipt::create($data);

            foreach ($request->validated('items') as $itemData) {
                $grnItem = $receipt->items()->create($itemData);

                if ($data['status'] === 'COMPLETED' && $itemData['accepted_qty'] > 0) {
                    $this->createInventoryTransaction(
                        $grnItem,
                        (int) $data['store_id'],
                        $data['received_date']
                    );
                }
            }

            $this->updatePurchaseOrderStatus($request->validated('purchase_order_id'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Goods receipt created.')]);

        return redirect()->route('goods-receipts.index');
    }

    public function show(PurChaseOrderReceipt $goodsReceipt): Response
    {
        $goodsReceipt->load(['purchaseOrder.supplier', 'store', 'receiver', 'items.variant.product']);

        return Inertia::render('admin/inventory/goods-receipts/show', [
            'goodsReceipt' => $goodsReceipt,
        ]);
    }

    private function generateGrnNumber(): string
    {
        $latest = PurChaseOrderReceipt::withTrashed()->latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;

        return 'GRN-'.date('Y').'-'.str_pad($nextId, 4, '0', STR_PAD_LEFT);
    }

    private function updatePurchaseOrderStatus(int $purchaseOrderId): void
    {
        $purchaseOrder = PurchaseOrder::with([
            'items' => fn ($query) => $query->withSum('receiptItems', 'accepted_qty'),
        ])->find($purchaseOrderId);

        if (! $purchaseOrder) {
            return;
        }

        $totalOrdered = $purchaseOrder->items->sum('qty');
        $totalReceived = $purchaseOrder->items->sum('receipt_items_sum_accepted_qty') ?? 0;

        if ($totalReceived >= $totalOrdered) {
            $purchaseOrder->update(['status' => 'RECEIVED']);
        } elseif ($totalReceived > 0) {
            $purchaseOrder->update(['status' => 'PARTIALLY_RECEIVED']);
        }
    }

    private function createInventoryTransaction(PurChaseOrderReceiptItem $grnItem, int $storeId, string $receivedDate): void
    {
        DB::table('inventory_transactions')->insert([
            'date' => $receivedDate,
            'store_id' => $storeId,
            'variant_id' => $grnItem->product_variant_id,
            'transaction_type' => 'GRN',
            'reference_type' => PurChaseOrderReceiptItem::class,
            'reference_id' => $grnItem->id,
            'qty_in' => $grnItem->accepted_qty,
            'qty_out' => 0,
            'unit_purchase_cost_price' => $grnItem->unit_purchase_cost_price,
            'unit_shipping_cost' => $grnItem->unit_shipping_cost,
            'unit_custom_duty' => $grnItem->unit_custom_duty,
            'unit_other_cost' => $grnItem->unit_other_cost,
            'total_cost_price' => $grnItem->total_cost_price,
            'notes' => $grnItem->notes,
            'created_by' => Auth::id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
