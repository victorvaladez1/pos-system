import "dotenv/config.js";
import sql from "./db.js";
import app from "./app.js";

import { getDatabaseTime } from "./services/time.service.js";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
    try {
        const result = await getDatabaseTime();
        console.log("Database connected:", result);

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}!`);
        });
    } catch (error) {
        console.log("Failed to connect to database:", error);
        process.exit(1);
    }
}   

startServer();