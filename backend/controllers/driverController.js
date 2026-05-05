import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { sendNotificationToCustomer } from "../server.js";

// Lấy dữ liệu dashboard tài xế
export const getDriverDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const [driverRecords] = await db.query(
      "SELECT id, name, latitude, longitude FROM drivers WHERE user_id = ?",
      [id],
    );

    const driverIds =
      driverRecords.length > 0 ? driverRecords.map((d) => d.id) : [id];

    const placeholders = driverIds.map(() => "?").join(",");

    const [rows] = await db.query(
      `
      SELECT 
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END) AS completed,
        COUNT(CASE WHEN s.status = 'delivering' THEN 1 END) AS delivering,
        COUNT(CASE WHEN s.status = 'picking' THEN 1 END) AS picking,
        COUNT(CASE WHEN s.status = 'assigned' THEN 1 END) AS assigned
      FROM shipments s
      JOIN assignments a ON s.id = a.shipment_id
      WHERE a.driver_id IN (${placeholders})
      `,
      driverIds,
    );

    const stats = rows[0] || {
      completed: 0,
      delivering: 0,
      picking: 0,
      assigned: 0,
    };

    const [recent] = await db.query(
      `
      SELECT 
        s.id, 
        s.tracking_code, 
        s.receiver_name, 
        s.status, 
        s.service_type,
        s.updated_at 
      FROM shipments s
      JOIN assignments a ON s.id = a.shipment_id
      WHERE a.driver_id IN (${placeholders})
      ORDER BY 
        CASE WHEN s.service_type = 'fast' AND s.status NOT IN ('completed','failed') THEN 0 ELSE 1 END,
        s.updated_at DESC
      LIMIT 5
      `,
      driverIds,
    );

    const driverInfo = driverRecords[0] || null;

    res.json({
      completed: stats.completed,
      delivering: stats.delivering,
      picking: stats.picking,
      assigned: stats.assigned,
      recentShipments: recent,
      latitude: driverInfo?.latitude || null,
      longitude: driverInfo?.longitude || null,
      driverName: driverInfo?.name || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi khi lấy dashboard" });
  }
};

// Lấy đơn hàng được phân công cho tài xế
export const getDriverAssignments = async (req, res) => {
  try {
    const { id } = req.params;

    const [driverRecords] = await db.query(
      "SELECT id FROM drivers WHERE user_id = ?",
      [id],
    );

    const driverIds =
      driverRecords.length > 0 ? driverRecords.map((d) => d.id) : [id];

    const placeholders = driverIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `
      SELECT 
        s.id AS shipment_id,
        s.tracking_code,
        s.delivery_address,
        s.pickup_address,
        s.receiver_name,
        s.receiver_phone,
        s.service_type,
        s.cod_amount,
        s.status,
        a.status AS assignment_status,
        a.assigned_at,
        a.driver_id
      FROM assignments a
      JOIN shipments s ON s.id = a.shipment_id
      WHERE a.driver_id IN (${placeholders})
        AND a.status IN ('assigned', 'picking', 'delivering')
      ORDER BY 
        CASE WHEN s.service_type = 'fast' THEN 0 ELSE 1 END,
        a.assigned_at DESC
      `,
      driverIds,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn tài xế" });
  }
};

// Lấy lịch sử giao hàng của tài xế
export const getDriverHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [driverRecords] = await db.query(
      "SELECT id FROM drivers WHERE user_id = ?",
      [id],
    );
    const driverIds =
      driverRecords.length > 0 ? driverRecords.map((d) => d.id) : [id];

    const placeholders = driverIds.map(() => "?").join(",");

    const [rows] = await db.query(
      `
      SELECT 
        s.id AS shipment_id,
        s.tracking_code,
        s.delivery_address,
        s.receiver_name,
        s.receiver_phone,
        s.service_type,
        s.status,
        s.failure_note,
        s.updated_at AS completed_at
      FROM assignments a
      JOIN shipments s ON s.id = a.shipment_id
      WHERE a.driver_id IN (${placeholders})
        AND a.status IN ('completed', 'failed')
      ORDER BY s.updated_at DESC
      `,
      driverIds,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử giao hàng" });
  }
};

