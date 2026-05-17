import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getCustomerProfile,
  updateCustomerProfile,
  uploadAvatar,
  createShipment,
  getShipmentsByCustomer,
  createFeedback,
  trackShipment,
  getShipmentDetail,
  changePassword,
  cancelShipment,
} from "../controllers/customerController.js";

const router = express.Router();

// Cấu hình multer để tải ảnh đại diện lên
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
    cb(null, `avatar-${req.params.id}-${uniqueSuffix}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)"));
  },
});

router.get("/profile/:id", getCustomerProfile);
router.put("/profile/:id", updateCustomerProfile);
router.post("/avatar/:id", avatarUpload.single("avatar"), uploadAvatar);


router.post("/shipments", createShipment);
router.get("/shipments/:customer_id", getShipmentsByCustomer);
router.get("/shipment/:id", getShipmentDetail);
router.get("/track/:code", trackShipment);
router.get("/:customer_id/shipments", getShipmentsByCustomer);

router.post("/feedback", createFeedback);
router.post("/shipments/:id/cancel", cancelShipment);

router.put("/change-password/:id", changePassword);

export default router;
