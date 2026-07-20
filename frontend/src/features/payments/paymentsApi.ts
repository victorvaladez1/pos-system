import { apiRequest } from "../../lib/api";
import type {
    CreatePaymentInput,
    PaymentResponse,
    PaymentsResponse
} from "./types";

export const getPayments = async (token: string) => {
    return apiRequest<PaymentsResponse>("/payments", {
        token
    });
};

export const createPayment = async (
    token: string,
    payment: CreatePaymentInput
) => {
    return apiRequest<PaymentResponse>("/payments", {
        method: "POST",
        token,
        body: payment
    });
};