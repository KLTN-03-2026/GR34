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
  getNearbyDrivers,
  getFailedShipments,
  rescheduleShipment,
  cancelFailedShipment,
} from "../controllers/dispatcherController.js";


import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();




router.get("/dashboard", verifyToken, getDispatcherDashboard);


router.get("/shipments/unassigned", verifyToken, getUnassignedShipments);


router.get("/shipments/failed", verifyToken, getFailedShipments);


router.get("/drivers/nearby", verifyToken, getNearbyDrivers);


router.get("/drivers", verifyToken, getAvailableDrivers);


router.get("/assignments", verifyToken, getAssignments);




router.get("/shipments/:id", verifyToken, getShipmentDetail);


router.post("/assign", verifyToken, assignShipment);


router.put("/assignments/:id", verifyToken, updateAssignmentStatus);
router.patch("/assignments/:id/status", verifyToken, updateAssignmentStatus);


router.put("/assignments/:id/reassign", verifyToken, reassignDriver);


router.post("/shipments/:id/reschedule", verifyToken, rescheduleShipment);


router.post("/shipments/:id/cancel", verifyToken, cancelFailedShipment);

export default router;
