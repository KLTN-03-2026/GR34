import express from "express";
import {
  getDriverDashboard,
  getDriverAssignments,
  getDriverHistory,
  updateDriverShipmentStatus,
  getDriverProfile,
  changeDriverPassword,
  updateDriverVehicle,
  getDriverProfileByUser,
} from "../controllers/driverController.js";

const router = express.Router();

// Dashboard tài xế
//GET /api/drivers/dashboard/:id

router.get("/dashboard/:id", getDriverDashboard);

/**
 *  Danh sách đơn hàng được giao cho tài xế
 * GET /api/drivers/assignments/:id
 */
router.get("/assignments/:id", getDriverAssignments);

/**
 *  Lịch sử giao hàng
 * GET /api/drivers/history/:id
 */
router.get("/history/:id", getDriverHistory);

/**
 *  Hồ sơ tài xế (thông tin + xe)
 * GET /api/drivers/profile/:id
 */
router.get("/profile/:id", getDriverProfile);

/**
 * Cập nhật trạng thái đơn hàng
 * PATCH /api/drivers/shipments/:shipment_id/status
 */
router.patch("/shipments/:shipment_id/status", updateDriverShipmentStatus);

/**
 *  Đổi mật khẩu tài xế
 * PATCH /api/drivers/password/:id
 */
router.patch("/password/:id", changeDriverPassword);

/**
 * Cập nhật / gán xe cho tài xế
 * PUT /api/drivers/:id/vehicle
 */
router.put("/:id/vehicle", updateDriverVehicle);
router.get("/profile/user/:userId", getDriverProfileByUser);
export default router;
