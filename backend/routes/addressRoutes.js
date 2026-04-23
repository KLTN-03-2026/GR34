import express from "express";
import * as addressController from "../controllers/addressController.js"; // Nhớ thêm .js

const router = express.Router();

// Lấy danh sách địa chỉ
router.get("/:customer_id", addressController.getAddresses);

// Thêm mới
router.post("/", addressController.createAddress);

// Cập nhật
router.put("/:id", addressController.updateAddress);

// Xóa
router.delete("/:id", addressController.deleteAddress);

export default router; // 👈 QUAN TRỌNG: Phải dùng export default
