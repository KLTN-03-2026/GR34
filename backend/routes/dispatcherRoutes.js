import express from "express";
import {
  getUnassignedShipments,
  getAvailableDrivers,
  assignShipment,
  getAssignments,
  updateAssignmentStatus,
  reassignDriver,
  getDispatcherDashboard,
  getShipmentDetail,
} from "../controllers/dispatcherController.js";

// 👇 1. IMPORT MIDDLEWARE (QUAN TRỌNG)
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👇 2. CHÈN verifyToken VÀO TẤT CẢ CÁC ROUTE

// Đơn hàng chưa phân công
router.get("/shipments/unassigned", verifyToken, getUnassignedShipments);

// Lấy danh sách tài xế khả dụng
router.get("/drivers", verifyToken, getAvailableDrivers);

// Phân công tài xế cho đơn
router.post("/assign", verifyToken, assignShipment);

// Danh sách phân công (Lỗi của bạn đang ở dòng này)
router.get("/assignments", verifyToken, getAssignments);

// Cập nhật trạng thái phân công
router.put("/assignments/:id", verifyToken, updateAssignmentStatus);

// Đổi tài xế
router.put("/assignments/:id/reassign", verifyToken, reassignDriver);

// Dashboard điều phối viên
router.get("/dashboard", verifyToken, getDispatcherDashboard);

// Chi tiết đơn hàng
router.get("/shipments/:id", verifyToken, getShipmentDetail);

// Cập nhật trạng thái (API dùng cho nút bấm nhanh)
router.patch("/assignments/:id/status", verifyToken, updateAssignmentStatus);

export default router;
