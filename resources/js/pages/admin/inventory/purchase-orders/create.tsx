import { Head } from '@inertiajs/react';
import { PurchaseOrderForm } from './components';
import type { SupplierOption, StoreOption, VariantOption } from './components';

type Props = {
    suppliers: SupplierOption[];
    stores: StoreOption[];
    variants: VariantOption[];
};

export default function PurchaseOrdersCreate({ suppliers, stores, variants }: Props) {
    return (
        <>
            <Head title="Create Purchase Order" />
            <div className="h-[calc(100vh-4rem)]">
                <PurchaseOrderForm
                    suppliers={suppliers}
                    stores={stores}
                    variants={variants}
                    isPage={true}
                />
            </div>
        </>
    );
}

PurchaseOrdersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Purchase Orders',
            href: '/admin/inventory/purchase-orders',
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
};
