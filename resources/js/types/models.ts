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
