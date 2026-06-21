import { Head, Link } from '@inertiajs/react';
import { Search, Receipt, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import type { PaginationData } from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PurchaseOrder } from '@/types';
import type { StoreOption } from './components';
import { GoodsReceiptFormDialog } from './components';

type GoodsReceipt = {
    id: number;
    grn_number: string;
    purchase_order_id: number;
    store_id: number;
    received_date: string;
    received_by: number;
    supplier_invoice_no: string | null;
    shipping_cost: string;
    custom_duty: string;
    other_cost: string;
    status: 'DRAFT' | 'COMPLETED';
    notes: string | null;
    purchase_order?: {
        id: number;
        po_number: string;
        supplier?: {
            id: number;
            name: string;
        };
    };
    store?: {
        id: number;
        name: string;
    };
    receiver?: {
        id: number;
        name: string;
    };
    items?: Array<{
        id: number;
        accepted_qty: number;
        total_cost_price: string;
    }>;
    created_at: string;
};

type Props = {
    goodsReceipts?: PaginationData<GoodsReceipt>;
    approvedPurchaseOrders: PurchaseOrder[];
    stores: StoreOption[];
};

function StatusBadge({ status }: { status: string }) {
    const styles = {
        DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
            {status}
        </span>
    );
}

export default function GoodsReceiptsIndex({ goodsReceipts, approvedPurchaseOrders, stores }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const getTotalCost = (receipt: GoodsReceipt) => {
        if (!receipt.items) return 0;
        return receipt.items.reduce((sum, item) => sum + parseFloat(item.total_cost_price || '0'), 0);
    };

    const getTotalUnits = (receipt: GoodsReceipt) => {
        if (!receipt.items) return 0;
        return receipt.items.reduce((sum, item) => sum + item.accepted_qty, 0);
    };

    return (
        <>
            <Head title="Goods Receipts" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Goods Receipts"
                        description="Track received goods from purchase orders"
                    />
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create GRN
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search goods receipts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">GRN Number</th>
                                <th className="px-4 py-3 font-medium">PO Number</th>
                                <th className="px-4 py-3 font-medium">Supplier</th>
                                <th className="px-4 py-3 font-medium">Store</th>
                                <th className="px-4 py-3 font-medium">Received Date</th>
                                <th className="px-4 py-3 font-medium">Units</th>
                                <th className="px-4 py-3 font-medium">Total Cost</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {!goodsReceipts ? (
                                <TableSkeleton rows={10} columns={9} />
                            ) : (
                                <>
                                    {goodsReceipts.data.map((receipt) => (
                                        <tr key={receipt.id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{receipt.grn_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {receipt.purchase_order?.po_number || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {receipt.purchase_order?.supplier?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {receipt.store?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(receipt.received_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{getTotalUnits(receipt)}</span>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                ${getTotalCost(receipt).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={receipt.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/inventory/goods-receipts/${receipt.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {goodsReceipts.data.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                                No goods receipts found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {goodsReceipts && goodsReceipts.total > goodsReceipts.per_page && (
                        <Pagination
                            links={goodsReceipts.links}
                            from={goodsReceipts.from}
                            to={goodsReceipts.to}
                            total={goodsReceipts.total}
                        />
                    )}
                </div>
            </div>

            <GoodsReceiptFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                approvedPurchaseOrders={approvedPurchaseOrders}
                stores={stores}
            />
        </>
    );
}

GoodsReceiptsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Goods Receipts',
            href: '/admin/inventory/goods-receipts',
        },
    ],
};
