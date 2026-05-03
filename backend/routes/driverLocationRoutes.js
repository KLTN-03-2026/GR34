import express from "express";
import { updateDriverLocation } from "../controllers/driverLocationController.js";

const router = express.Router();


router.post("/location", updateDriverLocation);

export default router;
