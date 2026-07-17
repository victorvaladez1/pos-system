import sql from "../db.js";
import type { AuthUser } from "../types/auth.types.js";
import { comparePasscode } from "../utils/passcode.js";

interface UserWithPasscodeHash extends AuthUser {
    passcode_hash: string;
}

export const getActiveUserByPasscode = async (
    passcode: string
) : Promise<AuthUser | undefined> => {
    const result = await sql<UserWithPasscodeHash[]>`
        SELECT
            id,
            first_name,
            middle_name,
            last_name,
            user_role,
            passcode_hash,
            is_active,
            created_at,
            updated_at
        FROM users
        WHERE is_active = TRUE
        ORDER BY created_at DESC
    `;

    for (const user of result) {
        const isValidPasscode = await comparePasscode(
            passcode,
            user.passcode_hash
        );

        if (isValidPasscode) {
            const { passcode_hash, ...userWithoutPasscodeHash } = user;
            return userWithoutPasscodeHash;
        }
    }

    return undefined;
};
