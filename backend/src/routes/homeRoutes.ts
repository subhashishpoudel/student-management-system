import { Router } from "express";
import { gethome, getabout } from "../controllers/homeController.js";

const router = Router();

router.get("/", gethome); // pass the function, don't call it
router.get("/about", getabout);

export default router;
