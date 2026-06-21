import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent
} from '@/components/ui/dialog';
import type { PurchaseOrder } from '@/types';
import { GoodsReceiptForm } from './GoodsReceiptForm';
import { POSelectorDialog } from './POSelectorDialog';
import type { GoodsReceiptFormDialogProps } from './types';

export function GoodsReceiptFormDialog({
    open,
    onOpenChange,
    approvedPurchaseOrders,
    stores
}: GoodsReceiptFormDialogProps) {
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        if (!open) {
            setStep('select');
            setSelectedPO(null);
        }
    }, [open]);

    const handlePOSelect = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setStep('form');
    };

    const handleBack = () => {
        setStep('select');
        setSelectedPO(null);
    };

    const handleSuccess = () => {
        onOpenChange(false);
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
                <GoodsReceiptForm
                    purchaseOrder={selectedPO}
                    stores={stores}
                    isDialog={true}
                    onBack={handleBack}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
