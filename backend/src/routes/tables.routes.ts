import { Router } from "express";
import {
    createTable,
    getTables,
    updateTable,
    deleteTable,
    updateTableStatus
} from "../controllers/tables.controller.js";

const router = Router();

router.post("/", createTable);
router.get("/", getTables);
router.patch("/:id/status", updateTableStatus);
router.patch("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;