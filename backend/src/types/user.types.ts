export const userRoleEnum = [
    "cashier",
    "server",
    "manager",
    "admin",
    "kitchen",
    "host"
] as const;

export type UserRole = typeof userRoleEnum[number];

export interface User {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: UserRole;
    passcode_hash: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PublicUser {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: UserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserRequest {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    user_role: UserRole;
    passcode_hash: string;
    is_active?: boolean;
}

export interface UpdateUserRequest {
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
    user_role?: UserRole;
    passcode_hash?: string;
    is_active?: boolean;
}

export const isUserRole = (value: unknown): value is UserRole => {
    return typeof value === "string" && userRoleEnum.includes(value as UserRole);
};

export const toPublicUser = (user: User): PublicUser => {
    const { passcode_hash, ...publicUser } = user;
    return publicUser;
};