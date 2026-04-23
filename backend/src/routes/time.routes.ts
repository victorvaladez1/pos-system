import { Router } from "express";
import { getTimeFromDB } from "../controllers/time.controller.js"

const router = Router();

router.get('/', getTimeFromDB);

export default router;