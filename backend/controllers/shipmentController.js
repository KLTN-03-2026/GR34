import pool from "../config/db.js"; // Sử dụng pool thay vì db
import {
  sendNotificationToDriver,
  sendNotificationToDispatcher,
  sendNotificationToCustomer,
} from "../server.js";

// ==========================
// Lấy tất cả đơn hàng (CÓ PHÂN QUYỀN VÙNG)
// ==========================
export const getAllShipments = async (req, res) => {
  try {
    // Lấy thông tin User từ Middleware xác thực (req.user)
    const currentUser = req.user;
    const userRegion = currentUser?.region_id; // 'DN', 'HCM' hoặc NULL (Admin tổng)

    let sql = "SELECT * FROM shipments";
    let params = [];

    // Nếu User có vùng quản lý -> Chỉ lấy đơn thuộc vùng đó
    if (userRegion) {
      sql += " WHERE region_id = ?";
      params.push(userRegion);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ error: "Không thể lấy danh sách đơn hàng" });
  }
};

// ==========================
// Lấy đơn theo ID
// ==========================
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM shipments WHERE id = ?", [
      id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ error: "Không thể lấy chi tiết đơn hàng" });
  }
};

// ==========================
// Tạo đơn hàng
// ==========================
// 1. Hàm phụ trợ: Phân tích địa chỉ (Thêm các tỉnh lân cận nếu cần)
// ==========================================
const getRegionInfoFromAddress = (address) => {
  if (!address) return { prefix: "SP", region_id: "OTHER" };

  const addrLower = address.toLowerCase();

  // --- MIỀN NAM ---
  if (
    addrLower.includes("hồ chí minh") ||
    addrLower.includes("hcm") ||
    addrLower.includes("sài gòn") ||
    addrLower.includes("bình dương") ||
    addrLower.includes("đồng nai") ||
    addrLower.includes("long an")
  ) {
    return { prefix: "HCM", region_id: "HCM" };
  }

  // --- MIỀN TRUNG ---
  if (
    addrLower.includes("đà nẵng") ||
    addrLower.includes("da nang") ||
    addrLower.includes("quảng nam") ||
    addrLower.includes("huế")
  ) {
    return { prefix: "DN", region_id: "DN" };
  }

  // --- MIỀN BẮC ---
  if (
    addrLower.includes("hà nội") ||
    addrLower.includes("ha noi") ||
    addrLower.includes("hưng yên") ||
    addrLower.includes("bắc ninh")
  ) {
    return { prefix: "HN", region_id: "HN" };
  }

  // Mặc định cho các tỉnh khác (Vũng Tàu, Cần Thơ, v.v.)
  return { prefix: "SP", region_id: "OTHER" };
};

// ==========================================
// 2. Cập nhật Controller
// ==========================================
export const createShipment = async (req, res) => {
  try {
    const {
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      pickup_address,
      pickup_lat,
      pickup_lng, // <-- CHÚNG TA SẼ DÙNG CÁI NÀY
      delivery_address,
      delivery_lat,
      delivery_lng,
      item_name,
      quantity,
      weight_kg,
      cod_amount,
      shipping_fee,
      payment_method,
      pickup_option,
      service_type,
      status,
      customer_id,
    } = req.body;

    // Dùng pickup_address (địa chỉ lấy) để xác định đơn thuộc kho nào
    const addressToCheck = pickup_address || delivery_address; // Ưu tiên nơi lấy, nếu không có thì lấy nơi giao
    const regionInfo = getRegionInfoFromAddress(addressToCheck);

    // Tạo mã: HCM-123456
    const randomSuffix = Date.now().toString().slice(-6);
    const tracking_code = `${regionInfo.prefix}-${randomSuffix}`;
    const finalRegionId = regionInfo.region_id;
    // -----------------------

    const q = `
      INSERT INTO shipments 
      (customer_id, tracking_code, sender_name, sender_phone, pickup_address, pickup_lat, pickup_lng, 
       receiver_name, receiver_phone, delivery_address, delivery_lat, delivery_lng, 
       item_name, quantity, weight_kg, cod_amount, shipping_fee, 
       payment_method, pickup_option, service_type, status, region_id, created_at) 
      VALUES (?)
    `;

    const values = [
      customer_id,
      tracking_code,
      sender_name,
      sender_phone,
      pickup_address,
      pickup_lat || null,
      pickup_lng || null,
      receiver_name,
      receiver_phone,
      delivery_address,
      delivery_lat || null,
      delivery_lng || null,
      item_name,
      quantity,
      weight_kg,
      cod_amount,
      shipping_fee,
      payment_method,
      pickup_option,
      service_type,
      status || "pending",
      finalRegionId,
      new Date(),
    ];

    const [result] = await pool.query(q, [values]);

    // Gửi thông báo
    try {
      await sendNotificationToDispatcher(
        1,
        result.insertId,
        `🆕 Đơn hàng mới tại ${regionInfo.prefix}: #${tracking_code}`,
      );

      // Thông báo cho khách hàng
      if (customer_id) {
        await sendNotificationToCustomer(
          customer_id,
          result.insertId,
          `🎉 Đơn hàng #${tracking_code} của bạn đã được tạo thành công!`,
        );
      }
    } catch (notifyErr) {
      console.warn("⚠️ Không gửi được thông báo:", notifyErr.message);
    }

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      id: result.insertId,
      tracking_code: tracking_code,
      region: finalRegionId,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo đơn hàng:", err);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo đơn hàng", details: err.message });
  }
};

