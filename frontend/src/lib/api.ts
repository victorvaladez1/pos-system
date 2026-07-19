const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string | null;
};

export const apiRequest = async <T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> => {
    const headers: HeadersInit = {
        "Content-Type": "application/json"
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
    }

    return data as T;
};