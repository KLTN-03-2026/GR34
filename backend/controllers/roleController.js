import pool from "../config/db.js";

// Lấy danh sách tất cả vai trò trong hệ thống (admin, customer, driver, dispatcher)
export const getAllRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM roles ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách roles" });
  }
};
