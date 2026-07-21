import { apiRequest } from "../../lib/api";
import type { OrdersResponse, OrderSummaryResponse } from "./types";

export const getOrders = async (token: string) => {
    return apiRequest<OrdersResponse>("/orders", {
        token
    });
};

export const getOrdersSummary = async (token: string, orderId: string) => {
    return apiRequest<OrderSummaryResponse>(`/orders/${orderId}/summary`, {
        token
    });
};