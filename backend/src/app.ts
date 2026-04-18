import express from "express";

import healthRoutes from "./routes/healthRoutes.js";
import timeRoutes from "./routes/timeRoutes.js";
import categoryRoutes from "./routes/categoriesRoutes.js";
import itemRoutes from "./routes/itemsRoutes.js";

const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/time", timeRoutes);

app.use("/categories", categoryRoutes);
app.use("/items", itemRoutes);

export default app;