import express from "express";
import { updateDriverLocation } from "../controllers/driverLocationController.js";

const router = express.Router();

// POST /api/drivers/location
router.post("/location", updateDriverLocation);

export default router;
