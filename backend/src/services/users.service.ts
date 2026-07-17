import sql from "../db.js";
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest
} from "../types/user.types.js";

export const createUserRow = async (
    fields: CreateUserRequest
): Promise<User> => {
    const result = await sql<User[]>`
        INSERT INTO users
            (first_name, middle_name, last_name, user_role, passcode_hash, is_active)
        VALUES
            (
                ${fields.first_name},
                ${fields.middle_name ?? null},
                ${fields.last_name},
                ${fields.user_role},
                ${fields.passcode_hash},
                ${fields.is_active ?? true}
            )
        RETURNING *
    `;

    return result[0];
};

export const getUserRows = async (): Promise<User[]> => {
    const result = await sql<User[]>`
        SELECT * FROM users
        ORDER BY created_at DESC
    `;

    return result;
};

export const updateUserRowById = async (
    userId: string,
    fieldsToUpdate: UpdateUserRequest
): Promise<User | undefined> => {
    const result = await sql<User[]>`
        UPDATE users
        SET ${sql(fieldsToUpdate)}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
    `;

    return result[0];
};

export const deactivateUserRowById = async (
    userId: string
): Promise<User | undefined> => {
    const result = await sql<User[]>`
        UPDATE users
        SET is_active = false, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
    `;

    return result[0];
};

export const getUserRowById = async (userId: string): Promise<User | undefined> => {
    const result = await sql<User[]>`
        SELECT *
        FROM users
        WHERE id = ${userId}
    `;

    return result[0];
};