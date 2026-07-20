import { apiRequest } from "../../lib/api";
import type { UsersResponse } from "./types";

export const getUsers = async(token: string) => {
    return apiRequest<UsersResponse>("/users", {
        token
    });
};