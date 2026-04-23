import db from "../config/db.js";
import {
  sendNotificationToDriver,
  sendNotificationToCustomer,
} from "../server.js";

// =======================================================
// 1. LẤY ĐƠN CHƯA PHÂN CÔNG (THEO VÙNG)
// =======================================================
export const getUnassignedShipments = async (req, res) => {
  try {
    const { region_id } = req.user; // Lấy vùng của điều phối viên

    let sql = `
      SELECT s.*
      FROM shipments s
      LEFT JOIN assignments a 
        ON a.shipment_id = s.id 
        AND a.status IN ('assigned','picking','delivering')
      WHERE a.id IS NULL 
        AND s.status IN ('pending','assigned','picking','delivering')
    `;

    const params = [];

    // Nếu có region_id, chỉ lấy đơn thuộc vùng đó
    if (region_id) {
      sql += " AND s.region_id = ?";
      params.push(region_id);
    }

    sql += " ORDER BY s.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ getUnassignedShipments error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đơn chưa phân công" });
  }
};

// =======================================================
// 2. LẤY DANH SÁCH TÀI XẾ KHẢ DỤNG (THEO VÙNG)
// =======================================================
export const getAvailableDrivers = async (req, res) => {
  try {
    const { region_id } = req.user; // Lấy vùng của điều phối viên

    let sql = `
      SELECT id, name, email, phone, status, vehicle_type, region_id
      FROM drivers
      WHERE status <> 'inactive'
    `;

    const params = [];

    // CHỈ LẤY TÀI XẾ CÙNG VÙNG VỚI ĐIỀU PHỐI VIÊN
    if (region_id) {
      sql += " AND region_id = ?";
      params.push(region_id);
    }

    sql += " ORDER BY name ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAvailableDrivers error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tài xế" });
  }
};

// =======================================================
// 3. PHÂN CÔNG TÀI XẾ (CÓ CHECK VÙNG CHO AN TOÀN)
// =======================================================
export const assignShipment = async (req, res) => {
  try {
    const { shipment_id, driver_id } = req.body;
    const { region_id } = req.user;

    if (!shipment_id || !driver_id)
      return res
        .status(400)
        .json({ message: "Thiếu shipment_id hoặc driver_id" });

    // (Tùy chọn) Kiểm tra xem Tài xế có thuộc vùng quản lý không
    if (region_id) {
      const [driverCheck] = await db.query(
        "SELECT id FROM drivers WHERE id = ? AND region_id = ?",
        [driver_id, region_id]
      );
      if (driverCheck.length === 0) {
        return res
          .status(403)
          .json({ message: "Tài xế không thuộc khu vực quản lý của bạn!" });
      }
    }

    await db.query(
      `INSERT INTO assignments (driver_id, shipment_id, status, assigned_at)
       VALUES (?, ?, 'assigned', NOW())`,
      [driver_id, shipment_id]
    );

    await db.query(
      `UPDATE shipments SET status='assigned', updated_at=NOW() WHERE id=?`,
      [shipment_id]
    );

    // Khi phân công, tài xế chuyển sang bận (delivering hoặc busy)
    await db.query(`UPDATE drivers SET status='delivering' WHERE id=?`, [
      driver_id,
    ]);

    // Gửi thông báo cho tài xế
    try {
      await sendNotificationToDriver(
        driver_id,
        shipment_id,
        `Bạn được phân công đơn #${shipment_id} từ điều phối viên`
      );
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo driver:", e);
    }

    // Gửi thông báo cho khách hàng
    try {
      const [[shipment]] = await db.query(
        "SELECT customer_id, tracking_code FROM shipments WHERE id = ?",
        [shipment_id]
      );
      if (shipment && shipment.customer_id) {
        await sendNotificationToCustomer(
          shipment.customer_id,
          shipment_id,
          `🚚 Đơn hàng #${shipment.tracking_code} đã được phân công cho tài xế và đang chờ lấy hàng!`
        );
      }
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo customer:", e.message);
    }

    res.json({ message: "✅ Đã phân công tài xế cho đơn hàng" });
  } catch (err) {
    console.error("❌ assignShipment error:", err);
    res.status(500).json({ message: "Lỗi server khi phân công đơn" });
  }
};

