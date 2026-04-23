import sql from "../db.js";
import { User } from "../types/users.types.js";

export const createUserRow = async (newUser: User) => {
    return await sql`INSERT INTO users (first_name, middle_name, last_name, user_role, passcode_hash, is_active) VALUES (${newUser.first_name}, ${newUser.middle_name}, ${newUser.last_name}, ${newUser.user_role}, ${newUser.passcode_hash}, ${newUser.is_active}) RETURNING id`;
};

export const getUserRows = async () => {
    return await sql`SELECT * FROM users`;
};

export const updateUserRowById = async (userId: string, updatedUser: User) => {
    return await sql`UPDATE users SET first_name = ${updatedUser.first_name}, middle_name = ${updatedUser.middle_name}, last_name = ${updatedUser.last_name}, user_role = ${updatedUser.user_role}, passcode_hash = ${updatedUser.passcode_hash}, is_active = ${updatedUser.is_active} WHERE id = ${userId} RETURNING id`;
}

export const deleteUserRowById = async (userId: string) => {
    return await sql`DELETE FROM users WHERE id = ${userId}`;
};