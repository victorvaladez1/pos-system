import request from "supertest";
import app from "../../app.js";
import sql from "../../db.js";

export type TestUserRole =
    | "cashier"
    | "server"
    | "manager"
    | "admin"
    | "kitchen"
    | "host";

type TestUser = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    user_role: TestUserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type TestUserWithPasscode = TestUser & {
    passcode: string;
};

export const createTestUserWithRole = async (
    userRole: TestUserRole,
    isActive = true,
    passcode = `${userRole}-passcode`
): Promise<TestUserWithPasscode> => {
    const result = await sql<TestUser[]>`
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
            ${passcode},
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

    return {
        ...result[0],
        passcode
    };
};

export const createJwtHeaderForRole = async (
    userRole: TestUserRole,
    isActive = true
) => {
    const user = await createTestUserWithRole(userRole, isActive);

    const response = await request(app)
        .post("/auth/passcode-login")
        .send({
            passcode: user.passcode
        });

    return {
        Authorization: `Bearer ${response.body.token}`
    };
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
    return createJwtHeaderForRole("admin");
};

export const createManagerHeader = async () => {
    return createJwtHeaderForRole("manager");
};

export const createCashierHeader = async () => {
    return createJwtHeaderForRole("cashier");
};

export const createKitchenHeader = async () => {
    return createJwtHeaderForRole("kitchen");
};