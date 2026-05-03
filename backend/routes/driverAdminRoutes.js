import express from "express";
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  assignVehicleToDriver,
  getDriverApplications,
  approveApplication,
  rejectApplication,

} from "../controllers/driverAdminController.js";

const router = express.Router();


// Conflicting application routes removed. 
// They are now handled by driverApplicationRoutes.js which contains the fully working logic with user creation.



router.get("/", getAllDrivers);


router.get("/:id", getDriverById);


router.post("/", createDriver);


router.put("/:id", updateDriver);


router.delete("/:id", deleteDriver);


router.patch("/:id/status", updateDriverStatus);


router.put("/:id/vehicle", assignVehicleToDriver);

export default router;