// =======================================================
// 4. LẤY DANH SÁCH ĐANG PHÂN CÔNG (THEO VÙNG)
// =======================================================
export const getAssignments = async (req, res) => {
  try {
    const { region_id } = req.user;
    const activeOnly = String(req.query.activeOnly || "false") === "true";

    let sql = `
      SELECT 
        a.id,
        a.shipment_id,
        a.driver_id,
        a.status AS assignment_status,
        a.assigned_at,
        s.tracking_code,
        s.status AS shipment_status,
        s.current_location,
        s.pickup_address,
        s.delivery_address,
        s.region_id,
        d.name AS driver_name,
        d.phone AS driver_phone,
        d.vehicle_type
      FROM assignments a
      JOIN shipments s ON s.id = a.shipment_id
      JOIN drivers d ON d.id = a.driver_id
      WHERE 1=1
    `;

    const params = [];

    // Lọc theo trạng thái đang chạy
    if (activeOnly) {
      sql += ` AND a.status IN ('assigned','picking','delivering')`;
    }

    // Lọc theo vùng
    if (region_id) {
      sql += ` AND s.region_id = ?`;
      params.push(region_id);
    }

    sql += ` ORDER BY a.assigned_at DESC`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAssignments error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách phân công" });
  }
};

// =======================================================
// 5. CẬP NHẬT TRẠNG THÁI PHÂN CÔNG (GIỮ NGUYÊN)
// =======================================================
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, current_location } = req.body;

    if (!status) return res.status(400).json({ message: "Thiếu status" });

    await db.query(`UPDATE assignments SET status=? WHERE id=?`, [status, id]);

    const [[row]] = await db.query(
      `SELECT shipment_id, driver_id FROM assignments WHERE id=?`,
      [id]
    );
    if (!row)
      return res.status(404).json({ message: "Không tìm thấy assignment" });

    let shipmentStatus;
    switch (status) {
      case "assigned":
        shipmentStatus = "assigned";
        break;
      case "picking":
        shipmentStatus = "picking";
        break;
      case "delivering":
        shipmentStatus = "delivering";
        break;
      case "completed":
        shipmentStatus = "delivered";
        break;
      case "failed":
        shipmentStatus = "failed";
        break;
    }

    // Cập nhật shipment
    const shipmentQuery = current_location
      ? `UPDATE shipments SET status=?, current_location=?, updated_at=NOW() WHERE id=?`
      : `UPDATE shipments SET status=?, updated_at=NOW() WHERE id=?`;

    await db.query(
      shipmentQuery,
      current_location
        ? [shipmentStatus, current_location, row.shipment_id]
        : [shipmentStatus, row.shipment_id]
    );

    // Nếu hoàn tất hoặc thất bại -> tài xế rảnh
    if (status === "completed" || status === "failed") {
      // Có thể set về 'free' hoặc 'active' tùy enum của bạn
      await db.query(`UPDATE drivers SET status='free' WHERE id=?`, [
        row.driver_id,
      ]);
    }

    // Gửi thông báo trạng thái cho khách hàng
    try {
      const [[shipment]] = await db.query(
        "SELECT customer_id, tracking_code FROM shipments WHERE id = ?",
        [row.shipment_id]
      );
      if (shipment && shipment.customer_id) {
        let msg = `Đơn hàng #${shipment.tracking_code} đã được cập nhật trạng thái mới.`;
        if (shipmentStatus === 'picking') msg = `Tài xế đang trên đường đến lấy đơn hàng #${shipment.tracking_code}.`;
        else if (shipmentStatus === 'delivering') msg = `Đơn hàng #${shipment.tracking_code} đang được giao đến bạn.`;
        else if (shipmentStatus === 'delivered') msg = `✅ Đơn hàng #${shipment.tracking_code} đã được giao thành công!`;
        else if (shipmentStatus === 'failed') msg = `❌ Đơn hàng #${shipment.tracking_code} giao/lấy thất bại.`;

        await sendNotificationToCustomer(shipment.customer_id, row.shipment_id, msg);
      }
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo customer (updateAssignmentStatus):", e.message);
    }

    res.json({ message: "✅ Đã cập nhật trạng thái và đồng bộ tài xế" });
  } catch (err) {
    console.error("❌ updateAssignmentStatus error:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};

// =======================================================
// 6. DASHBOARD (CŨNG PHẢI LỌC THEO VÙNG)
// =======================================================
export const getDispatcherDashboard = async (req, res) => {
  try {
    const { region_id } = req.user;
    let regionConditionShipment = "";
    let regionConditionDriver = "";
    let regionConditionTopDriver = "";
    const params = [];

    if (region_id) {
      regionConditionShipment = "WHERE region_id = ?";
      regionConditionDriver = "WHERE region_id = ?";
      regionConditionTopDriver = "WHERE d.region_id = ?";
    }

    // 1. Đơn hàng theo trạng thái (có lọc vùng)
    const [shipmentStats] = await db.query(
      `
      SELECT LOWER(TRIM(status)) AS status, COUNT(*) AS count
      FROM shipments
      ${regionConditionShipment}
      GROUP BY LOWER(TRIM(status))
    `,
      region_id ? [region_id] : []
    );

    // 2. Tài xế theo trạng thái (có lọc vùng)
    const [driverStats] = await db.query(
      `
      SELECT LOWER(TRIM(status)) AS status, COUNT(*) AS count
      FROM drivers
      ${regionConditionDriver}
      GROUP BY LOWER(TRIM(status))
    `,
      region_id ? [region_id] : []
    );

    // 3. Top tài xế (có lọc vùng)
    const [topDrivers] = await db.query(
      `
      SELECT d.name, COUNT(a.id) AS deliveries
      FROM drivers d
      LEFT JOIN assignments a ON d.id = a.driver_id
      ${regionConditionTopDriver}
      GROUP BY d.id, d.name
      ORDER BY deliveries DESC
      LIMIT 5
    `,
      region_id ? [region_id] : []
    );

    // 4. Doanh thu theo tháng (Shipping Fee của các đơn giao thành công trong năm nay)
    // Chú ý: Lấy các đơn 'delivered'
    const [revenueData] = await db.query(
      `
      SELECT MONTH(created_at) AS monthNo, SUM(shipping_fee) AS total
      FROM shipments
      WHERE YEAR(created_at) = YEAR(CURDATE()) 
        AND status = 'delivered'
        ${regionConditionShipment ? "AND " + regionConditionShipment.replace("WHERE ", "") : ""}
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `,
      region_id ? [region_id] : []
    );

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenue = monthNames.map((name, index) => ({ month: name, total: 0 }));

    revenueData.forEach((row) => {
      // row.monthNo is 1-12
      if (row.monthNo >= 1 && row.monthNo <= 12) {
        revenue[row.monthNo - 1].total = Number(row.total || 0);
      }
    });

    res.json({
      shipments: shipmentStats,
      drivers: driverStats,
      topDrivers,
      revenue, // Trả về doanh thu để vẽ BarChart
    });
  } catch (err) {
    console.error("❌ Lỗi dispatcher dashboard:", err);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu dashboard" });
  }
};

// =======================================================
// CÁC HÀM KHÁC (reassignDriver, getShipmentDetail) giữ nguyên
// Hoặc thêm check region_id nếu cần bảo mật cao hơn
// =======================================================
export const reassignDriver = async (req, res) => {
  // ... code cũ ...
  // Nên thêm logic check xem driver mới có thuộc region không
  try {
    const { id } = req.params;
    const { driver_id } = req.body;

    await db.query(`UPDATE assignments SET driver_id=? WHERE id=?`, [
      driver_id,
      id,
    ]);
    res.json({ message: "✅ Đã đổi tài xế" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi" });
  }
};

export const getShipmentDetail = async (req, res) => {
  // ... code cũ ...
  // Chỉ hiển thị
  try {
    const { id } = req.params;
    const [[shipment]] = await db.query(
      `SELECT s.*, d.name AS driver_name, d.latitude, d.longitude
           FROM shipments s
           LEFT JOIN assignments a ON a.shipment_id = s.id
           LEFT JOIN drivers d ON d.id = a.driver_id
           WHERE s.id = ?`,
      [id]
    );
    res.json(shipment || {});
  } catch (err) {
    res.status(500).json({ message: "Lỗi" });
  }
};
