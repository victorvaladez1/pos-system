import express from "express";

import healthRoutes from "./routes/health.routes.js";
import timeRoutes from "./routes/time.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import itemRoutes from "./routes/items.routes.js";
import modifierRoutes from "./routes/modifiers.routes.js";
import tableRoutes from "./routes/tables.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/users.routes.js";
import orderItemRoutes from "./routes/orderItems.routes.js";
import orderItemModifierRoutes from "./routes/orderItemModifiers.routes.js";

const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/time", timeRoutes);

app.use("/categories", categoryRoutes);
app.use("/items", itemRoutes);
app.use("/modifiers", modifierRoutes);
app.use("/tables", tableRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.use("/order-items", orderItemRoutes);
app.use("/order-item-modifiers", orderItemModifierRoutes);

export default app;