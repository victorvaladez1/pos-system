import { Router } from "express";
import {
    createItem,
    getItems,
    updateItem,
    deleteItem
} from "../controllers/items.controller.js";

const router = Router();

router.post("/", createItem);
router.get("/", getItems);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;