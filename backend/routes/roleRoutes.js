import express from "express";
import { getAllRoles } from "../controllers/roleController.js";

const router = express.Router();

// Lấy tất cả roles
router.get("/", getAllRoles);

export default router;
