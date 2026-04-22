import { Router } from "express";
import {
    createTable,
    getTables,
    updateTable,
    deleteTable
} from "../controllers/tablesController.js";

const router = Router();

router.post("/", createTable);
router.get("/", getTables);
router.patch("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;