// Tài xế cập nhật trạng thái giao hàng (picking/delivering/completed/failed)
export const updateDriverShipmentStatus = async (req, res) => {
  try {
    const { shipment_id } = req.params;
    const { status, note } = req.body;

    if (status === "failed" && note) {
      await db.query(
        "UPDATE shipments SET status = ?, failure_note = ?, updated_at = NOW() WHERE id = ?",
        [status, note, shipment_id],
      );
    } else {
      await db.query(
        "UPDATE shipments SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, shipment_id],
      );
    }

    await db.query("UPDATE assignments SET status = ? WHERE shipment_id = ?", [
      status,
      shipment_id,
    ]);

    try {
      const [shipment] = await db.query(
        "SELECT customer_id, tracking_code FROM shipments WHERE id = ?",
        [shipment_id],
      );
      if (shipment.length > 0 && shipment[0].customer_id) {
        const { customer_id, tracking_code } = shipment[0];

        let msg = `Đơn hàng #${tracking_code} đã được cập nhật trạng thái mới.`;
        if (status === "picking")
          msg = `Tài xế đang trên đường đến lấy đơn hàng #${tracking_code}.`;
        else if (status === "delivering")
          msg = `Đơn hàng #${tracking_code} đang được giao đến bạn.`;
        else if (status === "completed")
          msg = `Đơn hàng #${tracking_code} đã được giao thành công!`;
        else if (status === "failed")
          msg = `❌ Đơn hàng #${tracking_code} giao thất bại${note ? `: ${note}` : "."}.`;

        await sendNotificationToCustomer(customer_id, shipment_id, msg);
      }
    } catch (e) {}

    res.json({ message: " Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái" });
  }
};

