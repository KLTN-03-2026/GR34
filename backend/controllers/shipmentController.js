import pool from "../config/db.js";
import {
  sendNotificationToDriver,
  sendNotificationToDispatcher,
  sendNotificationToCustomer,
} from "../server.js";
import {
  getRegionIdFromAddress,
  getPrefixFromRegionId,
  getCodeFromRegionId,
} from "../utils/regionHelper.js";


// Lấy danh sách tất cả đơn hàng
export const getAllShipments = async (req, res) => {
  try {
    const currentUser = req.user;
    const userRegionId = currentUser?.region_id;

    let sql = `
      SELECT
        s.*,
        r.code as region_code,
        r.name as region_name,
        r.prefix as region_prefix,
        (
          SELECT d.name FROM assignments a
          JOIN drivers d ON d.id = a.driver_id
          WHERE a.shipment_id = s.id
          ORDER BY a.assigned_at DESC LIMIT 1
        ) AS driver_name,
        (
          SELECT d.phone FROM assignments a
          JOIN drivers d ON d.id = a.driver_id
          WHERE a.shipment_id = s.id
          ORDER BY a.assigned_at DESC LIMIT 1
        ) AS driver_phone,
        (
          SELECT d.avatar FROM assignments a
          JOIN drivers d ON d.id = a.driver_id
          WHERE a.shipment_id = s.id
          ORDER BY a.assigned_at DESC LIMIT 1
        ) AS driver_avatar
      FROM shipments s
      LEFT JOIN regions r ON s.region_id = r.id
    `;
    let params = [];

    if (userRegionId) {
      sql += " WHERE s.region_id = ?";
      params.push(userRegionId);
    }

    sql += " ORDER BY s.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách đơn hàng" });
  }
};


// Lấy chi tiết đơn hàng theo ID
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*, r.code as region_code, r.name as region_name, r.prefix as region_prefix
       FROM shipments s
       LEFT JOIN regions r ON s.region_id = r.id
       WHERE s.id = ?`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy chi tiết đơn hàng" });
  }
};


// Tạo đơn hàng mới
export const createShipment = async (req, res) => {
  try {
    const {
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      pickup_address,
      pickup_lat,
      pickup_lng,
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

    const addressToCheck = pickup_address || delivery_address;
    const regionId = await getRegionIdFromAddress(addressToCheck);
    const prefix = await getPrefixFromRegionId(regionId);

    const randomSuffix = Date.now().toString().slice(-6);
    const tracking_code = `${prefix}-${randomSuffix}`;

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
      regionId,
      new Date(),
    ];

    const [result] = await pool.query(q, [values]);

    try {
      if ((status || "pending") !== "draft") {
        await sendNotificationToDispatcher(
          1,
          result.insertId,
          `Đơn hàng mới tại ${prefix}: #${tracking_code} — chờ phân công.`,
        );

        if (customer_id) {
          await sendNotificationToCustomer(
            customer_id,
            result.insertId,
            `Đơn hàng #${tracking_code} của bạn đã được tạo thành công! Chúng tôi sẽ sớm liên hệ để lấy hàng.`,
          );
        }
      }
    } catch (notifyErr) {
    }

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      id: result.insertId,
      tracking_code: tracking_code,
      region_id: regionId,
      prefix: prefix,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo đơn hàng", details: err.message });
  }
};


// Cập nhật thông tin đơn hàng theo ID (admin)
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
    res.status(500).json({ error: "Không thể cập nhật đơn hàng" });
  }
};


// Xóa đơn hàng
export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shipments WHERE id=?", [id]);
    res.json({ message: "Đã xóa đơn hàng" });
  } catch (err) {
    res.status(500).json({ error: "Không thể xóa đơn hàng" });
  }
};


// Phân công đơn hàng cho tài xế
export const assignShipment = async (req, res) => {
  try {
    const { driver_id, shipment_id } = req.body;


    await pool.query(
      "UPDATE shipments SET status='assigned', updated_at=NOW() WHERE id=?",
      [shipment_id],
    );


    await pool.query(
      "INSERT INTO assignments (shipment_id, driver_id, status, assigned_at) VALUES (?, ?, 'assigned', NOW())",
      [shipment_id, driver_id],
    );


    try {
      await sendNotificationToDriver(
        driver_id,
        shipment_id,
        `Bạn được phân công đơn #${shipment_id}`,
      );
    } catch (e) {
    }


    try {
      const [[shipment]] = await pool.query(
        "SELECT customer_id, tracking_code FROM shipments WHERE id = ?",
        [shipment_id]
      );
      if (shipment && shipment.customer_id) {
        await sendNotificationToCustomer(
          shipment.customer_id,
          shipment_id,
          `Đơn hàng #${shipment.tracking_code} đã được phân công cho tài xế và đang chờ đi lấy hàng.`
        );
      }
    } catch (e) {
    }

    res.json({ message: "Đã phân công tài xế" });
  } catch (err) {
    res.status(500).json({ error: "Không thể phân công" });
  }
};


// Tìm đơn hàng theo mã tracking code (nội bộ, yêu cầu xác thực)
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


