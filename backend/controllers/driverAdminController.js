import db from "../config/db.js";

// Lấy danh sách tất cả tài xế kèm thông tin xe, sắp xếp mới nhất trước
export const getAllDrivers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id, d.name, d.email, d.phone, d.status,
        d.region_id,
        d.latitude, d.longitude,
        d.vehicle_id,
        v.plate_no, 
        v.type AS vehicle_type, 
        v.capacity_kg AS capacity,
        (SELECT COUNT(*) FROM assignments a WHERE a.driver_id = d.id) AS total_orders
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tài xế" });
  }
};

// Lấy thông tin chi tiết một tài xế theo ID kèm thông tin xe
export const getDriverById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        d.*, 
        v.plate_no, 
        v.type AS vehicle_type,
        v.capacity_kg AS capacity
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.id = ?
    `,
      [req.params.id],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy tài xế" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm tài xế mới vào hệ thống, kiểm tra trùng email trước khi tạo
export const createDriver = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const [exist] = await db.query("SELECT id FROM drivers WHERE email = ?", [
      email,
    ]);
    if (exist.length > 0)
      return res.status(400).json({ message: "Email đã tồn tại" });

    await db.query(
      "INSERT INTO drivers (name, email, phone, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, phone, status || "available"],
    );
    res.json({ message: "Đã thêm tài xế mới" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm tài xế" });
  }
};

// Cập nhật thông tin cơ bản của tài xế (tên, email, SĐT, trạng thái)
export const updateDriver = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    await db.query(
      "UPDATE drivers SET name=?, email=?, phone=?, status=?, updated_at=NOW() WHERE id=?",
      [name, email, phone, status, req.params.id],
    );
    res.json({ message: " Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};

// Xóa tài xế và cập nhật trạng thái xe về available (dùng transaction)
export const deleteDriver = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Giải phóng xe nếu tài xế đang sử dụng
    const [driver] = await conn.query(
      "SELECT vehicle_id FROM drivers WHERE id = ?",
      [req.params.id],
    );
    if (driver.length > 0 && driver[0].vehicle_id) {
      await conn.query(
        "UPDATE vehicles SET status = 'available' WHERE id = ?",
        [driver[0].vehicle_id],
      );
    }

    await conn.query("DELETE FROM drivers WHERE id = ?", [req.params.id]);

    await conn.commit();
    res.json({ message: "🗑️ Đã xóa tài xế và cập nhật trạng thái xe" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi khi xóa" });
  } finally {
    conn.release();
  }
};

// Cập nhật trạng thái tài xế — admin chỉ được đổi sang inactive hoặc free
export const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Giới hạn trạng thái admin được phép thay đổi
    if (!["inactive", "free"].includes(status)) {
      return res.status(400).json({
        message:
          "Admin chỉ có thể chuyển trạng thái sang 'Tạm nghỉ' hoặc 'Sẵn sàng'",
      });
    }

    // Chỉ kích hoạt lại tài xế đang ở trạng thái inactive
    if (status === "free") {
      const [[driver]] = await db.query(
        "SELECT status FROM drivers WHERE id = ?",
        [req.params.id],
      );
      if (driver && driver.status !== "inactive") {
        return res.status(400).json({
          message:
            "Chỉ có thể kích hoạt lại tài xế đang ở trạng thái 'Tạm nghỉ'",
        });
      }
    }

    await db.query("UPDATE drivers SET status=? WHERE id=?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Trạng thái đã được cập nhật" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};

// Gán xe cho tài xế, giải phóng xe cũ trước khi gán xe mới (dùng transaction)
export const assignVehicleToDriver = async (req, res) => {
  const { id } = req.params;
  const { vehicle_id } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Giải phóng xe cũ nếu tài xế đang có xe
    const [current] = await conn.query(
      "SELECT vehicle_id FROM drivers WHERE id = ?",
      [id],
    );
    if (current.length > 0 && current[0].vehicle_id) {
      await conn.query(
        "UPDATE vehicles SET status = 'available' WHERE id = ?",
        [current[0].vehicle_id],
      );
    }

    // Liên kết xe mới với tài xế
    await conn.query("UPDATE drivers SET vehicle_id = ? WHERE id = ?", [
      vehicle_id,
      id,
    ]);

    // Đánh dấu xe mới là đang sử dụng
    await conn.query("UPDATE vehicles SET status = 'busy' WHERE id = ?", [
      vehicle_id,
    ]);

    await conn.commit();
    res.json({ message: "🚗 Đã gán xe thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi khi gán xe" });
  } finally {
    conn.release();
  }
};

// Lấy danh sách tất cả hồ sơ đăng ký tài xế, sắp xếp mới nhất trước
export const getDriverApplications = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM driver_applications ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách hồ sơ" });
  }
};

// Duyệt hồ sơ tài xế: tạo bản ghi driver nếu email chưa tồn tại (dùng transaction)
export const approveApplication = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Lấy thông tin hồ sơ cần duyệt
    const [apps] = await conn.query(
      "SELECT * FROM driver_applications WHERE id = ?",
      [id],
    );
    if (apps.length === 0)
      return res.status(404).json({ message: "Hồ sơ không tồn tại" });
    const app = apps[0];

    // Nếu email đã tồn tại thì chỉ cập nhật trạng thái hồ sơ
    const [exist] = await conn.query("SELECT id FROM drivers WHERE email = ?", [
      app.email,
    ]);
    if (exist.length > 0) {
      await conn.query(
        "UPDATE driver_applications SET status = 'approved' WHERE id = ?",
        [id],
      );
      await conn.commit();
      return res.json({
        message: "Email tài xế đã tồn tại. Đã cập nhật trạng thái hồ sơ.",
      });
    }

    // Tạo tài khoản tài xế mới
    await conn.query(
      "INSERT INTO drivers (name, email, phone, status, created_at) VALUES (?, ?, ?, 'available', NOW())",
      [app.name, app.email, app.phone],
    );

    // Cập nhật trạng thái hồ sơ thành approved
    await conn.query(
      "UPDATE driver_applications SET status = 'approved' WHERE id = ?",
      [id],
    );

    await conn.commit();
    res.json({ message: "Đã duyệt hồ sơ và tạo tài khoản tài xế" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi khi duyệt hồ sơ" });
  } finally {
    conn.release();
  }
};

// Từ chối hồ sơ đăng ký tài xế, cập nhật status thành rejected
export const rejectApplication = async (req, res) => {
  try {
    await db.query(
      "UPDATE driver_applications SET status = 'rejected' WHERE id = ?",
      [req.params.id],
    );
    res.json({ message: "❌ Đã từ chối hồ sơ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi từ chối" });
  }
};
