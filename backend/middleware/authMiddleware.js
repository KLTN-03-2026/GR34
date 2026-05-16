import jwt from "jsonwebtoken";

// Xác thực token JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Thiếu token hoặc sai định dạng! (Bearer <token>)",
    });
  }

  // Get JWT secret from env, use placeholder only in development
  const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-in-production";

  // Warn if using default secret in production
  if (
    process.env.NODE_ENV === "production" &&
    jwtSecret === "dev-secret-change-in-production"
  ) {
    console.error("[AUTH] WARNING: Using default JWT_SECRET in production!");
    return res.status(500).json({ message: "Lỗi cấu hình server" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    return res.status(403).json({ message: "Token không hợp lệ!" });
  }
};
