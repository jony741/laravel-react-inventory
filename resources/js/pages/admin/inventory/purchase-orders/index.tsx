import { Form, Head, router } from '@inertiajs/react';
import {
    Plus, Pencil, Trash2, Search, X, ShoppingCart, Eye, Check, FileText,
    Building2, Package, Receipt, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import PurchaseOrderController from '@/actions/App/Http/Controllers/Inventory/PurchaseOrderController';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination, { type PaginationData } from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/purchase-orders';
import type { PurchaseOrder, Supplier, Store as StoreType, ProductVariant } from '@/types';

type OrderItemFormData = {
    id?: number;
    variant_id: number;
    qty: number;
    cost: string;
    subtotal: string;
    discount_percentage: boolean;
    discount: string;
    tax_percentage: string;
};

const emptyOrderItem: OrderItemFormData = {
    variant_id: 0,
    qty: 1,
    cost: '',
    subtotal: '0',
    discount_percentage: false,
    discount: '',
    tax_percentage: '',
};

type Props = {
    purchaseOrders?: PaginationData<PurchaseOrder>;
    suppliers: Pick<Supplier, 'id' | 'name' | 'phone' | 'address'>[];
    stores: Pick<StoreType, 'id' | 'name'>[];
    variants: (Pick<ProductVariant, 'id' | 'product_id' | 'sku' | 'barcode' | 'color' | 'size' | 'cost' | 'price'> & { product?: { id: number; name: string } })[];
};

export default function PurchaseOrdersIndex({ purchaseOrders, suppliers, stores, variants }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [expectedDate, setExpectedDate] = useState<string>('');
    const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState<string>('');
    const [supplierInvoiceDate, setSupplierInvoiceDate] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<string>('0');
    const [discount, setDiscount] = useState<string>('0');
    const [tax, setTax] = useState<string>('0');
    const [notes, setNotes] = useState<string>('');
    const [variantSearch, setVariantSearch] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewOrder, setPreviewOrder] = useState<PurchaseOrder | null>(null);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [currentOrderStatus, setCurrentOrderStatus] = useState<'NEW' | 'DRAFT' | 'APPROVED' | 'RECEIVED'>('NEW');
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [pendingNewOrder, setPendingNewOrder] = useState(false);

    // Effect to detect when a new order has been created and update state
    useEffect(() => {
        if (pendingNewOrder && purchaseOrders?.data && purchaseOrders.data.length > 0) {
            // Find the most recent order (should be first since sorted by latest)
            const latestOrder = purchaseOrders.data[0];
            if (latestOrder) {
                setCurrentOrderId(latestOrder.id);
                setCurrentOrderStatus('DRAFT');
                setEditingOrder(latestOrder);
                setPendingNewOrder(false);
                setIsSubmitting(false);
                setSavedAt(new Date().toISOString());
            }
        }
    }, [purchaseOrders, pendingNewOrder]);

    const selectedSupplierData = useMemo(() => {
        return suppliers.find(s => s.id.toString() === selectedSupplier);
    }, [selectedSupplier, suppliers]);

    const filteredVariants = useMemo(() => {
        if (!variantSearch) return variants.slice(0, 10);
        const search = variantSearch.toLowerCase();
        return variants.filter(v =>
            v.sku.toLowerCase().includes(search) ||
            v.barcode?.toLowerCase().includes(search) ||
            v.product?.name.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [variantSearch, variants]);

    const openCreateDialog = () => {
        setEditingOrder(null);
        setOrderItems([]);
        setSelectedSupplier('');
        setSelectedStore('');
        setOrderDate(new Date().toISOString().split('T')[0]);
        setExpectedDate('');
        setSupplierInvoiceNumber('');
        setCurrentOrderStatus('NEW');
        setCurrentOrderId(null);
        setIsSubmitting(false);
        setPendingNewOrder(false);
        setSupplierInvoiceDate('');
        setShippingCost('0');
        setDiscount('0');
        setTax('0');
        setNotes('');
        setSavedAt(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (order: PurchaseOrder) => {
        setEditingOrder(order);
        setSelectedSupplier(order.supplier_id.toString());
        setSelectedStore(order.store_id.toString());
        setOrderDate(order.order_date);
        setExpectedDate(order.expected_date || '');
        setSupplierInvoiceNumber(order.supplier_invoice_number || '');
        setSupplierInvoiceDate(order.supplier_invoice_date || '');
        setShippingCost(order.shipping_cost || '0');
        setDiscount(order.discount || '0');
        setTax(order.tax || '0');
        setNotes(order.notes || '');
        setSavedAt(order.updated_at);
        setCurrentOrderStatus(order.status as 'DRAFT' | 'APPROVED' | 'RECEIVED');
        setCurrentOrderId(order.id);
        setIsSubmitting(false);
        if (order.items && order.items.length > 0) {
            setOrderItems(order.items.map(item => ({
                id: item.id,
                variant_id: item.variant_id,
                qty: item.qty,
                cost: item.cost,
                subtotal: item.subtotal,
                discount_percentage: item.discount_percentage,
                discount: item.discount || '',
                tax_percentage: item.tax_percentage || '',
            })));
        } else {
            setOrderItems([]);
        }
        setIsDialogOpen(true);
    };

    const openPreview = (order: PurchaseOrder) => {
        setPreviewOrder(order);
        setIsPreviewOpen(true);
    };

    const addOrderItem = (variant: typeof variants[0]) => {
        const existingIndex = orderItems.findIndex(item => item.variant_id === variant.id);
        if (existingIndex >= 0) {
            const updated = [...orderItems];
            updated[existingIndex].qty += 1;
            updated[existingIndex].subtotal = (updated[existingIndex].qty * parseFloat(updated[existingIndex].cost)).toFixed(2);
            setOrderItems(updated);
        } else {
            setOrderItems([...orderItems, {
                ...emptyOrderItem,
                variant_id: variant.id,
                cost: variant.cost,
                subtotal: variant.cost,
            }]);
        }
        setVariantSearch('');
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index: number, field: keyof OrderItemFormData, value: string | number | boolean) => {
        const updated = [...orderItems];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'qty' || field === 'cost' || field === 'discount' || field === 'discount_percentage') {
            const qty = field === 'qty' ? Number(value) : updated[index].qty;
            const cost = field === 'cost' ? parseFloat(value as string) || 0 : parseFloat(updated[index].cost) || 0;
            let subtotal = qty * cost;

            const discountValue = field === 'discount' ? parseFloat(value as string) || 0 : parseFloat(updated[index].discount) || 0;
            const isPercentage = field === 'discount_percentage' ? value as boolean : updated[index].discount_percentage;

            if (discountValue > 0) {
                if (isPercentage) {
                    subtotal -= subtotal * (discountValue / 100);
                } else {
                    subtotal -= discountValue;
                }
            }

            updated[index].subtotal = subtotal.toFixed(2);
        }

        setOrderItems(updated);
    };

    const getVariantDisplay = (variantId: number) => {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return 'Unknown';
        const parts = [variant.product?.name, variant.sku];
        if (variant.color) parts.push(variant.color);
        if (variant.size) parts.push(variant.size);
        return parts.filter(Boolean).join(' - ');
    };

    const calculateTotals = () => {
        const itemsSubtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal || '0'), 0);
        const totalTax = parseFloat(tax) || 0;
        const totalDiscount = parseFloat(discount) || 0;
        const totalShipping = parseFloat(shippingCost) || 0;
        const total = itemsSubtotal + totalTax - totalDiscount + totalShipping;

        return {
            subtotal: itemsSubtotal,
            tax: totalTax,
            discount: totalDiscount,
            shipping: totalShipping,
            total,
            itemCount: orderItems.reduce((sum, item) => sum + item.qty, 0),
        };
    };

    const totals = calculateTotals();

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            'DRAFT': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: <FileText className="h-3 w-3" /> },
            'APPROVED': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <CheckCircle className="h-3 w-3" /> },
            'PARTIALLY_RECEIVED': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: <Clock className="h-3 w-3" /> },
            'RECEIVED': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <Check className="h-3 w-3" /> },
            'CLOSED': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: <Check className="h-3 w-3" /> },
            'CANCELLED': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: <X className="h-3 w-3" /> },
        };

        const config = statusConfig[status] || statusConfig['DRAFT'];

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                {config.icon}
                {status.replace('_', ' ')}
            </span>
        );
    };

    const handleApproveClick = () => {
        setIsApproveConfirmOpen(true);
    };

    const handleApproveConfirm = () => {
        if (!currentOrderId) return;

        setIsApproving(true);
        router.patch(
            `/admin/inventory/purchase-orders/${currentOrderId}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCurrentOrderStatus('APPROVED');
                    setIsApproveConfirmOpen(false);
                    setIsApproving(false);
                },
                onError: () => {
                    setIsApproving(false);
                },
            }
        );
    };

    return (
        <>
            <Head title="Purchase Orders" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Purchase Orders"
                        description="Manage purchase orders from suppliers"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Purchase Order
                    </Button>
                </div>

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
                                                ${parseFloat(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openPreview(order)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {order.status === 'DRAFT' && (
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(order)}>
                                                            <Pencil className="h-4 w-4" />
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[90%] max-w-[90%] h-[95vh] p-0 gap-0 sm:max-w-[90%] flex flex-col overflow-hidden">
                    <Form
                        className="flex flex-col h-full"
                        {...(currentOrderId && currentOrderStatus !== 'NEW'
                            ? PurchaseOrderController.update.form({ id: currentOrderId } as PurchaseOrder)
                            : PurchaseOrderController.store.form()
                        )}
                        method={currentOrderId && currentOrderStatus !== 'NEW' ? 'patch' : 'post'}
                        onStart={() => {
                            setIsSubmitting(true);
                        }}
                        onSuccess={() => {
                            // If this was a new order, set flag to detect the new order in useEffect
                            if (currentOrderStatus === 'NEW') {
                                setPendingNewOrder(true);
                            } else {
                                // For updates, just update the saved time
                                setIsSubmitting(false);
                                setSavedAt(new Date().toISOString());
                            }
                        }}
                        onError={() => {
                            setIsSubmitting(false);
                        }}
                        transform={() => ({
                            supplier_id: selectedSupplier,
                            store_id: selectedStore,
                            order_date: orderDate,
                            expected_date: expectedDate || null,
                            supplier_invoice_number: supplierInvoiceNumber,
                            supplier_invoice_date: supplierInvoiceDate || null,
                            shipping_cost: shippingCost,
                            discount: discount,
                            tax: tax,
                            notes: notes,
                            items: orderItems,
                        })}
                    >
                        {({ errors, processing }) => (
                            <>
                                {/* Header */}
                                <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-6 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ShoppingCart className="h-4 w-4" />
                                            <span>Purchase orders</span>
                                            <span className="text-muted-foreground/50">›</span>
                                            <span className="text-foreground font-medium">
                                                {editingOrder ? editingOrder.po_number : 'New purchase order'}
                                            </span>
                                        </div>
                                        {savedAt && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Check className="h-3 w-3 text-green-500" />
                                                Saved {new Date(savedAt).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
                                            <X className="mr-2 h-4 w-4" />
                                            Discard
                                        </Button>

                                        {/* Save Draft Button - Only for NEW orders */}
                                        {currentOrderStatus === 'NEW' && (
                                            <div className="relative group">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={processing || isSubmitting || pendingNewOrder}
                                                >
                                                    {processing || isSubmitting || pendingNewOrder ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Save Draft
                                                        </>
                                                    )}
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover border rounded-md shadow-md text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Save as draft to edit later
                                                </div>
                                            </div>
                                        )}

                                        {/* Update Button - For DRAFT orders */}
                                        {currentOrderStatus === 'DRAFT' && (
                                            <div className="relative group">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={processing || isSubmitting}
                                                >
                                                    {processing || isSubmitting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Update
                                                        </>
                                                    )}
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover border rounded-md shadow-md text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Save changes to this draft order
                                                </div>
                                            </div>
                                        )}

                                        {/* Approve Button - For DRAFT orders */}
                                        {currentOrderStatus === 'DRAFT' && (
                                            <div className="relative group">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleApproveClick}
                                                    disabled={isApproving || processing || isSubmitting}
                                                >
                                                    {isApproving ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Approving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </>
                                                    )}
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover border rounded-md shadow-md text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Approve this order to proceed with receiving goods
                                                </div>
                                            </div>
                                        )}

                                        {/* GRN Button - For APPROVED orders */}
                                        {currentOrderStatus === 'APPROVED' && (
                                            <div className="relative group">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="default"
                                                    disabled
                                                >
                                                    <Receipt className="mr-2 h-4 w-4" />
                                                    GRN
                                                </Button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover border rounded-md shadow-md text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Create Goods Receipt Note (Coming soon)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-6 space-y-6">
                                        {/* Header Section */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h1 className="text-xl font-semibold">Purchase order</h1>
                                                    <p className="text-sm text-muted-foreground">
                                                        {editingOrder?.po_number || 'New'}
                                                    </p>
                                                </div>
                                            </div>
                                            {currentOrderStatus !== 'NEW' && getStatusBadge(currentOrderStatus)}
                                        </div>

                                        {/* Two Column Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Supplier Card */}
                                            <div className="rounded-xl border bg-card p-5 space-y-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    SUPPLIER
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Select supplier</Label>
                                                    <Select
                                                        value={selectedSupplier}
                                                        onValueChange={setSelectedSupplier}
                                                    >
                                                        <SelectTrigger className="bg-muted/50 border-0 w-full">
                                                            <SelectValue placeholder="Select supplier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {suppliers.map(supplier => (
                                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                    {supplier.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.supplier_id} />
                                                </div>
                                                {selectedSupplierData && (
                                                    <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                                                        <p className="font-medium">{selectedSupplierData.name}</p>
                                                        {selectedSupplierData.phone && (
                                                            <p className="text-muted-foreground">{selectedSupplierData.phone}</p>
                                                        )}
                                                        {selectedSupplierData.address && (
                                                            <p className="text-muted-foreground text-xs">{selectedSupplierData.address}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Details Card */}
                                            <div className="rounded-xl border bg-card p-5 space-y-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    ORDER DETAILS
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-muted-foreground">Deliver to store</Label>
                                                        <Select
                                                            value={selectedStore}
                                                            onValueChange={setSelectedStore}
                                                        >
                                                            <SelectTrigger className="bg-muted/50 border-0 w-full">
                                                                <SelectValue placeholder="Select store" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {stores.map(store => (
                                                                    <SelectItem key={store.id} value={store.id.toString()}>
                                                                        {store.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={errors.store_id} />
                                                    </div>
                                                    <div />
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-muted-foreground">Order date</Label>
                                                        <Input
                                                            type="date"
                                                            value={orderDate}
                                                            onChange={(e) => setOrderDate(e.target.value)}
                                                            className="bg-muted/50 border-0"
                                                        />
                                                        <InputError message={errors.order_date} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-muted-foreground">Expected by</Label>
                                                        <Input
                                                            type="date"
                                                            value={expectedDate}
                                                            onChange={(e) => setExpectedDate(e.target.value)}
                                                            className="bg-muted/50 border-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items Section */}
                                        <div className="rounded-xl border bg-card p-5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    Order items
                                                    <span className="text-muted-foreground font-normal">
                                                        {orderItems.length} items · {totals.itemCount} units
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Items Table */}
                                            <div className="rounded-lg border overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/50">
                                                        <tr className="text-muted-foreground">
                                                            <th className="px-4 py-3 text-left font-medium">Product / Variant</th>
                                                            <th className="px-4 py-3 text-center font-medium w-24">Qty</th>
                                                            <th className="px-4 py-3 text-center font-medium w-28">Unit cost</th>
                                                            <th className="px-4 py-3 text-center font-medium w-20">Discount %</th>
                                                            <th className="px-4 py-3 text-center font-medium w-28">Discount</th>
                                                            <th className="px-4 py-3 text-right font-medium w-28">Subtotal</th>
                                                            <th className="px-4 py-3 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {orderItems.map((item, idx) => (
                                                            <tr key={idx} className="bg-card">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium">{getVariantDisplay(item.variant_id)}</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {variants.find(v => v.id === item.variant_id)?.sku}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={item.qty}
                                                                        onChange={(e) => updateOrderItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                                                        className="h-8 w-20 text-center bg-muted/50 border-0 mx-auto"
                                                                        min="1"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={item.cost}
                                                                        onChange={(e) => updateOrderItem(idx, 'cost', e.target.value)}
                                                                        className="h-8 w-24 text-center bg-muted/50 border-0 mx-auto"
                                                                        min="0"
                                                                        step="0.01"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={item.discount_percentage}
                                                                        onChange={(e) => updateOrderItem(idx, 'discount_percentage', e.target.checked)}
                                                                        className="h-4 w-4 rounded border-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={item.discount}
                                                                        onChange={(e) => updateOrderItem(idx, 'discount', e.target.value)}
                                                                        className="h-8 w-24 text-center bg-muted/50 border-0 mx-auto"
                                                                        min="0"
                                                                        step="0.01"
                                                                        placeholder={item.discount_percentage ? '%' : '$'}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium">
                                                                    ${parseFloat(item.subtotal).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => removeOrderItem(idx)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Add Item Search */}
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search product or scan barcode to add..."
                                                        value={variantSearch}
                                                        onChange={(e) => setVariantSearch(e.target.value)}
                                                        className="pl-9 bg-muted/50 border-0"
                                                    />
                                                    {variantSearch && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                            {filteredVariants.map(variant => (
                                                                <button
                                                                    key={variant.id}
                                                                    type="button"
                                                                    className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                                                                    onClick={() => addOrderItem(variant)}
                                                                >
                                                                    <div>
                                                                        <div className="font-medium">{variant.product?.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {variant.sku}
                                                                            {variant.color && ` · ${variant.color}`}
                                                                            {variant.size && ` · ${variant.size}`}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-sm font-medium">${variant.cost}</span>
                                                                </button>
                                                            ))}
                                                            {filteredVariants.length === 0 && (
                                                                <div className="px-4 py-3 text-center text-muted-foreground">
                                                                    No products found
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setVariantSearch(' ')}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Notes and Totals */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Notes */}
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Internal notes</Label>
                                                <Textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add notes for this purchase order..."
                                                    rows={4}
                                                    className="bg-muted/50 border-0 resize-none"
                                                />
                                            </div>

                                            {/* Totals */}
                                            <div className="rounded-xl border bg-card p-5 space-y-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    TOTALS
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Subtotal ({totals.itemCount} units)</span>
                                                        <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            Discount
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            value={discount}
                                                            onChange={(e) => setDiscount(e.target.value)}
                                                            className="h-8 w-28 text-right bg-muted/50 border-0"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            Tax (5%)
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            value={tax}
                                                            onChange={(e) => setTax(e.target.value)}
                                                            className="h-8 w-28 text-right bg-muted/50 border-0"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            Shipping
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            value={shippingCost}
                                                            onChange={(e) => setShippingCost(e.target.value)}
                                                            className="h-8 w-28 text-right bg-muted/50 border-0"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="border-t pt-3 flex items-center justify-between">
                                                        <span className="font-semibold">Total</span>
                                                        <span className="text-xl font-bold">${totals.total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="w-[80%] max-w-[80%] h-[95vh] p-0 gap-0 sm:max-w-[80%] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-10 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Purchase orders</span>
                            <span className="text-muted-foreground/50">›</span>
                            <span className="text-foreground font-medium">
                                {previewOrder?.po_number || 'Order'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Close
                            </Button>
                            {previewOrder?.status === 'DRAFT' && (
                                <Button type="button" size="sm" onClick={() => {
                                    setIsPreviewOpen(false);
                                    if (previewOrder) openEditDialog(previewOrder);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold">{previewOrder?.po_number}</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {previewOrder && new Date(previewOrder.order_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {previewOrder && getStatusBadge(previewOrder.status)}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-xl border bg-card p-5 space-y-2">
                                <div className="text-xs text-muted-foreground">Supplier</div>
                                <div className="font-medium">{previewOrder?.supplier?.name || '-'}</div>
                            </div>
                            <div className="rounded-xl border bg-card p-5 space-y-2">
                                <div className="text-xs text-muted-foreground">Store</div>
                                <div className="font-medium">{previewOrder?.store?.name || '-'}</div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="rounded-xl border bg-card p-5 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Order Items ({previewOrder?.items?.length || 0})
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="text-muted-foreground">
                                            <th className="px-4 py-3 text-left font-medium">#</th>
                                            <th className="px-4 py-3 text-left font-medium">Product</th>
                                            <th className="px-4 py-3 text-center font-medium">Qty</th>
                                            <th className="px-4 py-3 text-right font-medium">Cost</th>
                                            <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {previewOrder?.items?.map((item, idx) => (
                                            <tr key={item.id} className="bg-card">
                                                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {item.variant?.product?.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.variant?.sku}
                                                        {item.variant?.color && ` · ${item.variant.color}`}
                                                        {item.variant?.size && ` / ${item.variant.size}`}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">{item.qty}</td>
                                                <td className="px-4 py-3 text-right">${parseFloat(item.cost).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-medium">${parseFloat(item.subtotal).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-80 rounded-xl border bg-card p-5 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${parseFloat(previewOrder?.subtotal || '0').toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>${parseFloat(previewOrder?.discount || '0').toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>${parseFloat(previewOrder?.tax || '0').toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>${parseFloat(previewOrder?.shipping_cost || '0').toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold">${parseFloat(previewOrder?.total_amount || '0').toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {previewOrder?.notes && (
                            <div className="rounded-xl border bg-card p-5 space-y-2">
                                <div className="text-xs text-muted-foreground">Notes</div>
                                <div className="text-sm">{previewOrder.notes}</div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            Approve Purchase Order?
                        </DialogTitle>
                        <DialogDescription>
                            Once approved, this purchase order cannot be edited. You will be able to receive goods against this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PO Number:</span>
                            <span className="font-medium">{editingOrder?.po_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span className="font-medium">{selectedSupplierData?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-bold">${totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsApproveConfirmOpen(false)}
                            disabled={isApproving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApproveConfirm}
                            disabled={isApproving}
                        >
                            {isApproving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Yes, Approve
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
