import { Router } from "express";
import {
  login,
  register,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";

const router = Router();
// Gửi mã OTP
router.post("/send-otp", sendOtp);

// Xác thực mã OTP
router.post("/verify-otp", verifyOtp);

// Đăng ký (sau khi xác thực OTP)
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

export default router;
