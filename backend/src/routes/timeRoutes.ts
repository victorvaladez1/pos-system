import { Router } from "express";
import { getTimeFromDB } from "../controllers/timeController.js"

const router = Router();

router.get('/', getTimeFromDB);

export default router;