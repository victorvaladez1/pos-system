import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
}

const getJwtSecret = () => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is required.");
    }

    return jwtSecret;
};

export const signAuthToken = (userId: string) => {
    return jwt.sign(
        { userId },
        getJwtSecret(),
        { expiresIn: "8h" }
    );
};

export const verifyAuthToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        !("userId" in decoded) ||
        typeof decoded.userId !== "string"
    ) {
        throw new Error("Invalid token payload.");
    }

    return {
        userId: decoded.userId
    };
};