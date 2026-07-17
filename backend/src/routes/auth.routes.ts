import { Router } from "express";
import { passcodeLogin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/passcode-login", passcodeLogin);

export default router;
