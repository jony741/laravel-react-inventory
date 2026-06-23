import { Receipt, Building2, Calendar, Truck, FileText, Package } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import type { GoodsReceiptDetailDialogProps } from './types';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.DRAFT}`}>
            {status}
        </span>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export function GoodsReceiptDetailDialog({ open, onOpenChange, goodsReceipt }: GoodsReceiptDetailDialogProps) {
    if (!goodsReceipt) {
        return null;
    }

    const shippingCost = parseFloat(goodsReceipt.shipping_cost || '0');
    const customDuty = parseFloat(goodsReceipt.custom_duty || '0');
    const otherCost = parseFloat(goodsReceipt.other_cost || '0');
    const additionalCosts = shippingCost + customDuty + otherCost;

    const itemsCost = goodsReceipt.items?.reduce((sum, item) => {
        const unitCost = parseFloat(item.unit_purchase_cost_price || '0');
        return sum + (unitCost * item.accepted_qty);
    }, 0) || 0;

    const totalCost = goodsReceipt.items?.reduce((sum, item) => sum + parseFloat(item.total_cost_price || '0'), 0) || 0;

    const totalUnits = goodsReceipt.items?.reduce((sum, item) => sum + item.accepted_qty, 0) || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {goodsReceipt.grn_number}
                        <StatusBadge status={goodsReceipt.status} />
                    </DialogTitle>
                    <DialogDescription>
                        Goods receipt details and received items
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto -mx-6 px-6 space-y-6">
                    {/* Header Information */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                        <InfoRow
                            icon={FileText}
                            label="PO Number"
                            value={goodsReceipt.purchase_order?.po_number || '-'}
                        />
                        <InfoRow
                            icon={Building2}
                            label="Supplier"
                            value={goodsReceipt.purchase_order?.supplier?.name || '-'}
                        />
                        <InfoRow
                            icon={Truck}
                            label="Store"
                            value={goodsReceipt.store?.name || '-'}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Received Date"
                            value={new Date(goodsReceipt.received_date).toLocaleDateString()}
                        />
                        {goodsReceipt.supplier_invoice_no && (
                            <InfoRow
                                icon={FileText}
                                label="Invoice No"
                                value={goodsReceipt.supplier_invoice_no}
                            />
                        )}
                        {goodsReceipt.receiver && (
                            <InfoRow
                                icon={Package}
                                label="Received By"
                                value={goodsReceipt.receiver.name}
                            />
                        )}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Cost Breakdown</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-xs text-muted-foreground">Items Cost</div>
                                <div className="text-lg font-semibold">${itemsCost.toFixed(2)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-xs text-muted-foreground">Shipping</div>
                                <div className="text-lg font-semibold">${shippingCost.toFixed(2)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-xs text-muted-foreground">Custom Duty</div>
                                <div className="text-lg font-semibold">${customDuty.toFixed(2)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-xs text-muted-foreground">Other Costs</div>
                                <div className="text-lg font-semibold">${otherCost.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-6 pt-2 border-t">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Additional Costs: </span>
                                <span className="font-medium">${additionalCosts.toFixed(2)}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Cost: </span>
                                <span className="font-semibold text-primary">${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            Items ({goodsReceipt.items?.length || 0} products, {totalUnits} units)
                        </h3>
                        <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Product</th>
                                        <th className="px-3 py-2 font-medium text-center">Ordered</th>
                                        <th className="px-3 py-2 font-medium text-center">Received</th>
                                        <th className="px-3 py-2 font-medium text-center">Accepted</th>
                                        <th className="px-3 py-2 font-medium text-center">Rejected</th>
                                        <th className="px-3 py-2 font-medium text-right">Unit Cost</th>
                                        <th className="px-3 py-2 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                    {goodsReceipt.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2">
                                                <div className="font-medium">
                                                    {item.variant?.product?.name || 'Unknown Product'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    SKU: {item.variant?.sku || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center text-muted-foreground">
                                                {item.ordered_qty}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.received_qty}
                                            </td>
                                            <td className="px-3 py-2 text-center font-medium text-green-600 dark:text-green-400">
                                                {item.accepted_qty}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {item.rejected_qty > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400">{item.rejected_qty}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">0</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground">
                                                ${parseFloat(item.unit_purchase_cost_price || '0').toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                ${parseFloat(item.total_cost_price || '0').toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!goodsReceipt.items || goodsReceipt.items.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                                                No items in this goods receipt.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {goodsReceipt.notes && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold">Notes</h3>
                            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                {goodsReceipt.notes}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
