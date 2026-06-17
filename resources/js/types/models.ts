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
