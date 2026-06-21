import { Form } from '@inertiajs/react';
import {
    Package, Check, FileText, Building2, Receipt, Loader2, Calculator, ArrowLeft
} from 'lucide-react';

import { useState, useMemo, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
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
import { store as storeGoodsReceipt } from '@/routes/goods-receipts';
import type { PurchaseOrder } from '@/types';
import { POSelectorDialog } from './POSelectorDialog';

import type { GRNItemFormData, CostDistributionMode, GoodsReceiptFormDialogProps } from './types';

export function GoodsReceiptFormDialog({
                                           open,
                                           onOpenChange,
                                           approvedPurchaseOrders,
                                           stores
                                       }: GoodsReceiptFormDialogProps) {
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    const [selectedStore, setSelectedStore] = useState<string>('');
    const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('');
    const [supplierInvoiceDate, setSupplierInvoiceDate] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<string>('0');
    const [customDuty, setCustomDuty] = useState<string>('0');
    const [otherCost, setOtherCost] = useState<string>('0');
    const [costDistributionMode, setCostDistributionMode] = useState<CostDistributionMode>('UNIT_WISE');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [items, setItems] = useState<GRNItemFormData[]>([]);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStep('select');
            setSelectedPO(null);
            setItems([]);
        }
    }, [open]);

    useEffect(() => {
        if (selectedPO) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedStore(selectedPO.store_id.toString());
            setSupplierInvoiceNo(selectedPO.supplier_invoice_number || '');
            setSupplierInvoiceDate(
                selectedPO.supplier_invoice_date ? selectedPO.supplier_invoice_date.split('T')[0] : ''
            );
            setShippingCost(selectedPO.shipping_cost || '0');
            setCustomDuty(selectedPO.custom_duty || '0');
            setOtherCost(selectedPO.other_cost || '0');

            if (selectedPO.items) {
                const grnItems: GRNItemFormData[] = selectedPO.items.map(item => {
                    const pendingQty = item.qty - (item.receipt_items_sum_accepted_qty ?? 0);

                    return {
                        purchase_order_item_id: item.id,
                        product_variant_id: item.variant_id,
                        variant_name: item.variant?.product?.name || 'Unknown',
                        sku: item.variant?.sku || '',
                        ordered_qty: item.qty,
                        pending_qty: pendingQty,
                        received_qty: pendingQty,
                        accepted_qty: pendingQty,
                        rejected_qty: 0,
                        rejection_reason: '',
                        unit_purchase_cost_price: item.purchase_price,
                        unit_shipping_cost: '0',
                        unit_custom_duty: '0',
                        unit_other_cost: '0',
                        total_cost_price: '0',
                        batch_number: '',
                        expiry_date: '',
                        notes: ''
                    };
                }).filter(item => item.pending_qty > 0);

                setItems(grnItems);
            }
        }
    }, [selectedPO]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        distributeCosts();
    }, [shippingCost, customDuty, otherCost, costDistributionMode, items.map(i => i.accepted_qty).join(',')]);

    const distributeCosts = () => {
        const totalShipping = parseFloat(shippingCost) || 0;
        const totalCustomDuty = parseFloat(customDuty) || 0;
        const totalOtherCost = parseFloat(otherCost) || 0;

        if (items.length === 0) {
            return;
        }

        const updated = [...items];
        const activeItems = updated.filter(i => i.accepted_qty > 0);

        if (activeItems.length === 0) {
            updated.forEach(item => {
                item.unit_shipping_cost = '0';
                item.unit_custom_duty = '0';
                item.unit_other_cost = '0';
                item.total_cost_price = '0';
            });
            setItems(updated);
            return;
        }

        if (costDistributionMode === 'ITEM_WISE') {
            const itemCount = activeItems.length;
            const perItemShipping = totalShipping / itemCount;
            const perItemCustomDuty = totalCustomDuty / itemCount;
            const perItemOtherCost = totalOtherCost / itemCount;

            let distributedShipping = 0;
            let distributedCustomDuty = 0;
            let distributedOtherCost = 0;

            activeItems.forEach((item, index) => {
                const isLastItem = index === activeItems.length - 1;
                let itemShipping: number;
                let itemCustomDuty: number;
                let itemOtherCost: number;

                if (isLastItem) {
                    itemShipping = Math.round((totalShipping - distributedShipping) * 100) / 100;
                    itemCustomDuty = Math.round((totalCustomDuty - distributedCustomDuty) * 100) / 100;
                    itemOtherCost = Math.round((totalOtherCost - distributedOtherCost) * 100) / 100;
                } else {
                    itemShipping = Math.floor(perItemShipping * 100) / 100;
                    itemCustomDuty = Math.floor(perItemCustomDuty * 100) / 100;
                    itemOtherCost = Math.floor(perItemOtherCost * 100) / 100;

                    distributedShipping += itemShipping;
                    distributedCustomDuty += itemCustomDuty;
                    distributedOtherCost += itemOtherCost;
                }

                item.unit_shipping_cost = (itemShipping / item.accepted_qty).toFixed(2);
                item.unit_custom_duty = (itemCustomDuty / item.accepted_qty).toFixed(2);
                item.unit_other_cost = (itemOtherCost / item.accepted_qty).toFixed(2);

                const unitPurchasePrice = parseFloat(item.unit_purchase_cost_price) || 0;
                const itemPurchaseTotal = unitPurchasePrice * item.accepted_qty;
                item.total_cost_price = (itemPurchaseTotal + itemShipping + itemCustomDuty + itemOtherCost).toFixed(2);
            });
        } else {
            const totalUnits = activeItems.reduce((sum, item) => sum + item.accepted_qty, 0);

            let distributedShipping = 0;
            let distributedCustomDuty = 0;
            let distributedOtherCost = 0;

            activeItems.forEach((item, index) => {
                const isLastItem = index === activeItems.length - 1;
                const proportion = item.accepted_qty / totalUnits;
                let itemShipping: number;
                let itemCustomDuty: number;
                let itemOtherCost: number;

                if (isLastItem) {
                    itemShipping = Math.round((totalShipping - distributedShipping) * 100) / 100;
                    itemCustomDuty = Math.round((totalCustomDuty - distributedCustomDuty) * 100) / 100;
                    itemOtherCost = Math.round((totalOtherCost - distributedOtherCost) * 100) / 100;
                } else {
                    itemShipping = Math.floor(totalShipping * proportion * 100) / 100;
                    itemCustomDuty = Math.floor(totalCustomDuty * proportion * 100) / 100;
                    itemOtherCost = Math.floor(totalOtherCost * proportion * 100) / 100;

                    distributedShipping += itemShipping;
                    distributedCustomDuty += itemCustomDuty;
                    distributedOtherCost += itemOtherCost;
                }

                item.unit_shipping_cost = (itemShipping / item.accepted_qty).toFixed(2);
                item.unit_custom_duty = (itemCustomDuty / item.accepted_qty).toFixed(2);
                item.unit_other_cost = (itemOtherCost / item.accepted_qty).toFixed(2);

                const unitPurchasePrice = parseFloat(item.unit_purchase_cost_price) || 0;
                const itemPurchaseTotal = unitPurchasePrice * item.accepted_qty;
                item.total_cost_price = (itemPurchaseTotal + itemShipping + itemCustomDuty + itemOtherCost).toFixed(2);
            });
        }

        updated.forEach(item => {
            if (item.accepted_qty === 0) {
                item.unit_shipping_cost = '0';
                item.unit_custom_duty = '0';
                item.unit_other_cost = '0';
                item.total_cost_price = '0';
            }
        });

        setItems(updated);
    };

    const updateItem = (index: number, field: keyof GRNItemFormData, value: string | number) => {
        const updated = [...items];
        (updated[index] as Record<string, unknown>)[field] = value;

        if (field === 'received_qty') {
            const receivedQty = Number(value);
            updated[index].accepted_qty = receivedQty;
            updated[index].rejected_qty = 0;
        }

        if (field === 'accepted_qty' || field === 'rejected_qty') {
            const acceptedQty = field === 'accepted_qty' ? Number(value) : updated[index].accepted_qty;
            const rejectedQty = field === 'rejected_qty' ? Number(value) : updated[index].rejected_qty;
            updated[index].received_qty = acceptedQty + rejectedQty;
        }

        setItems(updated);
    };

    const totals = useMemo(() => {
        const itemsTotal = items.reduce((sum, item) => sum + parseFloat(item.total_cost_price || '0'), 0);
        const totalAccepted = items.reduce((sum, item) => sum + item.accepted_qty, 0);
        const totalRejected = items.reduce((sum, item) => sum + item.rejected_qty, 0);

        return {
            itemsTotal,
            totalAccepted,
            totalRejected,
            shipping: parseFloat(shippingCost) || 0,
            customDuty: parseFloat(customDuty) || 0,
            otherCost: parseFloat(otherCost) || 0
        };
    }, [items, shippingCost, customDuty, otherCost]);

    const handlePOSelect = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setStep('form');
    };

    const handleBack = () => {
        setStep('select');
        setSelectedPO(null);
        setItems([]);
    };

    if (step === 'select') {
        return (
            <POSelectorDialog
                open={open}
                onOpenChange={onOpenChange}
                purchaseOrders={approvedPurchaseOrders}
                onSelect={handlePOSelect}
            />
        );
    }

    if (!selectedPO) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[80%] w-[80%] max-w-[80%] max-h-[90vh] flex flex-col p-0">
                <Form
                    className="flex flex-col h-full max-h-[90vh]"
                    {...storeGoodsReceipt.form()}
                    onStart={() => setIsSubmitting(true)}
                    onSuccess={() => {
                        setIsSubmitting(false);
                        onOpenChange(false);
                    }}
                    onError={() => setIsSubmitting(false)}
                    transform={() => ({
                        purchase_order_id: selectedPO.id,
                        store_id: selectedStore,
                        received_date: receivedDate,
                        supplier_invoice_no: supplierInvoiceNo,
                        supplier_invoice_date: supplierInvoiceDate || null,
                        shipping_cost: shippingCost,
                        custom_duty: customDuty,
                        other_cost: otherCost,
                        notes,
                        items: items.map(item => ({
                            purchase_order_item_id: item.purchase_order_item_id,
                            product_variant_id: item.product_variant_id,
                            ordered_qty: item.ordered_qty,
                            received_qty: item.received_qty,
                            accepted_qty: item.accepted_qty,
                            rejected_qty: item.rejected_qty,
                            rejection_reason: item.rejection_reason,
                            unit_purchase_cost_price: item.unit_purchase_cost_price,
                            unit_shipping_cost: item.unit_shipping_cost,
                            unit_custom_duty: item.unit_custom_duty,
                            unit_other_cost: item.unit_other_cost,
                            total_cost_price: item.total_cost_price,
                            batch_number: item.batch_number,
                            expiry_date: item.expiry_date || null,
                            notes: item.notes
                        }))
                    })}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader className="px-10 pt-4 pb-4 border-b shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button type="button" variant="ghost" size="icon" onClick={handleBack}>
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <div>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Receipt className="h-5 w-5" />
                                                Create Goods Receipt
                                            </DialogTitle>
                                            <DialogDescription>
                                                For {selectedPO.po_number} - {selectedPO.supplier?.name}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <Button type="submit" size="sm" disabled={processing || isSubmitting}>
                                        {processing || isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Create GRN
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-xl border bg-card p-5 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            PURCHASE ORDER INFO
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">PO Number:</span>
                                                <span className="font-medium">{selectedPO.po_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Supplier:</span>
                                                <span className="font-medium">{selectedPO.supplier?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Order Date:</span>
                                                <span>{new Date(selectedPO.order_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Amount:</span>
                                                <span
                                                    className="font-bold">${parseFloat(selectedPO.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            GRN DETAILS
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Receive to
                                                    store</Label>
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
                                                <Label className="text-xs text-muted-foreground">Received date</Label>
                                                <Input
                                                    type="date"
                                                    value={receivedDate}
                                                    onChange={(e) => setReceivedDate(e.target.value)}
                                                    className="bg-muted/50 border-0"
                                                />
                                                <InputError message={errors.received_date} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Supplier invoice
                                                    no.</Label>
                                                <Input
                                                    type="text"
                                                    value={supplierInvoiceNo}
                                                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                                                    placeholder="INV-001"
                                                    className="bg-muted/50 border-0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Supplier invoice
                                                    date</Label>
                                                <Input
                                                    type="date"
                                                    value={supplierInvoiceDate}
                                                    onChange={(e) => setSupplierInvoiceDate(e.target.value)}
                                                    className="bg-muted/50 border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-card p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            Receive Items
                                            <span className="text-muted-foreground font-normal">
                                                {items.length} items - {totals.totalAccepted} units to receive
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                            <tr className="text-muted-foreground">
                                                <th className="px-4 py-3 text-left font-medium">Product / Variant</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">Ordered</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">Pending</th>
                                                <th className="px-4 py-3 text-center font-medium w-24">Received</th>
                                                <th className="px-4 py-3 text-center font-medium w-24">Accepted</th>
                                                <th className="px-4 py-3 text-center font-medium w-24">Rejected</th>
                                                <th className="px-4 py-3 text-center font-medium w-28">Unit Cost</th>
                                                <th className="px-4 py-3 text-right font-medium w-28">Total Cost</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                            {items.map((item, idx) => (
                                                <tr key={idx} className="bg-card">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{item.variant_name}</div>
                                                                <div
                                                                    className="text-xs text-muted-foreground">{item.sku}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                                        {item.ordered_qty}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                                        {item.pending_qty}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Input
                                                            type="number"
                                                            value={item.received_qty}
                                                            onChange={(e) => updateItem(idx, 'received_qty', parseInt(e.target.value) || 0)}
                                                            className="h-8 w-20 text-center bg-muted/50 border-0 mx-auto"
                                                            min="0"
                                                            max={item.pending_qty}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Input
                                                            type="number"
                                                            value={item.accepted_qty}
                                                            onChange={(e) => updateItem(idx, 'accepted_qty', parseInt(e.target.value) || 0)}
                                                            className="h-8 w-20 text-center bg-muted/50 border-0 mx-auto"
                                                            min="0"
                                                            max={item.received_qty}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Input
                                                            type="number"
                                                            value={item.rejected_qty}
                                                            onChange={(e) => updateItem(idx, 'rejected_qty', parseInt(e.target.value) || 0)}
                                                            className="h-8 w-20 text-center bg-muted/50 border-0 mx-auto"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                                        ${parseFloat(item.unit_purchase_cost_price).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        ${parseFloat(item.total_cost_price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Internal notes</Label>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add notes for this goods receipt..."
                                            rows={4}
                                            className="bg-muted/50 border-0 resize-none"
                                        />
                                    </div>

                                    <div className="rounded-xl border bg-card p-5 space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Calculator className="h-4 w-4 text-muted-foreground" />
                                            COST DISTRIBUTION
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Distribution Mode</span>
                                                <Select value={costDistributionMode}
                                                        onValueChange={(v) => setCostDistributionMode(v as CostDistributionMode)}>
                                                    <SelectTrigger className="w-40 bg-muted/50 border-0">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UNIT_WISE">Unit Wise</SelectItem>
                                                        <SelectItem value="ITEM_WISE">Item Wise</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Shipping Cost</span>
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
                                                <span className="text-muted-foreground">Custom Duty</span>
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
                                                <span className="text-muted-foreground">Other Cost</span>
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
                                                <span className="font-semibold">Total Cost</span>
                                                <span
                                                    className="text-xl font-bold">${totals.itemsTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {totals.totalAccepted} units accepted, {totals.totalRejected} rejected
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
    );
}
