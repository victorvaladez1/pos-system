import { Router } from "express";
import {
    createUser,
    getUsers,
    updateUser,
    deactivateUser
} from "../controllers/users.controller.js";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.patch("/:id", updateUser);
router.delete("/:id", deactivateUser);

export default router;