import express from "express";
import {
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
} from "../controllers/passwordController.js";

const router = express.Router();

// 1. Yêu cầu gửi OTP để reset password
router.post("/forgot-password", forgotPassword);

// 2. Xác thực OTP
router.post("/verify-forgot-otp", verifyForgotOtp);

// 3. Đổi mật khẩu (sau verify OTP)
router.post("/reset-password", resetPassword);

export default router;
