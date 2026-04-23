import express from "express";
import {
  getCustomerProfile,
  updateCustomerProfile,
  createShipment,
  getShipmentsByCustomer,
  createFeedback,
  trackShipment,
  getShipmentDetail,
  changePassword,
} from "../controllers/customerController.js";

const router = express.Router();

// Hồ sơ khách hàng
router.get("/profile/:id", getCustomerProfile);
router.put("/profile/:id", updateCustomerProfile);

// Đơn hàng
router.post("/shipments", createShipment);
router.get("/shipments/:customer_id", getShipmentsByCustomer);
router.get("/shipment/:id", getShipmentDetail); // ✅ chi tiết đơn hàng
router.get("/track/:code", trackShipment);
router.get("/:customer_id/shipments", getShipmentsByCustomer);
// Feedback
router.post("/feedback", createFeedback);
// đổi mật khẩu
router.put("/change-password/:id", changePassword);

export default router;
