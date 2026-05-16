import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
  uploadDriverAvatar,
} from "../controllers/driverController.js";

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `driver-${req.params.id}-${uniqueSuffix}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"));
  },
});

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
router.post("/upload-avatar/:id", avatarUpload.single("avatar"), uploadDriverAvatar);

export default router;
