import { Router } from "express";
import {
    createModifier,
    getModifiers,
    updateModifier, 
    deleteModifier
} from "../controllers/modifiersController.js"

const router = Router();

router.post("/", createModifier);
router.get("/", getModifiers)
router.patch("/:id", updateModifier);
router.delete("/:id", deleteModifier);

export default router;