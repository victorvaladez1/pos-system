export interface PasscodeLoginRequest {
    passcode: string;
}

export interface AuthUser {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}