// Tra cứu đơn hàng công khai theo tracking code, xác thực 4 số cuối SĐT người nhận
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


    if (last4) {
      const phone = shipment.receiver_phone || "";
      if (!phone.endsWith(last4)) {
        return res.status(403).json({ message: "Sai thông tin xác thực" });
      }
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};


// Phân công hàng loạt đơn hàng
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


  const currentUser = req.user;

  if (currentUser && currentUser.region_id) {
    try {

      const [driver] = await pool.query(
        "SELECT region_id FROM drivers WHERE id = ?",
        [driver_id]
      );

      if (driver.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy tài xế!" });
      }


      const driverRegion = driver[0].region_id;
      if (driverRegion && driverRegion !== currentUser.region_id) {
        return res.status(403).json({
          message: `Tài xế thuộc khu vực ${driverRegion}, không phải khu vực của bạn (${currentUser.region_id})!`
        });
      }


      const [invalidShipments] = await pool.query(
        "SELECT COUNT(*) as count FROM shipments WHERE id IN (?) AND region_id IS NOT NULL AND region_id != ?",
        [shipment_ids, currentUser.region_id]
      );

      if (invalidShipments[0].count > 0) {
        return res.status(403).json({
          message: "Có đơn hàng không thuộc khu vực quản lý của bạn!",
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Lỗi kiểm tra quyền hạn khu vực" });
    }
  }




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


    sendNotificationToDriver(
      driver_id,
      null,
      `Bạn vừa được phân công ${shipment_ids.length} đơn hàng mới. Vui lòng kiểm tra danh sách và lấy hàng sớm.`,
    ).catch(() => {});


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
            `Đơn hàng #${ship.tracking_code} đã được phân công cho tài xế và đang chờ đi lấy hàng.`
          );
        }
      }
    } catch (e) {
    }

    res.json({
      message: `Đã phân công thành công ${shipment_ids.length} đơn hàng!`,
    });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi phân công: " + err.message });
  } finally {
    connection.release();
  }
};

// Admin duyệt hoàn tiền cho đơn hàng thất bại/hủy
export const approveRefund = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [shipments] = await connection.query(
      "SELECT id, tracking_code, customer_id, status, payment_method FROM shipments WHERE id = ? FOR UPDATE",
      [id]
    );

    if (!shipments.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const shipment = shipments[0];

    if (shipment.payment_method !== "WALLET" && shipment.payment_method !== "MOMO") {
      await connection.rollback();
      return res.status(400).json({ message: "Đơn hàng này không thanh toán qua Ví hoặc MoMo nên không thể hoàn tiền" });
    }

    const [payments] = await connection.query(
      "SELECT id, amount, status FROM payments WHERE shipment_id = ? AND status = 'completed' FOR UPDATE",
      [id]
    );

    if (!payments.length) {
      // Thử tìm payments pending cho đơn MOMO bị lỗi
      const [pendingPayments] = await connection.query(
        "SELECT id, amount, status FROM payments WHERE shipment_id = ? AND status = 'pending' FOR UPDATE",
        [id]
      );
      
      if (!pendingPayments.length) {
        await connection.rollback();
        return res.status(400).json({ message: "Không tìm thấy giao dịch thanh toán thành công để hoàn" });
      }
    }

    const payment = payments.length ? payments[0] : null;
    if (!payment) {
      await connection.rollback();
      return res.status(400).json({ message: "Không thể hoàn tiền cho giao dịch này" });
    }

    const refundAmount = payment.amount;

    if (shipment.customer_id) {
      const [wallets] = await connection.query(
        "SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE",
        [shipment.customer_id]
      );

      if (wallets.length) {
        const wallet = wallets[0];
        await connection.query(
          "UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?",
          [refundAmount, wallet.id]
        );

        await connection.query(
          "INSERT INTO transactions (wallet_id, order_id, amount, type, description, status, created_at) VALUES (?, ?, ?, 'refund', ?, 'success', NOW())",
          [wallet.id, `REFUND${Date.now()}`, refundAmount, `Hoàn tiền cước đơn hàng #${shipment.tracking_code}`]
        );
      }
    }

    await connection.query("UPDATE payments SET status = 'failed' WHERE id = ?", [payment.id]);
    await connection.query("UPDATE shipments SET updated_at = NOW(), failure_note = CONCAT(COALESCE(failure_note,''), ' [Đã hoàn tiền]') WHERE id = ?", [id]);

    await connection.commit();

    try {
      if (shipment.customer_id) {
        await sendNotificationToCustomer(
          shipment.customer_id,
          id,
          `Yêu cầu hoàn tiền đơn hàng #${shipment.tracking_code} đã được duyệt. Số tiền ${Number(refundAmount).toLocaleString("vi-VN")}đ đã được cộng vào ví của bạn.`
        );
      }
    } catch (_) {}

    res.json({ message: "Duyệt hoàn tiền thành công" });
  } catch (err) {
    console.error("approveRefund error:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ message: "Lỗi hệ thống khi duyệt hoàn tiền: " + err.message });
  } finally {
    if (connection) connection.release();
  }
};
