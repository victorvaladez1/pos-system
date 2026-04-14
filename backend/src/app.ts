import express from "express";

import healthRoutes from "./routes/healthRoutes.js";
import timeRoutes from "./routes/timeRoutes.js";

const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/time", timeRoutes);

export default app;