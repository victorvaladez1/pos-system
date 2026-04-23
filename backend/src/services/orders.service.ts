import sql from "../db.js";

export const getOrderRows = async () => {
    return await sql`SELECT * FROM orders`;
};