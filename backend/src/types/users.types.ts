interface User {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    user_role: 'cashier' | 'server' | 'manager' | 'admin' | 'kitchen' | 'host';
    passcode_hash: string;
    is_active: boolean;
};