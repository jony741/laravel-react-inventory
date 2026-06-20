import type { PurchaseOrder, Store as StoreType } from '@/types';

export type CostDistributionMode = 'ITEM_WISE' | 'UNIT_WISE';

export type GRNItemFormData = {
    purchase_order_item_id: number;
    product_variant_id: number;
    variant_name: string;
    sku: string;
    ordered_qty: number;
    pending_qty: number;
    received_qty: number;
    accepted_qty: number;
    rejected_qty: number;
    rejection_reason: string;
    unit_purchase_cost_price: string;
    unit_shipping_cost: string;
    unit_custom_duty: string;
    unit_other_cost: string;
    total_cost_price: string;
    batch_number: string;
    expiry_date: string;
    notes: string;
};

export type GRNFormData = {
    purchase_order_id: number;
    store_id: number;
    received_date: string;
    supplier_invoice_no: string;
    supplier_invoice_date: string;
    shipping_cost: string;
    custom_duty: string;
    other_cost: string;
    cost_distribution_mode: CostDistributionMode;
    items: GRNItemFormData[];
    notes: string;
};

export type StoreOption = Pick<StoreType, 'id' | 'name'>;

export type GoodsReceiptCreateProps = {
    purchaseOrder: PurchaseOrder;
    stores: StoreOption[];
};
