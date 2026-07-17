import sql from "../../db.js";

export type TestUserRole =
    | "cashier"
    | "server"
    | "manager"
    | "admin"
    | "kitchen"
    | "host";

export const createTestUserWithRole = async (
    userRole: TestUserRole,
    isActive = true
) => {
    const result = await sql`
        INSERT INTO users (
            first_name,
            middle_name,
            last_name,
            user_role,
            passcode_hash,
            is_active
        )
        VALUES (
            ${"Test"},
            ${null},
            ${userRole},
            ${userRole}::user_role_enum,
            ${`${userRole}-passcode`},
            ${isActive}
        )
        RETURNING
            id,
            first_name,
            middle_name,
            last_name,
            user_role,
            is_active,
            created_at,
            updated_at
    `;

    return result[0];
};

export const createXUserIdHeaderForRole = async (
    userRole: TestUserRole,
    isActive = true
) => {
    const user = await createTestUserWithRole(userRole, isActive);

    return {
        "x-user-id": user.id
    };
};

export const createAdminHeader = async () => {
    return createXUserIdHeaderForRole("admin");
};

export const createManagerHeader = async () => {
    return createXUserIdHeaderForRole("manager");
};

export const createCashierHeader = async () => {
    return createXUserIdHeaderForRole("cashier");
};

export const createKitchenHeader = async () => {
    return createXUserIdHeaderForRole("kitchen");
};