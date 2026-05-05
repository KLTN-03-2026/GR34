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
  toggleDriverStatus,
  updateDriverProfile,
  getDriverRatingStats,
  updateDriverLocation,
} from "../controllers/driverController.js";

const router = express.Router();

router.get("/dashboard/:id", getDriverDashboard);
router.get("/assignments/:id", getDriverAssignments);
router.get("/history/:id", getDriverHistory);
router.get("/profile/:id", getDriverProfile);
router.get("/profile/user/:userId", getDriverProfileByUser);
router.get("/rating-stats/:id", getDriverRatingStats);

router.patch("/shipments/:shipment_id/status", updateDriverShipmentStatus);
router.patch("/password/:id", changeDriverPassword);
router.patch("/toggle-status/:id", toggleDriverStatus);
router.put("/update-profile/:id", updateDriverProfile);
router.put("/:id/vehicle", updateDriverVehicle);
router.patch("/location/:id", updateDriverLocation);

export default router;
