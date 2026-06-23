import { Head, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, ShoppingCart, Eye, Receipt } from 'lucide-react';
import { useState } from 'react';
import PurchaseOrderController from '@/actions/App/Http/Controllers/Inventory/PurchaseOrderController';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import type { PaginationData } from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index, create } from '@/routes/purchase-orders';
import type { PurchaseOrder } from '@/types';
import {
    GrnConfirmationDialog,
    PurchaseOrderPreview,
    StatusBadge
} from './components';

type Props = {
    purchaseOrders?: PaginationData<PurchaseOrder>;
};

export default function PurchaseOrdersIndex({ purchaseOrders }: Props) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGrnConfirmOpen, setIsGrnConfirmOpen] = useState(false);
    const [grnTargetOrder, setGrnTargetOrder] = useState<PurchaseOrder | null>(null);

    const openPreview = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsPreviewOpen(true);
    };

    const openGrnConfirm = (order: PurchaseOrder) => {
        setGrnTargetOrder(order);
        setIsGrnConfirmOpen(true);
    };

    return (
        <>
            <Head title="Purchase Orders" />

            <div className="space-y-6 px-8 pt-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Heading
                        title="Purchase Orders"
                        description="Manage purchase orders from suppliers"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Purchase Order
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search purchase orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">PO Number</th>
                                <th className="px-4 py-3 font-medium">Supplier</th>
                                <th className="px-4 py-3 font-medium">Store</th>
                                <th className="px-4 py-3 font-medium">Order Date</th>
                                <th className="px-4 py-3 font-medium">Items</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {!purchaseOrders ? (
                                <TableSkeleton rows={10} columns={8} />
                            ) : (
                                <>
                                    {purchaseOrders.data.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{order.po_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {order.supplier?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {order.store?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(order.order_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{order.items?.length || 0}</span>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                ৳{parseFloat(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openPreview(order)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {(order.status === 'APPROVED' || order.status === 'PARTIALLY_RECEIVED') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Create GRN"
                                                            onClick={() => openGrnConfirm(order)}
                                                        >
                                                            <Receipt className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    )}
                                                    {order.status === 'DRAFT' && (
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/admin/inventory/purchase-orders/${order.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {order.status === 'DRAFT' && (
                                                        <DeleteConfirmationDialog
                                                            action={PurchaseOrderController.destroy(order)}
                                                            title="Delete purchase order?"
                                                            description={`This will permanently delete "${order.po_number}" and all its items.`}
                                                            confirmLabel="Delete"
                                                            processingLabel="Deleting..."
                                                        >
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </DeleteConfirmationDialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {purchaseOrders.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                                No purchase orders found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {purchaseOrders && purchaseOrders.total > purchaseOrders.per_page && (
                        <Pagination
                            links={purchaseOrders.links}
                            from={purchaseOrders.from}
                            to={purchaseOrders.to}
                            total={purchaseOrders.total}
                        />
                    )}
                </div>
            </div>

            {/* Preview Dialog */}
            <PurchaseOrderPreview
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                order={selectedOrder}
            />

            {/* GRN Confirmation Dialog */}
            <GrnConfirmationDialog
                open={isGrnConfirmOpen}
                onOpenChange={setIsGrnConfirmOpen}
                orderId={grnTargetOrder?.id || null}
                poNumber={grnTargetOrder?.po_number}
                supplierName={grnTargetOrder?.supplier?.name}
                totalAmount={grnTargetOrder?.total_amount}
            />
        </>
    );
}

PurchaseOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Purchase Orders',
            href: index(),
        },
    ],
};
