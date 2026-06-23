import { Head, router } from '@inertiajs/react';
import { Search, Boxes, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import type { PaginationData } from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category, Store } from '@/types';

type StockItem = {
    store_id: number;
    variant_id: number;
    stock_qty: number;
    avg_cost: string;
    stock_value: string;
    last_transaction_date: string;
    variant?: {
        id: number;
        sku: string;
        color: string | null;
        size: string | null;
        price: string;
        reorder_level: number;
        product?: {
            id: number;
            name: string;
            category?: {
                id: number;
                name: string;
            };
        };
    };
    store?: {
        id: number;
        name: string;
    };
};

type Summary = {
    total_items: number;
    total_stock: number;
    stock_value: number;
    low_stock_count: number;
};

type Filters = {
    store_id: string | null;
    category_id: string | null;
    search: string | null;
};

type Props = {
    stocks?: PaginationData<StockItem>;
    summary?: Summary;
    stores: Pick<Store, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    filters: Filters;
};

function SummaryCard({
    title,
    value,
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'warning';
}) {
    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className={`h-4 w-4 ${variant === 'warning' ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
            <p className={`mt-2 text-2xl font-bold ${variant === 'warning' ? 'text-amber-500' : ''}`}>
                {value}
            </p>
        </div>
    );
}

function SummarySkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="mt-2 h-8 w-24" />
                </div>
            ))}
        </div>
    );
}

function StockLevelBadge({ stockQty, reorderLevel }: { stockQty: number; reorderLevel: number }) {
    if (stockQty <= reorderLevel) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {stockQty}
            </span>
        );
    }

    if (stockQty <= reorderLevel * 1.5) {
        return (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {stockQty}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {stockQty}
        </span>
    );
}

function formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue);
}

export default function InventoryStocksIndex({ stocks, summary, stores, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (key: keyof Filters, value: string | null) => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                [key]: value === 'all' ? null : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search || null);
    };

    return (
        <>
            <Head title="Inventory Stock" />

            <div className="space-y-6 px-8 pt-4">
                <Heading
                    title="Inventory Stock"
                    description="View current stock levels across all stores"
                />

                {!summary ? (
                    <SummarySkeleton />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryCard
                            title="Total Items"
                            value={summary.total_items.toLocaleString()}
                            icon={Package}
                        />
                        <SummaryCard
                            title="Total Stock"
                            value={summary.total_stock.toLocaleString()}
                            icon={Boxes}
                        />
                        <SummaryCard
                            title="Stock Value"
                            value={`৳${formatCurrency(summary.stock_value)}`}
                            icon={DollarSign}
                        />
                        <SummaryCard
                            title="Low Stock Items"
                            value={summary.low_stock_count}
                            icon={AlertTriangle}
                            variant={summary.low_stock_count > 0 ? 'warning' : 'default'}
                        />
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <Select
                        value={filters.store_id || 'all'}
                        onValueChange={(value) => handleFilterChange('store_id', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Stores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stores</SelectItem>
                            {stores.map((store) => (
                                <SelectItem key={store.id} value={String(store.id)}>
                                    {store.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.category_id || 'all'}
                        onValueChange={(value) => handleFilterChange('category_id', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by product name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </form>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product / Variant</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Store</th>
                                <th className="px-4 py-3 font-medium text-right">Stock Qty</th>
                                <th className="px-4 py-3 font-medium text-right">Avg. Cost</th>
                                <th className="px-4 py-3 font-medium text-right">Stock Value</th>
                                <th className="px-4 py-3 font-medium">Last Transaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {!stocks ? (
                                <TableSkeleton rows={10} columns={7} />
                            ) : (
                                <>
                                    {stocks.data.map((item, index) => (
                                        <tr key={`${item.store_id}-${item.variant_id}-${index}`}>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {item.variant?.product?.name || '-'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        SKU: {item.variant?.sku || '-'}
                                                        {item.variant?.color && ` | ${item.variant.color}`}
                                                        {item.variant?.size && ` | ${item.variant.size}`}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.variant?.product?.category?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.store?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <StockLevelBadge
                                                    stockQty={item.stock_qty}
                                                    reorderLevel={item.variant?.reorder_level || 0}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ৳{formatCurrency(item.avg_cost || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ৳{formatCurrency(item.stock_value || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.last_transaction_date
                                                    ? new Date(item.last_transaction_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {stocks.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No stock data found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {stocks && stocks.total > stocks.per_page && (
                        <Pagination
                            links={stocks.links}
                            from={stocks.from}
                            to={stocks.to}
                            total={stocks.total}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

InventoryStocksIndex.layout = {
    breadcrumbs: [
        {
            title: 'Inventory Stock',
            href: '/admin/inventory/stocks',
        },
    ],
};
