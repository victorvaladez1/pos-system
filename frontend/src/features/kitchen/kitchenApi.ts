import { apiRequest } from "../../lib/api";
import type { KitchenOrdersResponse } from "./types";

export const getKitchenOrders = async (token: string) => {
    return apiRequest<KitchenOrdersResponse>("/kitchen/orders", {
        token
    });
};