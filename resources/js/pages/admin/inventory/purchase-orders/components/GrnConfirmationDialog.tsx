import { router } from '@inertiajs/react';
import { AlertCircle, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type GrnConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: number | null;
    poNumber?: string;
    supplierName?: string;
    totalAmount?: string;
};

export function GrnConfirmationDialog({
    open,
    onOpenChange,
    orderId,
    poNumber,
    supplierName,
    totalAmount,
}: GrnConfirmationDialogProps) {
    const handleCreateGrn = () => {
        if (orderId) {
            router.visit(`/admin/inventory/goods-receipts/create/${orderId}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        Create Goods Receipt Note?
                    </DialogTitle>
                    <DialogDescription>
                        You are about to create a Goods Receipt Note (GRN) for this Purchase Order.
                        This will allow you to record received goods against this order.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">PO Number:</span>
                        <span className="font-medium">{poNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="font-medium">{supplierName || '-'}</span>
                    </div>
                    {totalAmount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-bold">৳{parseFloat(totalAmount).toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateGrn}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Create GRN
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
