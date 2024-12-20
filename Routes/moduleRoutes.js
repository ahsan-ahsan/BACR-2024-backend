import express from "express";
import { getModules, createModule } from "../controllers/ModuleController.js";

const router = express.Router();

// Route to fetch all modules
router.get("/modules", getModules);

// Route to create a new module
router.post("/module", createModule);

export default router;