// ==========================
// Cập nhật đơn hàng
// ==========================
export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      pickup_address,
      delivery_address,
      weight_kg,
      cod_amount,
      status,
      current_location,
    } = req.body;

    await pool.query(
      `UPDATE shipments SET
        sender_name=?, sender_phone=?, receiver_name=?, receiver_phone=?,
        pickup_address=?, delivery_address=?, weight_kg=?, cod_amount=?,
        status=?, current_location=?, updated_at=NOW()
       WHERE id=?`,
      [
        sender_name,
        sender_phone,
        receiver_name,
        receiver_phone,
        pickup_address,
        delivery_address,
        weight_kg,
        cod_amount,
        status,
        current_location,
        id,
      ],
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật đơn:", err);
    res.status(500).json({ error: "Không thể cập nhật đơn hàng" });
  }
};

// ==========================
// Xóa đơn hàng
// ==========================
export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shipments WHERE id=?", [id]);
    res.json({ message: "Đã xóa đơn hàng" });
  } catch (err) {
    console.error("❌ Lỗi xóa đơn:", err);
    res.status(500).json({ error: "Không thể xóa đơn hàng" });
  }
};

// ==========================
// Phân công tài xế (Đơn lẻ)
// ==========================
export const assignShipment = async (req, res) => {
  try {
    const { driver_id, shipment_id } = req.body;

    // Cập nhật bảng shipments
    await pool.query(
      "UPDATE shipments SET status='assigned', updated_at=NOW() WHERE id=?",
      [shipment_id],
    );

    // Thêm vào bảng assignments
    // Sửa lại cho đúng tên cột DB: status, assigned_at
    await pool.query(
      "INSERT INTO assignments (shipment_id, driver_id, status, assigned_at) VALUES (?, ?, 'assigned', NOW())",
      [shipment_id, driver_id],
    );

    // Gửi thông báo cho tài xế
    try {
      await sendNotificationToDriver(
        driver_id,
        shipment_id,
        `Bạn được phân công đơn #${shipment_id}`,
      );
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo driver");
    }

    // Gửi thông báo cho khách hàng
    try {
      const [[shipment]] = await pool.query(
        "SELECT customer_id, tracking_code FROM shipments WHERE id = ?",
        [shipment_id]
      );
      if (shipment && shipment.customer_id) {
        await sendNotificationToCustomer(
          shipment.customer_id,
          shipment_id,
          `🚚 Đơn hàng #${shipment.tracking_code} đã được phân công cho tài xế và đang chờ đi lấy!`
        );
      }
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo customer:", e.message);
    }

    res.json({ message: "Đã phân công tài xế" });
  } catch (err) {
    console.error("❌ Lỗi phân công:", err);
    res.status(500).json({ error: "Không thể phân công" });
  }
};

// ==========================
// CUSTOMER tracking (login)
// ==========================
export const getShipmentByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const [[shipment]] = await pool.query(
      "SELECT * FROM shipments WHERE tracking_code=?",
      [code],
    );

    if (!shipment)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ==========================
