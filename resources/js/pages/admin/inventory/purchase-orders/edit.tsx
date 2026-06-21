import { Head } from '@inertiajs/react';
import type { PurchaseOrder } from '@/types';
import { PurchaseOrderForm } from './components';
import type { SupplierOption, StoreOption, VariantOption } from './components';

type Props = {
    purchaseOrder: PurchaseOrder;
    suppliers: SupplierOption[];
    stores: StoreOption[];
    variants: VariantOption[];
};

export default function PurchaseOrdersEdit({ purchaseOrder, suppliers, stores, variants }: Props) {
    return (
        <>
            <Head title={`Edit ${purchaseOrder.po_number}`} />
            <div className="h-[calc(100vh-4rem)]">
                <PurchaseOrderForm
                    order={purchaseOrder}
                    suppliers={suppliers}
                    stores={stores}
                    variants={variants}
                    isPage={true}
                />
            </div>
        </>
    );
}

PurchaseOrdersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Purchase Orders',
            href: '/admin/inventory/purchase-orders',
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
