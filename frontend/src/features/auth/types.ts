export type UserRole = 
    | "cashier"
    | "server"
    | "manager"
    | "admin" 
    | "kitchen"
    | "host";

export type AuthUser = {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    user_role: string;
    user_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type LoginResponse = {
    user: AuthUser;
    token: string;
};

export type CurrentUserResponse = {
    user: AuthUser;
};