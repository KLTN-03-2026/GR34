import pool from "../config/db.js";

export const getAllRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM roles ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy roles:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách roles" });
  }
};
