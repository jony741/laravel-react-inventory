import { Form, router } from '@inertiajs/react';
import {
    Plus, Trash2, Search, X, ShoppingCart, Check, FileText,
    Building2, Package, Receipt, CheckCircle, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import PurchaseOrderController from '@/actions/App/Http/Controllers/Inventory/PurchaseOrderController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GrnConfirmationDialog } from './GrnConfirmationDialog';
import type { PurchaseOrderFormProps, OrderItemFormData, OrderStatus, VariantOption } from './types';
import { emptyOrderItem } from './types';

export function PurchaseOrderForm({
    order,
    suppliers,
    stores,
    variants,
    isPage = false
}: PurchaseOrderFormProps) {
    // Form state - initialize from order prop if available
    const [orderItems, setOrderItems] = useState<OrderItemFormData[]>(() => {
        if (order?.items && order.items.length > 0) {
            return order.items.map(item => ({
                id: item.id,
                variant_id: item.variant_id,
                qty: item.qty,
                purchase_price: item.purchase_price,
                subtotal: item.subtotal,
                discount_percentage: item.discount_percentage,
                discount: item.discount || '',
                tax_percentage: item.tax_percentage || ''
            }));
        }
        return [];
    });
    const [selectedSupplier, setSelectedSupplier] = useState<string>(() => order?.supplier_id?.toString() || '');
    const [selectedStore, setSelectedStore] = useState<string>(() => order?.store_id?.toString() || '');
    const [orderDate, setOrderDate] = useState<string>(() => order?.order_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
    const [expectedDate, setExpectedDate] = useState<string>(() => order?.expected_date?.split('T')[0] || '');
    const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState<string>(() => order?.supplier_invoice_number || '');
    const [supplierInvoiceDate, setSupplierInvoiceDate] = useState<string>(() => order?.supplier_invoice_date?.split('T')[0] || '');
    const [shippingCost, setShippingCost] = useState<string>(() => order?.shipping_cost || '0');
    const [customDuty, setCustomDuty] = useState<string>(() => order?.custom_duty || '0');
    const [otherCost, setOtherCost] = useState<string>(() => order?.other_cost || '0');
    const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>(() => (order?.discount_type as 'FIXED' | 'PERCENTAGE') || 'FIXED');
    const [discount, setDiscount] = useState<string>(() => order?.discount || '0');
    const [tax, setTax] = useState<string>(() => order?.tax || '0');
    const [notes, setNotes] = useState<string>(() => order?.notes || '');
    const [variantSearch, setVariantSearch] = useState<string>('');

    // UI state
    const [savedAt, setSavedAt] = useState<string | null>(() => order?.updated_at || null);
    const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatus>(() => (order?.status as OrderStatus) || 'NEW');
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(() => order?.id || null);
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    const [isGrnConfirmOpen, setIsGrnConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Initialize form when order changes
    useEffect(() => {
        if (order) {
            // Edit mode
            setSelectedSupplier(order.supplier_id.toString());
            setSelectedStore(order.store_id.toString());
            setOrderDate(order.order_date ? order.order_date.split('T')[0] : '');
            setExpectedDate(order.expected_date ? order.expected_date.split('T')[0] : '');
            setSupplierInvoiceNumber(order.supplier_invoice_number || '');
            setSupplierInvoiceDate(order.supplier_invoice_date ? order.supplier_invoice_date.split('T')[0] : '');
            setShippingCost(order.shipping_cost || '0');
            setCustomDuty(order.custom_duty || '0');
            setOtherCost(order.other_cost || '0');
            setDiscountType((order.discount_type as 'FIXED' | 'PERCENTAGE') || 'FIXED');
            setDiscount(order.discount || '0');
            setTax(order.tax || '0');
            setNotes(order.notes || '');
            setSavedAt(order.updated_at);
            setCurrentOrderStatus(order.status as OrderStatus);
            setCurrentOrderId(order.id);
            setIsSubmitting(false);

            if (order.items && order.items.length > 0) {
                setOrderItems(order.items.map(item => ({
                    id: item.id,
                    variant_id: item.variant_id,
                    qty: item.qty,
                    purchase_price: item.purchase_price,
                    subtotal: item.subtotal,
                    discount_percentage: item.discount_percentage,
                    discount: item.discount || '',
                    tax_percentage: item.tax_percentage || ''
                })));
            } else {
                setOrderItems([]);
            }
        } else {
            // Create mode - reset form
            setOrderItems([]);
            setSelectedSupplier('');
            setSelectedStore('');
            setOrderDate(new Date().toISOString().split('T')[0]);
            setExpectedDate('');
            setSupplierInvoiceNumber('');
            setSupplierInvoiceDate('');
            setShippingCost('0');
            setCustomDuty('0');
            setOtherCost('0');
            setDiscountType('FIXED');
            setDiscount('0');
            setTax('0');
            setNotes('');
            setSavedAt(null);
            setCurrentOrderStatus('NEW');
            setCurrentOrderId(null);
            setIsSubmitting(false);
        }
    }, [order]);

    const selectedSupplierData = useMemo(() => {
        return suppliers.find(s => s.id.toString() === selectedSupplier);
    }, [selectedSupplier, suppliers]);

    const filteredVariants = useMemo(() => {
        if (!variantSearch) {
            return variants.slice(0, 10);
        }

        const search = variantSearch.toLowerCase();

        return variants.filter(v =>
            v.sku.toLowerCase().includes(search) ||
            v.barcode?.toLowerCase().includes(search) ||
            v.product?.name.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [variantSearch, variants]);

    const addOrderItem = (variant: VariantOption) => {
        const existingIndex = orderItems.findIndex(item => item.variant_id === variant.id);

        if (existingIndex >= 0) {
            const updated = [...orderItems];
            updated[existingIndex].qty += 1;
            updated[existingIndex].subtotal = (updated[existingIndex].qty * parseFloat(updated[existingIndex].purchase_price)).toFixed(2);
            setOrderItems(updated);
        } else {
            setOrderItems([...orderItems, {
                ...emptyOrderItem,
                variant_id: variant.id,
                purchase_price: variant.price,
                subtotal: variant.price
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

        if (field === 'qty' || field === 'purchase_price' || field === 'discount' || field === 'discount_percentage') {
            const qty = field === 'qty' ? Number(value) : updated[index].qty;
            const purchasePrice = field === 'purchase_price' ? parseFloat(value as string) || 0 : parseFloat(updated[index].purchase_price) || 0;
            let subtotal = qty * purchasePrice;

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

        if (!variant) {
            return 'Unknown';
        }

        const parts = [variant.product?.name, variant.sku];

        if (variant.color) {
            parts.push(variant.color);
        }

        if (variant.size) {
            parts.push(variant.size);
        }

        return parts.filter(Boolean).join(' - ');
    };

    const calculateTotals = () => {
        const itemsSubtotal = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal || '0'), 0);
        const totalTax = parseFloat(tax) || 0;
        const discountValue = parseFloat(discount) || 0;
        const totalShipping = parseFloat(shippingCost) || 0;
        const totalCustomDuty = parseFloat(customDuty) || 0;
        const totalOtherCost = parseFloat(otherCost) || 0;

        const totalDiscount = discountType === 'PERCENTAGE'
            ? (itemsSubtotal * discountValue / 100)
            : discountValue;

        const total = itemsSubtotal + totalTax - totalDiscount + totalShipping + totalCustomDuty + totalOtherCost;

        return {
            subtotal: itemsSubtotal,
            tax: totalTax,
            discountValue,
            discount: totalDiscount,
            shipping: totalShipping,
            customDuty: totalCustomDuty,
            otherCost: totalOtherCost,
            total,
            itemCount: orderItems.reduce((sum, item) => sum + item.qty, 0)
        };
    };

    const totals = calculateTotals();

    const handleApproveClick = () => {
        setIsApproveConfirmOpen(true);
    };

    const handleApproveConfirm = () => {
        if (!currentOrderId) {
            return;
        }

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
                }
            }
        );
    };

    const handleBack = () => {
        router.visit('/admin/inventory/purchase-orders');
    };

    const formContent = (errors: Record<string, string>, processing: boolean) => (
        <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-6 py-3">
                <div className="flex items-center gap-4">
                    {isPage && (
                        <Button type="button" variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Purchase orders</span>
                        <span className="text-muted-foreground/50">›</span>
                        <span className="text-foreground font-medium">
                            {order ? order.po_number : 'New purchase order'}
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
                    {isPage ? (
                        <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    ) : null}

                    {/* Save Draft Button - Only for NEW orders */}
                    {currentOrderStatus === 'NEW' && (
                        <Button type="submit" variant="outline" size="sm" disabled={processing || isSubmitting}>
                            {processing || isSubmitting ? (
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
                    )}

                    {/* Update Button - For DRAFT orders */}
                    {currentOrderStatus === 'DRAFT' && (
                        <Button type="submit" variant="outline" size="sm" disabled={processing || isSubmitting}>
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
                    )}

                    {/* Approve Button - For DRAFT orders */}
                    {currentOrderStatus === 'DRAFT' && (
                        <Button type="button" size="sm" onClick={handleApproveClick} disabled={isApproving || processing || isSubmitting}>
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
                    )}

                    {/* GRN Button - For APPROVED or PARTIALLY_RECEIVED orders */}
                    {(currentOrderStatus === 'APPROVED' || currentOrderStatus === 'PARTIALLY_RECEIVED') && currentOrderId && (
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => setIsGrnConfirmOpen(true)}
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            Create GRN
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
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
                                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Deliver to store</Label>
                                    <Select value={selectedStore} onValueChange={setSelectedStore}>
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
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Supplier invoice no.</Label>
                                    <Input
                                        type="text"
                                        value={supplierInvoiceNumber}
                                        onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                                        placeholder="INV-001"
                                        className="bg-muted/50 border-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Supplier invoice date</Label>
                                    <Input
                                        type="date"
                                        value={supplierInvoiceDate}
                                        onChange={(e) => setSupplierInvoiceDate(e.target.value)}
                                        className="bg-muted/50 border-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Discount type</Label>
                                    <Select value={discountType} onValueChange={(value) => setDiscountType(value as 'FIXED' | 'PERCENTAGE')}>
                                        <SelectTrigger className="bg-muted/50 border-0 w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXED">Fixed Amount (৳)</SelectItem>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <th className="px-4 py-3 text-center font-medium w-28">Purchase Price</th>
                                        <th className="px-4 py-3 text-center font-medium w-28">Discount %</th>
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
                                                    value={item.purchase_price}
                                                    onChange={(e) => updateOrderItem(idx, 'purchase_price', e.target.value)}
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
                                                    placeholder={item.discount_percentage ? '%' : '৳'}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ৳{parseFloat(item.subtotal).toFixed(2)}
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
                                                <span className="text-sm font-medium">৳{variant.price}</span>
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
                            <Button type="button" variant="outline" size="sm" onClick={() => setVariantSearch(' ')}>
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
                                    <span className="font-medium">৳{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        Discount {discountType === 'PERCENTAGE' && `(${totals.discountValue}%)`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="h-8 w-28 text-right bg-muted/50 border-0"
                                            min="0"
                                            step="0.01"
                                            placeholder={discountType === 'PERCENTAGE' ? '%' : '৳'}
                                        />
                                        {discountType === 'PERCENTAGE' && (
                                            <span className="text-sm text-muted-foreground w-20 text-right">
                                                = ${totals.discount.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">Tax</span>
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
                                    <span className="text-muted-foreground flex items-center gap-1">Shipping</span>
                                    <Input
                                        type="number"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                        className="h-8 w-28 text-right bg-muted/50 border-0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">Custom Duty</span>
                                    <Input
                                        type="number"
                                        value={customDuty}
                                        onChange={(e) => setCustomDuty(e.target.value)}
                                        className="h-8 w-28 text-right bg-muted/50 border-0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">Other Cost</span>
                                    <Input
                                        type="number"
                                        value={otherCost}
                                        onChange={(e) => setOtherCost(e.target.value)}
                                        className="h-8 w-28 text-right bg-muted/50 border-0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="border-t pt-3 flex items-center justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold">৳{totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const formElement = (
        <Form
            className="flex flex-col h-full"
            {...(currentOrderId && currentOrderStatus !== 'NEW'
                    ? PurchaseOrderController.update.form({ id: currentOrderId } as never)
                    : PurchaseOrderController.store.form()
            )}
            method={currentOrderId && currentOrderStatus !== 'NEW' ? 'patch' : 'post'}
            onStart={() => setIsSubmitting(true)}
            onSuccess={() => {
                setIsSubmitting(false);
                setSavedAt(new Date().toISOString());
            }}
            onError={() => setIsSubmitting(false)}
            transform={() => ({
                supplier_id: selectedSupplier,
                store_id: selectedStore,
                order_date: orderDate,
                expected_date: expectedDate || null,
                supplier_invoice_number: supplierInvoiceNumber,
                supplier_invoice_date: supplierInvoiceDate || null,
                shipping_cost: shippingCost,
                custom_duty: customDuty,
                other_cost: otherCost,
                discount_type: discountType,
                discount,
                tax,
                notes,
                items: orderItems
            })}
        >
            {({ errors, processing }) => formContent(errors, processing)}
        </Form>
    );

    return (
        <>
            {isPage ? (
                formElement
            ) : (
                <Dialog open={true} onOpenChange={() => router.visit('/admin/inventory/purchase-orders')}>
                    <DialogContent className="w-[90%] max-w-[90%] h-[95vh] p-0 gap-0 sm:max-w-[90%] flex flex-col overflow-hidden">
                        {formElement}
                    </DialogContent>
                </Dialog>
            )}

            {/* Approve Confirmation Dialog */}
            <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            Approve Purchase Order?
                        </DialogTitle>
                        <DialogDescription>
                            Once approved, this purchase order cannot be edited. You will be able to receive goods
                            against this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PO Number:</span>
                            <span className="font-medium">{order?.po_number}</span>
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
                        <Button type="button" variant="outline" onClick={() => setIsApproveConfirmOpen(false)} disabled={isApproving}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleApproveConfirm} disabled={isApproving}>
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

            {/* GRN Confirmation Dialog */}
            <GrnConfirmationDialog
                open={isGrnConfirmOpen}
                onOpenChange={setIsGrnConfirmOpen}
                orderId={currentOrderId}
                poNumber={order?.po_number}
                supplierName={selectedSupplierData?.name}
                totalAmount={totals.total.toFixed(2)}
            />
        </>
    );
}
