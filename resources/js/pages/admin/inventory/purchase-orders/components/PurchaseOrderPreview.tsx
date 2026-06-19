import { Pencil, ShoppingCart, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import type { PurchaseOrderPreviewProps } from './types';

export function PurchaseOrderPreview({
    open,
    onOpenChange,
    order,
    onEdit,
}: PurchaseOrderPreviewProps) {
    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80%] max-w-[80%] h-[95vh] p-0 gap-0 sm:max-w-[80%] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-10 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Purchase orders</span>
                        <span className="text-muted-foreground/50">›</span>
                        <span className="text-foreground font-medium">
                            {order.po_number}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                            <X className="mr-2 h-4 w-4" />
                            Close
                        </Button>
                        {order.status === 'DRAFT' && onEdit && (
                            <Button type="button" size="sm" onClick={() => {
                                onOpenChange(false);
                                onEdit(order);
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
                                <h1 className="text-xl font-semibold">{order.po_number}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(order.order_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Supplier</div>
                            <div className="font-medium">{order.supplier?.name || '-'}</div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Deliver to Store</div>
                            <div className="font-medium">{order.store?.name || '-'}</div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Order Date</div>
                            <div className="font-medium">
                                {order.order_date ? new Date(order.order_date).toLocaleDateString() : '-'}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Expected Date</div>
                            <div className="font-medium">
                                {order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '-'}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Supplier Invoice No.</div>
                            <div className="font-medium">{order.supplier_invoice_number || '-'}</div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Supplier Invoice Date</div>
                            <div className="font-medium">
                                {order.supplier_invoice_date ? new Date(order.supplier_invoice_date).toLocaleDateString() : '-'}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Discount Type</div>
                            <div className="font-medium">
                                {order.discount_type === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4 space-y-1">
                            <div className="text-xs text-muted-foreground">Payment Status</div>
                            <div className="font-medium">{order.payment_status || '-'}</div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl border bg-card p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            Order Items ({order.items?.length || 0})
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
                                    {order.items?.map((item, idx) => (
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
                                <span>${parseFloat(order.subtotal || '0').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Discount {order.discount_type === 'PERCENTAGE' ? `(${parseFloat(order.discount || '0')}%)` : ''}
                                </span>
                                <span>
                                    {order.discount_type === 'PERCENTAGE'
                                        ? `$${(parseFloat(order.subtotal || '0') * parseFloat(order.discount || '0') / 100).toFixed(2)}`
                                        : `$${parseFloat(order.discount || '0').toFixed(2)}`
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>${parseFloat(order.tax || '0').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>${parseFloat(order.shipping_cost || '0').toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="text-xl font-bold">${parseFloat(order.total_amount || '0').toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="rounded-xl border bg-card p-5 space-y-2">
                            <div className="text-xs text-muted-foreground">Notes</div>
                            <div className="text-sm">{order.notes}</div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
