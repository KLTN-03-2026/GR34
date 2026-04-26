import express from "express";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";
import upload, { handleUploadResponse } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.post("/", upload.single("imageFile"), createNews);
router.put("/:id", upload.single("imageFile"), updateNews);
router.delete("/:id", deleteNews);

router.post("/upload-image", upload.single("image"), handleUploadResponse);

export default router;
