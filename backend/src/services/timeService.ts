import sql from "../db.js";

export async function getDatabaseTime() {
    const result = await sql`SELECT NOW()`;
    return result[0].now;
}