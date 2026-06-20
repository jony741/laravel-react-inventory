import { Head } from '@inertiajs/react';
import type { PurchaseOrder, Store } from '@/types';
import { GoodsReceiptForm } from './components';

type Props = {
    purchaseOrder: PurchaseOrder;
    stores: Pick<Store, 'id' | 'name'>[];
};

export default function GoodsReceiptsCreate({ purchaseOrder, stores }: Props) {
    return (
        <>
            <Head title={`Create GRN - ${purchaseOrder.po_number}`} />
            <div className="h-[calc(100vh-4rem)]">
                <GoodsReceiptForm purchaseOrder={purchaseOrder} stores={stores} />
            </div>
        </>
    );
}

GoodsReceiptsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Goods Receipts',
            href: '/admin/inventory/goods-receipts',
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
};
