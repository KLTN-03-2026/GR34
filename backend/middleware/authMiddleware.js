import jwt from "jsonwebtoken";

// 👇 ĐỔI TÊN Ở ĐÂY: từ 'authMiddleware' thành 'verifyToken'
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Thiếu token hoặc sai định dạng! (Bearer <token>)",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Lưu ý: Đảm bảo secret key khớp với file authController (nên dùng biến môi trường hoặc chuỗi cứng giống nhau)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");

    req.user = decoded; // gắn user vào request
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    return res.status(403).json({ message: "Token không hợp lệ!" });
  }
};
