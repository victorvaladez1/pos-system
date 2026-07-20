import {
    useEffect,
    useMemo,
    useState
} from "react";
import { apiRequest } from "../../lib/api";
import type {
    AuthUser,
    CurrentUserResponse,
    LoginResponse
} from "./types.ts";
import {
    AuthContext,
    type AuthContextValue
} from "./auth-context.ts";

const TOKEN_STORAGE_KEY = "pos_auth_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiRequest<CurrentUserResponse>("/auth/me", {
                    token
                });

                setUser(response.user);
            } catch {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, [token]);

    const login = async (passcode: string) => {
        const response = await apiRequest<LoginResponse>("/auth/passcode-login", {
            method: "POST",
            body: {
                passcode: passcode.trim()
            }
        });

        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        setToken(response.token);
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
    };

    const value = useMemo<AuthContextValue>(() => {
        return {
            user,
            token,
            isLoading,
            login,
            logout
        };
    }, [user, token, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};