import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPasscode = async (passcode: string) => {
    return bcrypt.hash(passcode, SALT_ROUNDS);
};

export const comparePasscode = async (
    passcode: string,
    passcodeHash: string
) => {
    return bcrypt.compare(passcode, passcodeHash);
};