// ✅ GUEST tracking (PUBLIC)
// ==========================
export const getShipmentByCodePublic = async (req, res) => {
  try {
    const { code } = req.params;
    const { last4 } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Thiếu mã vận đơn" });
    }

    const [[shipment]] = await pool.query(
      "SELECT * FROM shipments WHERE tracking_code = ?",
      [code],
    );

    if (!shipment) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Nếu có last4 → xác thực cho khách vãng lai
    if (last4) {
      const phone = shipment.receiver_phone || "";
      if (!phone.endsWith(last4)) {
        return res.status(403).json({ message: "Sai thông tin xác thực" });
      }
    }

    res.json(shipment);
  } catch (err) {
    console.error("❌ Lỗi tra cứu đơn công khai:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ==========================
// PHÂN CÔNG HÀNG LOẠT (BULK ASSIGN) - CÓ CHECK VÙNG
// ==========================
export const assignShipmentsBulk = async (req, res) => {
  const { shipment_ids, driver_id } = req.body;

  if (
    !shipment_ids ||
    !Array.isArray(shipment_ids) ||
    shipment_ids.length === 0 ||
    !driver_id
  ) {
    return res
      .status(400)
      .json({ message: "Dữ liệu không hợp lệ (Thiếu ID đơn hoặc Tài xế)" });
  }

  // --- LOGIC CHECK QUYỀN VÙNG (New) ---
  const currentUser = req.user;

  // Nếu User có vùng (không phải Super Admin) thì kiểm tra
  if (currentUser && currentUser.region_id) {
    try {
      // 1. Kiểm tra tài xế có thuộc vùng này không
      const [driver] = await pool.query(
        "SELECT region_id FROM drivers WHERE id = ?",
        [driver_id],
      );

      if (
        driver.length === 0 ||
        driver[0].region_id !== currentUser.region_id
      ) {
        return res
          .status(403)
          .json({ message: "Tài xế không thuộc khu vực quản lý của bạn!" });
      }

      // 2. Kiểm tra danh sách đơn hàng có đơn nào "lạc loài" không
      // Đếm số lượng đơn trong list gửi lên mà region_id KHÁC vùng của user
      const [invalidShipments] = await pool.query(
        "SELECT count(*) as count FROM shipments WHERE id IN (?) AND region_id != ?",
        [shipment_ids, currentUser.region_id],
      );

      if (invalidShipments[0].count > 0) {
        return res.status(403).json({
          message: "Có đơn hàng không thuộc khu vực quản lý của bạn!",
        });
      }
    } catch (error) {
      console.error("Lỗi kiểm tra vùng:", error);
      return res
        .status(500)
        .json({ message: "Lỗi kiểm tra quyền hạn khu vực" });
    }
  }
  // ------------------------------------

  // Sử dụng Transaction để đảm bảo an toàn dữ liệu
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const values = shipment_ids.map((id) => [
      id,
      driver_id,
      "assigned",
      new Date(),
    ]);
    await connection.query(
      `INSERT INTO assignments (shipment_id, driver_id, status, assigned_at) VALUES ?`,
      [values],
    );

    await connection.query(
      `UPDATE shipments SET status = 'assigned', updated_at = NOW() WHERE id IN (?)`,
      [shipment_ids],
    );

    await connection.commit();

    // Gửi thông báo cho tài xế
    sendNotificationToDriver(
      driver_id,
      null,
      `Bạn vừa được phân công ${shipment_ids.length} đơn hàng mới!`,
    ).catch(() => {});

    // Gửi thông báo cho từng khách hàng
    try {
      const [shipments] = await connection.query(
        "SELECT id, customer_id, tracking_code FROM shipments WHERE id IN (?)",
        [shipment_ids]
      );

      for (const ship of shipments) {
        if (ship.customer_id) {
          await sendNotificationToCustomer(
            ship.customer_id,
            ship.id,
            `🚚 Đơn hàng #${ship.tracking_code} đã được phân công cho tài xế và đang chờ đi lấy!`
          );
        }
      }
    } catch (e) {
      console.warn("⚠️ Lỗi gửi thông báo customer (bulk):", e.message);
    }

    res.json({
      message: `Đã phân công thành công ${shipment_ids.length} đơn hàng!`,
    });
  } catch (err) {
    await connection.rollback();
    console.error("❌ Lỗi Bulk Assign:", err);
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi phân công: " + err.message });
  } finally {
    connection.release(); // Trả kết nối về pool
  }
};
