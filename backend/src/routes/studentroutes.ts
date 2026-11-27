// ============================================================
// Cell 1: Imports
// The four student functions from studentcontroller.ts.
// ============================================================
import { Router } from "express";
import {
  getstudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentcontroller.js";


// ============================================================
// Cell 2: Addresses
// index.ts puts "/students" in front of each of these.
// ============================================================
const router = Router();

router.get("/", getstudents);         // list    (controller Cell 4)
router.post("/", createStudent);      // add     (controller Cell 5)
router.put("/:id", updateStudent);    // change  (controller Cell 6)
router.delete("/:id", deleteStudent); // remove  (controller Cell 7)

export default router;
