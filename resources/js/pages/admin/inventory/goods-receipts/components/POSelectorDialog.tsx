import { Search, ShoppingCart, Building2, Calendar, DollarSign } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import type { PurchaseOrder } from '@/types';
import type { POSelectorDialogProps } from './types';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || ''}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export function POSelectorDialog({ open, onOpenChange, purchaseOrders, onSelect }: POSelectorDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPOs = useMemo(() => {
        if (!searchQuery.trim()) {
            return purchaseOrders;
        }

        const query = searchQuery.toLowerCase();

        return purchaseOrders.filter(po =>
            po.po_number.toLowerCase().includes(query) ||
            po.supplier?.name.toLowerCase().includes(query)
        );
    }, [purchaseOrders, searchQuery]);

    const handleSelect = (po: PurchaseOrder) => {
        onSelect(po);
        setSearchQuery('');
    };

    const getPendingItems = (po: PurchaseOrder) => {
        if (!po.items) {
            return 0;
        }

        return po.items.filter(item => item.qty > (item.receipt_items_sum_accepted_qty ?? 0)).length;
    };

    const getPendingQty = (po: PurchaseOrder) => {
        if (!po.items) {
            return 0;
        }

        return po.items.reduce((sum, item) => sum + (item.qty - (item.receipt_items_sum_accepted_qty ?? 0)), 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Select Purchase Order
                    </DialogTitle>
                    <DialogDescription>
                        Choose an approved purchase order to create a goods receipt
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by PO number or supplier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-auto -mx-6 px-6">
                    {filteredPOs.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            {purchaseOrders.length === 0
                                ? 'No approved purchase orders available'
                                : 'No purchase orders match your search'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredPOs.map((po) => (
                                <Button
                                    key={po.id}
                                    variant="ghost"
                                    className="w-full h-auto p-4 justify-start text-left hover:bg-muted/50"
                                    onClick={() => handleSelect(po)}
                                >
                                    <div className="flex items-start gap-4 w-full">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{po.po_number}</span>
                                                <StatusBadge status={po.status} />
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {po.supplier?.name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(po.order_date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    {parseFloat(po.total_amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="font-medium">{getPendingItems(po)} items</div>
                                            <div className="text-muted-foreground">{getPendingQty(po)} units pending</div>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