// Lấy hồ sơ chi tiết tài xế kèm thông tin xe theo user_id hoặc driver_id
export const getDriverProfile = async (req, res) => {
  try {
    const { id } = req.params;

    let [rows] = await db.query(
      `
      SELECT 
        d.id, 
        d.name, 
        d.email, 
        d.phone, 
        d.status,
        d.vehicle_type,
        d.license_no,
        d.region_id,
        v.plate_no,
        v.type,
        v.capacity_kg,
        v.status AS vehicle_status
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.user_id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      [rows] = await db.query(
        `
        SELECT 
          d.id, 
          d.name, 
          d.email, 
          d.phone, 
          d.status,
          d.vehicle_type,
          d.license_no,
          d.region_id,
          v.plate_no,
          v.type,
          v.capacity_kg,
          v.status AS vehicle_status
        FROM drivers d
        LEFT JOIN vehicles v ON d.vehicle_id = v.id
        WHERE d.id = ?
        `,
        [id],
      );
    }

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy tài xế" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin tài xế" });
  }
};

// Đổi mật khẩu tài xế (qua bảng users)
export const changeDriverPassword = async (req, res) => {
  try {
    const { id } = req.params; // user_id
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // Tìm user qua user_id hoặc trực tiếp qua drivers
    let userId = id;
    const [[driver]] = await db.query(
      "SELECT user_id FROM drivers WHERE user_id = ? OR id = ?",
      [id, id],
    );
    if (driver && driver.user_id) {
      userId = driver.user_id;
    }

    const [[user]] = await db.query(
      "SELECT id, password FROM users WHERE id = ?",
      [userId],
    );
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
  }
};

// Bật/tắt trạng thái trực tuyến tài xế
export const toggleDriverStatus = async (req, res) => {
  try {
    const { id } = req.params; // user_id
    const { status } = req.body; // 'available' hoặc 'inactive'

    if (!["available", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Tìm driver qua user_id
    const [[driver]] = await db.query(
      "SELECT id, status FROM drivers WHERE user_id = ?",
      [id],
    );

    if (!driver) {
      // Thử tìm trực tiếp
      const [[d2]] = await db.query(
        "SELECT id, status FROM drivers WHERE id = ?",
        [id],
      );
      if (!d2)
        return res.status(404).json({ message: "Không tìm thấy tài xế" });

      // Không cho phép chuyển khi đang delivering
      if (d2.status === "delivering") {
        return res.status(400).json({ message: "Không thể thay đổi khi đang giao hàng" });
      }

      await db.query("UPDATE drivers SET status = ? WHERE id = ?", [status, d2.id]);
    } else {
      if (driver.status === "delivering") {
        return res.status(400).json({ message: "Không thể thay đổi khi đang giao hàng" });
      }
      await db.query("UPDATE drivers SET status = ? WHERE user_id = ?", [status, id]);
    }

    res.json({
      message: status === "available" ? "Đã bật trực tuyến" : "Đã chuyển sang nghỉ",
      status,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái" });
  }
};

// Cập nhật thông tin cá nhân tài xế
export const updateDriverProfile = async (req, res) => {
  try {
    const { id } = req.params; // user_id
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Họ tên không được để trống" });
    }

    // Cập nhật bảng drivers
    await db.query(
      "UPDATE drivers SET name = ?, phone = ? WHERE user_id = ?",
      [name.trim(), phone || null, id],
    );

    // Cập nhật bảng users nếu có user_id
    await db.query(
      "UPDATE users SET name = ?, phone = ? WHERE id = ?",
      [name.trim(), phone || null, id],
    );

    // Cập nhật localStorage username
    res.json({ message: "Cập nhật thông tin thành công", name: name.trim() });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin" });
  }
};

// Lấy thống kê đánh giá tài xế
export const getDriverRatingStats = async (req, res) => {
  try {
    const { id } = req.params; // user_id

    // Tìm driver_id từ user_id
    const [driverRecords] = await db.query(
      "SELECT id FROM drivers WHERE user_id = ?",
      [id],
    );
    const driverIds =
      driverRecords.length > 0 ? driverRecords.map((d) => d.id) : [id];
    const placeholders = driverIds.map(() => "?").join(",");

    // Lấy tổng đơn & đơn hoàn thành
    const [[orderStats]] = await db.query(
      `SELECT 
        COUNT(*) AS total_orders,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_orders,
        COUNT(CASE WHEN a.status = 'failed' THEN 1 END) AS failed_orders
      FROM assignments a
      WHERE a.driver_id IN (${placeholders})`,
      driverIds,
    );

    // Lấy rating trung bình & phân bổ từ feedbacks
    const [ratingRows] = await db.query(
      `SELECT 
        f.rating,
        COUNT(*) AS count
      FROM feedbacks f
      JOIN shipments s ON f.shipment_id = s.id
      JOIN assignments a ON a.shipment_id = s.id
      WHERE a.driver_id IN (${placeholders})
      GROUP BY f.rating
      ORDER BY f.rating DESC`,
      driverIds,
    );

    // Tính rating trung bình
    let totalRatings = 0;
    let sumRating = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    ratingRows.forEach((r) => {
      totalRatings += r.count;
      sumRating += r.rating * r.count;
      ratingDistribution[r.rating] = r.count;
    });

    const avgRating = totalRatings > 0 ? (sumRating / totalRatings) : 0;

    // Lấy feedback gần đây
    const [recentFeedbacks] = await db.query(
      `SELECT 
        f.rating, f.content, f.created_at,
        u.name AS customer_name,
        s.tracking_code
      FROM feedbacks f
      JOIN shipments s ON f.shipment_id = s.id
      JOIN assignments a ON a.shipment_id = s.id
      LEFT JOIN users u ON f.customer_id = u.id
      WHERE a.driver_id IN (${placeholders})
      ORDER BY f.created_at DESC
      LIMIT 5`,
      driverIds,
    );

    const successRate = orderStats.total_orders > 0
      ? ((orderStats.completed_orders / orderStats.total_orders) * 100).toFixed(1)
      : 0;

    res.json({
      total_orders: orderStats.total_orders || 0,
      completed_orders: orderStats.completed_orders || 0,
      failed_orders: orderStats.failed_orders || 0,
      success_rate: parseFloat(successRate),
      avg_rating: parseFloat(avgRating.toFixed(1)),
      total_ratings: totalRatings,
      rating_distribution: ratingDistribution,
      recent_feedbacks: recentFeedbacks,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thống kê đánh giá" });
  }
};

// Gán xe cho tài xế theo driver_id (admin hoặc nội bộ)
export const updateDriverVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id } = req.body;

    const [[vehicle]] = await db.query("SELECT * FROM vehicles WHERE id = ?", [
      vehicle_id,
    ]);
    if (!vehicle) return res.status(404).json({ message: "Xe không tồn tại" });

    await db.query("UPDATE drivers SET vehicle_id = ? WHERE id = ?", [
      vehicle_id,
      id,
    ]);

    res.json({ message: " Cập nhật xe cho tài xế thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật xe cho tài xế" });
  }
};

// Lấy hồ sơ tài xế theo user_id — dùng để hiển thị trang cá nhân
export const getDriverProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        d.id,
        d.user_id,
        d.name,
        d.email,
        d.phone,
        d.status,
        v.plate_no,
        v.type,
        v.capacity_kg,
        v.status AS vehicle_status
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.user_id = ?
      `,
      [userId],
    );

    if (!rows.length)
      return res.status(404).json({ message: "Không tìm thấy tài xế" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin tài xế" });
  }
};

// Cập nhật tọa độ GPS hiện tại của tài xế theo user_id
export const updateDriverLocation = async (req, res) => {
  try {
    const { id } = req.params; // user_id
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Vui lòng cung cấp tọa độ." });
    }

    await db.query(
      "UPDATE drivers SET latitude = ?, longitude = ? WHERE user_id = ?",
      [latitude, longitude, id]
    );

    res.json({ message: "Đã cập nhật vị trí." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi cập nhật vị trí." });
  }
};
