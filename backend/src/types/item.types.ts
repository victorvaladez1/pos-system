export interface Item {
    id: string;
    name: string;
    description: string | null;
    price_in_cents: number;
    category_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateItemRequest {
    name: string;
    description?: string | null;
    price_in_cents: number;
    category_id: string;
    is_active?: boolean;
}

export interface UpdateItemRequest {
    name?: string;
    description?: string | null;
    price_in_cents?: number;
    category_id?: string;
    is_active?: boolean;
}