import express from "express";
import {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  assignShipment,
  getShipmentByCode,
  getShipmentByCodePublic,
  assignShipmentsBulk,
} from "../controllers/shipmentController.js";

// 👇 IMPORT THÊM FILE NÀY
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================================
// CÁC ROUTE CẦN BẢO MẬT (Phải có verifyToken)
// =============================================

// 1. Lấy danh sách (QUAN TRỌNG: Thêm verifyToken để lọc vùng)
router.get("/", verifyToken, getAllShipments);

// 2. Các hành động sửa/xóa/tạo cũng nên bảo mật
router.get("/:id", verifyToken, getShipmentById);
router.post("/", verifyToken, createShipment);
router.put("/:id", verifyToken, updateShipment);
router.delete("/:id", verifyToken, deleteShipment);

// 3. Dispatcher (Phân công)
router.post("/assign", verifyToken, assignShipment);
router.post("/assign-bulk", verifyToken, assignShipmentsBulk);

// =============================================
// CÁC ROUTE CÔNG KHAI (Khách xem tracking)
// =============================================
// Tracking không cần login cũng xem được (hoặc tùy logic của bạn)
router.get("/track/:code", getShipmentByCode);
router.get("/code/:code", getShipmentByCodePublic);

export default router;
