export type Brand = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    parent?: Category;
    created_at: string;
    updated_at: string;
};

export type Store = {
    id: number;
    name: string;
    type: string;
    code: string | null;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Customer = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Supplier = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    contact_person: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    sku: string;
    barcode: string | null;
    color: string | null;
    size: string | null;
    cost: string;
    price: string;
    reorder_level: number;
    is_active: boolean;
    product?: Product;
    created_at: string;
    updated_at: string;
};

export type PurchaseOrderItem = {
    id: number;
    purchase_order_id: number;
    variant_id: number;
    qty: number;
    cost: string;
    subtotal: string;
    discount_percentage: boolean;
    discount: string | null;
    tax_percentage: string | null;
    received_qty: number;
    variant?: ProductVariant;
    created_at: string;
    updated_at: string;
};

export type PurchaseOrder = {
    id: number;
    po_number: string;
    supplier_id: number;
    store_id: number;
    order_date: string;
    expected_date: string | null;
    received_date: string | null;
    shipping_cost: string;
    payment_status: string;
    approved_by: number | null;
    discount_type: string;
    supplier_invoice_number: string;
    supplier_invoice_date: string | null;
    status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
    subtotal: string;
    tax: string;
    discount: string;
    total_amount: string;
    notes: string | null;
    created_by: number | null;
    supplier?: Supplier;
    store?: Store;
    items?: PurchaseOrderItem[];
    created_at: string;
    updated_at: string;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    category_id: number | null;
    brand_id: number | null;
    unit: string;
    is_active: boolean;
    category?: Category;
    brand?: Brand;
    variants?: ProductVariant[];
    created_at: string;
    updated_at: string;
};
