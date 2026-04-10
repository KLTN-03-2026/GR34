import pool from "../config/db.js";

//  Lấy danh sách người dùng (hỗ trợ lọc role qua query ?role=)
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // 👉 nhận ?role=dispatcher hoặc ?role=driver

    let sql = `
      SELECT 
        DISTINCT u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        ur.role_id,
        r.name AS role_name,  
        r.code AS role_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
    `;

    //  Nếu có ?role=... thì thêm điều kiện WHERE
    const params = [];
    if (role) {
      sql += ` WHERE r.code = ? `;
      params.push(role);
    }

    sql += " ORDER BY u.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error,
    });
  }
};

//  Cập nhật người dùng (tự đồng bộ role + bảng liên quan)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status, role_id } = req.body;

    // console.log("🟡 updateUser body:", req.body);

    // Lấy thông tin user gốc
    const [[user]] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // 1️ Cập nhật thông tin cơ bản
    await pool.query(
      "UPDATE users SET name = ?, email = ?, status = ? WHERE id = ?",
      [name || user.name, email || user.email, status || user.status, id]
    );

    //  2️ Cập nhật role trong user_roles
    if (role_id) {
      const [[exist]] = await pool.query(
        "SELECT * FROM user_roles WHERE user_id = ?",
        [id]
      );

      if (exist) {
        await pool.query(
          "UPDATE user_roles SET role_id = ? WHERE user_id = ?",
          [role_id, id]
        );
      } else {
        await pool.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [id, role_id]
        );
      }

      //  3 Xử lý tự động theo từng role
      switch (Number(role_id)) {
        //  Quản trị
        case 1:
          await pool.query("DELETE FROM drivers WHERE user_id = ?", [id]);
          console.log(`🧹 user_id=${id} đổi thành admin → xóa khỏi drivers`);
          break;

        //  Điều phối viên
        case 2:
          await pool.query("DELETE FROM drivers WHERE user_id = ?", [id]);
          console.log(` user_id=${id} đổi thành dispatcher → xóa khỏi drivers`);
          break;

        // Tài xế
        case 3:
          const [[driverExist]] = await pool.query(
            "SELECT * FROM drivers WHERE user_id = ?",
            [id]
          );
          if (!driverExist) {
            await pool.query(
              `INSERT INTO drivers (name, email, phone, status, user_id)
               VALUES (?, ?, ?, 'available', ?)`,
              [name || user.name, email || user.email, user.phone || null, id]
            );
            console.log(` user_id=${id} đổi thành driver → thêm vào drivers`);
          }
          break;

        //  Khách hàng
        case 4:
          await pool.query("DELETE FROM drivers WHERE user_id = ?", [id]);
          console.log(` user_id=${id} đổi thành customer → xóa khỏi drivers`);
          break;

        default:
          console.log(` Role khác (${role_id}) không cần xử lý đặc biệt.`);
      }
    }

    res.json({ message: "✅ Cập nhật người dùng thành công" });
  } catch (err) {
    console.error("❌ Lỗi updateUser chi tiết:", err);
    res.status(500).json({
      message: "Lỗi khi cập nhật người dùng",
      error: err.message,
    });
  }
};
// Xóa người dùng
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa role liên kết (nếu có)
    await pool.query("DELETE FROM user_roles WHERE user_id = ?", [id]);

    // Xóa khỏi bảng drivers (nếu user này từng là tài xế)
    await pool.query("DELETE FROM drivers WHERE user_id = ?", [id]);

    // Xóa user
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      message: "🗑️ Đã xóa người dùng và dữ liệu liên quan thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
  }
};
