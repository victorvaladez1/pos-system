import express from "express";

import healthRoutes from "./routes/healthRoutes.js";
import timeRoutes from "./routes/timeRoutes.js";
import categoryRoutes from "./routes/categoriesRoutes.js";

const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/time", timeRoutes);

app.use("/categories", categoryRoutes);

export default app;