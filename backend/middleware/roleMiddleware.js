// Middleware kiểm tra quyền
export const hasRole =
  (...allowed) =>
  (req, res, next) => {
    try {
      // Lấy danh sách roles của user từ JWT
      const roles = req.user?.roles || [];

      // Kiểm tra user có ít nhất 1 role nằm trong allowed
      const ok = roles.some((r) => allowed.includes(r));
      if (!ok) return res.status(403).json({ message: "Forbidden" });

      // Có quyền → tiếp tục
      next();
    } catch {
      // Có lỗi → chặn truy cập
      return res.status(403).json({ message: "Forbidden" });
    }
  };
