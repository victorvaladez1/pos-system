import type{ UserRole } from "../auth/types";

export type User = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: UserRole;
    passcode_hash?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type UsersResponse = {
    users: User[];
};