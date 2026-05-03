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


router.get("/profile/:id", getCustomerProfile);
router.put("/profile/:id", updateCustomerProfile);


router.post("/shipments", createShipment);
router.get("/shipments/:customer_id", getShipmentsByCustomer);
router.get("/shipment/:id", getShipmentDetail);
router.get("/track/:code", trackShipment);
router.get("/:customer_id/shipments", getShipmentsByCustomer);

router.post("/feedback", createFeedback);

router.put("/change-password/:id", changePassword);

export default router;
