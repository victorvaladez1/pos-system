import { Router } from "express";
import {
    passcodeLogin,
    getCurrentUser
} from "../controllers/auth.controller.js";
import { requireUser } from "../middleware/requireUser.js";

const router = Router();

router.post("/passcode-login", passcodeLogin);
router.get("/me", requireUser, getCurrentUser);

export default router;