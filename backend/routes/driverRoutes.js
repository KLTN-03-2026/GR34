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



router.get("/dashboard/:id", getDriverDashboard);


router.get("/assignments/:id", getDriverAssignments);


router.get("/history/:id", getDriverHistory);


router.get("/profile/:id", getDriverProfile);


router.patch("/shipments/:shipment_id/status", updateDriverShipmentStatus);


router.patch("/password/:id", changeDriverPassword);


router.put("/:id/vehicle", updateDriverVehicle);
router.get("/profile/user/:userId", getDriverProfileByUser);
export default router;
