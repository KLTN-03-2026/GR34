import express from "express";
import {
  getAllRegions,
  getRegionByIdHandler,
} from "../controllers/regionController.js";

const router = express.Router();

router.get("/", getAllRegions);
router.get("/:id", getRegionByIdHandler);

export default router;
