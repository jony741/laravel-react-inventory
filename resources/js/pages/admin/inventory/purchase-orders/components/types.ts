import type { PurchaseOrder, Supplier, Store as StoreType, ProductVariant } from '@/types';

export type OrderItemFormData = {
    id?: number;
    variant_id: number;
    qty: number;
    purchase_price: string;
    subtotal: string;
    discount_percentage: boolean;
    discount: string;
    tax_percentage: string;
};

export const emptyOrderItem: OrderItemFormData = {
    variant_id: 0,
    qty: 1,
    purchase_price: '',
    subtotal: '0',
    discount_percentage: false,
    discount: '',
    tax_percentage: '',
};

export type SupplierOption = Pick<Supplier, 'id' | 'name' | 'phone' | 'address'>;
export type StoreOption = Pick<StoreType, 'id' | 'name'>;
export type VariantOption = Pick<ProductVariant, 'id' | 'product_id' | 'sku' | 'barcode' | 'color' | 'size' | 'price'> & {
    product?: { id: number; name: string };
};

export type OrderStatus = 'NEW' | 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED';

export type PurchaseOrderFormProps = {
    order?: PurchaseOrder | null;
    suppliers: SupplierOption[];
    stores: StoreOption[];
    variants: VariantOption[];
    isPage?: boolean;
};

export type PurchaseOrderPreviewProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: PurchaseOrder | null;
};
