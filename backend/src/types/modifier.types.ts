export interface Modifier {
    id: string;
    name: string;
    price_in_cents: number;
    created_at: string;
    updated_at: string;
}

export interface CreateModifierRequest {
    name: string;
    price_in_cents: number;
}

export interface UpdateModifierRequest {
    name?: string;
    price_in_cents?: number;
}