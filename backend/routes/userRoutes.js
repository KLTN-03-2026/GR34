import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Lấy danh sách tất cả user
router.get("/", getAllUsers);

// Cập nhật thông tin user theo ID
router.put("/:id", updateUser);

// Xoá user theo ID
router.delete("/:id", deleteUser);

export default router;
