import sql from "../db.js";
import type {
    Payment,
    CreatePaymentRequest,
    UpdatePaymentRequest
} from "../types/payment.types.js";

export const createPaymentRow = async (
    fields: CreatePaymentRequest
): Promise<Payment> => {
    const result = await sql<Payment[]>`
        INSERT INTO payments 
            (order_id, amount_in_cents, payment_method, payment_status)
        VALUES 
            (${fields.order_id}, ${fields.amount_in_cents}, ${fields.payment_method}, ${fields.payment_status})
        RETURNING *
    `;

    return result[0];
};

export const getPaymentRows = async (): Promise<Payment[]> => {
    const result = await sql<Payment[]>`
        SELECT * FROM payments
        ORDER BY created_at DESC
    `;

    return result;
};

export const updatePaymentRowById = async (
    paymentId: string,
    fieldsToUpdate: UpdatePaymentRequest
): Promise<Payment | undefined> => {
    const result = await sql<Payment[]>`
        UPDATE payments
        SET ${sql(fieldsToUpdate)}, updated_at = NOW()
        WHERE id = ${paymentId}
        RETURNING *
    `;

    return result[0];
};

export const deletePaymentRowById = async (
    paymentId: string
): Promise<Payment | undefined> => {
    const result = await sql<Payment[]>`
        DELETE FROM payments
        WHERE id = ${paymentId}
        RETURNING *
    `;

    return result[0];
};