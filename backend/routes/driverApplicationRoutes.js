import express from "express";
import {
  applyDriver,
  getApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/driverApplicationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { hasRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Đăng ký trở thành tài xế (công khai - không cần đăng nhập)
router.post("/apply", applyDriver);

// Lấy danh sách đơn đăng ký tài xế (chỉ quản trị viên)
router.get("/applications", verifyToken, hasRole("admin"), getApplications);

// Duyệt đơn đăng ký tài xế (chỉ quản trị viên)
router.post("/applications/:id/approve", verifyToken, hasRole("admin"), approveApplication);

// Từ chối đơn đăng ký tài xế (chỉ quản trị viên)
router.post("/applications/:id/reject", verifyToken, hasRole("admin"), rejectApplication);

export default router;
