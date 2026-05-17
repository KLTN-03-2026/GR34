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


// Các route đăng ký bị trùng đã được gỡ bỏ.
// Chúng hiện được xử lý trong driverApplicationRoutes.js, nơi chứa đầy đủ logic tạo người dùng.



router.get("/", getAllDrivers);


router.get("/:id", getDriverById);


router.post("/", createDriver);


router.put("/:id", updateDriver);


router.delete("/:id", deleteDriver);


router.patch("/:id/status", updateDriverStatus);


router.put("/:id/vehicle", assignVehicleToDriver);

export default router;
