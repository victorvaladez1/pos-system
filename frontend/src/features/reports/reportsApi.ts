import { apiRequest } from "../../lib/api";
import type {
    DailySalesResponse,
    OpenBalancesResponse,
    PaymentMethodsResponse,
    TopItemsResponse
} from "./types";

export const getDailySalesReport = async (token: string) => {
    return apiRequest<DailySalesResponse>("/reports/daily-sales", {
        token
    });
};

export const getPaymentMethodsReport = async (token: string ) => {
    return apiRequest<PaymentMethodsResponse>("/reports/payment-methods", {
        token
    });
};

export const getTopItemsReport = async (token: string) => {
    return apiRequest<TopItemsResponse>("/reports/top-items", {
        token
    });
};

export const getOpenBalancesReport = async (token: string) => {
    return apiRequest<OpenBalancesResponse>("/reports/open-balances", {
        token
    });
};