import { createContext } from "react";
import type { AuthUser } from "./types";

export type AuthContextValue = {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (passcode: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);