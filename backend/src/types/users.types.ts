export const userRoleEnum = ['cashier', 'server', 'manager', 'admin', 'kitchen', 'host'] as const;

export type UserRole = typeof userRoleEnum[number];
export interface User {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: UserRole;
    passcode_hash: string;
    is_active: boolean;
};

export const isUserRole = (value: unknown): value is UserRole => {
    return typeof value === "string" && userRoleEnum.includes(value as UserRole);
};