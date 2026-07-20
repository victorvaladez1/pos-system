import { apiRequest } from "../../lib/api";
import type { TablesResponse } from "./types";

export const getTables = async (token: string) => {
    return apiRequest<TablesResponse>("/tables", {
        token
    });
};