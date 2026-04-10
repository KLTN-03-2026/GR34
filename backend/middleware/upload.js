import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu file vào thư mục uploads
  },
  filename: function (req, file, cb) {
    // Tạo tên file ngẫu nhiên để không bị trùng (Timestamp + Tên gốc)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "news-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Bộ lọc: Chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP, GIF)"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB cho file đính kèm
    fieldSize: 50 * 1024 * 1024 // Giới hạn 50MB cho các trường text (để chứa base64 content)
  },
  fileFilter: fileFilter,
});

export const handleUploadResponse = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không tìm thấy file ảnh." });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
};

export default upload;
