<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryStockController extends Controller
{
    public function index(Request $request): Response
    {
        $storeId = $request->input('store_id');
        $categoryId = $request->input('category_id');
        $search = $request->input('search');

        return Inertia::render('admin/inventory/stocks/index', [
            'stocks' => Inertia::defer(fn () => $this->getStockData($storeId, $categoryId, $search)),
            'summary' => Inertia::defer(fn () => $this->getSummaryData($storeId, $categoryId, $search)),
            'stores' => Store::where('is_active', true)->get(['id', 'name']),
            'categories' => Category::where('is_active', true)->get(['id', 'name']),
            'filters' => [
                'store_id' => $storeId,
                'category_id' => $categoryId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator<int, InventoryTransaction>
     */
    private function getStockData(?string $storeId, ?string $categoryId, ?string $search)
    {
        return InventoryTransaction::query()
            ->select([
                'store_id',
                'variant_id',
                DB::raw('SUM(qty_in) - SUM(qty_out) as stock_qty'),
                DB::raw('AVG((unit_purchase_cost_price + unit_shipping_cost +unit_custom_duty + unit_other_cost)) as avg_cost'),
                DB::raw('SUM((qty_in - qty_out) * (unit_purchase_cost_price + unit_shipping_cost +unit_custom_duty + unit_other_cost)) as stock_value'),
                DB::raw('MAX(date) as last_transaction_date'),
            ])
            ->with(['variant.product.category', 'store'])
            ->groupBy('store_id', 'variant_id')
            ->havingRaw('SUM(qty_in) - SUM(qty_out) > 0')
            ->when($storeId, fn ($query) => $query->where('store_id', $storeId))
            ->when($categoryId || $search, function ($query) use ($categoryId, $search) {
                $query->whereHas('variant.product', function ($q) use ($categoryId, $search) {
                    if ($categoryId) {
                        $q->where('category_id', $categoryId);
                    }
                    if ($search) {
                        $q->where(function ($sq) use ($search) {
                            $sq->where('name', 'like', "%{$search}%")
                                ->orWhereHas('variants', function ($vq) use ($search) {
                                    $vq->where('sku', 'like', "%{$search}%");
                                });
                        });
                    }
                });
            })
            ->orderByDesc('stock_qty')
            ->paginate(15)
            ->withQueryString();
    }

    /**
     * @return array{total_items: int, total_stock: int, stock_value: float, low_stock_count: int}
     */
    private function getSummaryData(?string $storeId, ?string $categoryId, ?string $search): array
    {
        $baseQuery = InventoryTransaction::query()
            ->select([
                'variant_id',
                'store_id',
                DB::raw('SUM(qty_in) - SUM(qty_out) as stock_qty'),
                DB::raw('SUM((qty_in - qty_out) * unit_purchase_cost_price) as stock_value'),
            ])
            ->groupBy('store_id', 'variant_id')
            ->havingRaw('SUM(qty_in) - SUM(qty_out) > 0')
            ->when($storeId, fn ($query) => $query->where('store_id', $storeId))
            ->when($categoryId || $search, function ($query) use ($categoryId, $search) {
                $query->whereHas('variant.product', function ($q) use ($categoryId, $search) {
                    if ($categoryId) {
                        $q->where('category_id', $categoryId);
                    }
                    if ($search) {
                        $q->where(function ($sq) use ($search) {
                            $sq->where('name', 'like', "%{$search}%")
                                ->orWhereHas('variants', function ($vq) use ($search) {
                                    $vq->where('sku', 'like', "%{$search}%");
                                });
                        });
                    }
                });
            });

        $stockData = DB::table(DB::raw("({$baseQuery->toSql()}) as stock_summary"))
            ->mergeBindings($baseQuery->getQuery())
            ->selectRaw('COUNT(*) as total_items')
            ->selectRaw('COALESCE(SUM(stock_qty), 0) as total_stock')
            ->selectRaw('COALESCE(SUM(stock_value), 0) as stock_value')
            ->first();

        $lowStockQuery = InventoryTransaction::query()
            ->select([
                'variant_id',
                'store_id',
                DB::raw('SUM(qty_in) - SUM(qty_out) as stock_qty'),
            ])
            ->with('variant')
            ->groupBy('store_id', 'variant_id')
            ->havingRaw('SUM(qty_in) - SUM(qty_out) > 0')
            ->when($storeId, fn ($query) => $query->where('store_id', $storeId))
            ->when($categoryId || $search, function ($query) use ($categoryId, $search) {
                $query->whereHas('variant.product', function ($q) use ($categoryId, $search) {
                    if ($categoryId) {
                        $q->where('category_id', $categoryId);
                    }
                    if ($search) {
                        $q->where(function ($sq) use ($search) {
                            $sq->where('name', 'like', "%{$search}%")
                                ->orWhereHas('variants', function ($vq) use ($search) {
                                    $vq->where('sku', 'like', "%{$search}%");
                                });
                        });
                    }
                });
            })
            ->get();

        $lowStockCount = $lowStockQuery->filter(function ($item) {
            return $item->variant && $item->stock_qty <= $item->variant->reorder_level;
        })->count();

        return [
            'total_items' => (int) ($stockData->total_items ?? 0),
            'total_stock' => (int) ($stockData->total_stock ?? 0),
            'stock_value' => (float) ($stockData->stock_value ?? 0),
            'low_stock_count' => $lowStockCount,
        ];
    }
}
