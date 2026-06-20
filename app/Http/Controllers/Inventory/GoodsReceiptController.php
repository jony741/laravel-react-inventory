<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\GoodsReceiptRequest;
use App\Models\PurchaseOrder;
use App\Models\PurChaseOrderReceipt;
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
        ]);
    }

    public function create(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load(['supplier', 'store', 'items.variant.product']);

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
                $receipt->items()->create($itemData);

                $this->updatePurchaseOrderItemReceivedQty(
                    $itemData['purchase_order_item_id'],
                    $itemData['accepted_qty']
                );
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

    private function updatePurchaseOrderItemReceivedQty(int $itemId, int $acceptedQty): void
    {
        DB::table('purchase_order_items')
            ->where('id', $itemId)
            ->increment('received_qty', $acceptedQty);
    }

    private function updatePurchaseOrderStatus(int $purchaseOrderId): void
    {
        $purchaseOrder = PurchaseOrder::with('items')->find($purchaseOrderId);

        if (! $purchaseOrder) {
            return;
        }

        $totalOrdered = $purchaseOrder->items->sum('qty');
        $totalReceived = $purchaseOrder->items->sum('received_qty');

        if ($totalReceived >= $totalOrdered) {
            $purchaseOrder->update(['status' => 'RECEIVED']);
        } elseif ($totalReceived > 0) {
            $purchaseOrder->update(['status' => 'PARTIALLY_RECEIVED']);
        }
    }
}
