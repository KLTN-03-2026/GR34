import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { sendNotificationToCustomer } from "../server.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Lấy hồ sơ khách hàng kèm số dư ví, tổng đơn hàng và xếp hạng thành viên
export const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.params.id;


    const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar, u.address,
        COALESCE(w.balance, 0) AS wallet_balance,
        (SELECT COUNT(*) FROM shipments WHERE customer_id = u.id) AS total_orders,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE customer_id = u.id AND status = 'completed') AS total_spent
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.id = ? AND u.role = 'customer'
    `;

    const [rows] = await pool.query(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    const user = rows[0];


    let rank = "Thành viên mới";
    const spent = Number(user.total_spent);

    if (spent >= 20000000) rank = "💎 Kim Cương";
    else if (spent >= 10000000) rank = "🏆 Vàng";
    else if (spent >= 2000000) rank = "🥈 Bạc";
    else if (spent > 0) rank = "🥉 Đồng";


    res.json({
      ...user,
      rank: rank,
      wallet_balance: Number(user.wallet_balance),
      total_spent: spent,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tải ảnh đại diện lên cho khách hàng
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    // Tạo URL đầy đủ cho ảnh đại diện để trả về cho frontend
    const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    // Cập nhật ảnh đại diện của người dùng trong cơ sở dữ liệu (lưu đường dẫn tương đối)
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [relativePath, userId]);

    res.json({
      message: "Upload avatar thành công",
      avatarUrl: avatarUrl,
    });
  } catch (err) {
    console.error("[uploadAvatar] Error:", err);
    // Xóa file đã tải lên nếu có lỗi
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("[uploadAvatar] Failed to clean up file:", unlinkErr);
      }
    }
    res.status(500).json({ message: "Lỗi upload avatar" });
  }
};


// Cập nhật thông tin hồ sơ khách hàng (tên, SĐT, địa chỉ, avatar)
export const updateCustomerProfile = async (req, res) => {
  const { name, email, phone, address, avatar } = req.body;
  const userId = req.params.id;

  try {

    await pool.query(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, avatar = ? 
       WHERE id = ? AND role = 'customer'`,
      [name, phone, address, avatar, userId]
    );

    res.json({ message: "Cập nhật hồ sơ thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Không thể cập nhật hồ sơ" });
  }
};


// Tạo đơn hàng mới
export const createShipment = async (req, res) => {
  const {
    customer_id,
    sender_name,
    sender_phone,
    receiver_name,
    receiver_phone,
    item_name,
    pickup_address,
    delivery_address,
    weight_kg,
    cod_amount,
    shipping_fee,
    service_type,
    payment_method = "COD",
  } = req.body;

  try {

    const tracking = `SP${Date.now().toString().slice(-6)}`;

    const [result] = await pool.query(
      `INSERT INTO shipments(
    tracking_code,
    customer_id,
    sender_name, sender_phone,
    receiver_name, receiver_phone,
    item_name,
    pickup_address, pickup_lat, pickup_lng,
    delivery_address, delivery_lat, delivery_lng,
    weight_kg,
    cod_amount,
    shipping_fee,
    service_type,
    payment_method,
    status
  )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending')`,
      [
        tracking,
        customer_id,
        sender_name,
        sender_phone,
        receiver_name,
        receiver_phone,
        item_name,
        pickup_address,
        pickup_lat,
        pickup_lng,
        delivery_address,
        delivery_lat,
        delivery_lng,
        weight_kg,
        cod_amount,
        shipping_fee,
        service_type,
        payment_method,
      ]
    );

    const shipment_id = result.insertId;


    if (payment_method === "MOMO") {
      await pool.query(
        `INSERT INTO payments (shipment_id, customer_id, amount, method, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [shipment_id, customer_id, cod_amount + shipping_fee, payment_method]
      );
    }

    res.json({
      message: "Tạo đơn hàng thành công",
      shipment_id,
      tracking_code: tracking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy đơn hàng của khách hàng
export const getShipmentsByCustomer = async (req, res) => {
  try {
      const [rows] = await pool.query(
        `SELECT s.*,
                d.name AS driver_name,
                d.phone AS driver_phone,
                d.license_no AS plate_number,
                d.avatar AS driver_avatar,
                COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.shipment_id = s.id AND p.status IN ('completed','failed')), 0) AS paid_amount,
                (s.failure_note LIKE '%[Đã hoàn tiền]%' OR s.status = 'canceled') AS is_refunded
         FROM shipments s
         LEFT JOIN assignments a ON s.id = a.shipment_id
         LEFT JOIN drivers d ON a.driver_id = d.id
         WHERE s.customer_id = ?
         ORDER BY s.created_at DESC`,
        [req.params.customer_id]
    );

    // Chuyển đường dẫn tương đối của ảnh đại diện tài xế thành URL đầy đủ
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    rows.forEach(shipment => {
      if (shipment.driver_avatar) {
        shipment.driver_avatar = shipment.driver_avatar.startsWith("/uploads")
          ? `${baseUrl}${shipment.driver_avatar}`
          : shipment.driver_avatar;
      }
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Gửi đánh giá/phản hồi
export const createFeedback = async (req, res) => {
  const { customer_id, shipment_id, content, rating } = req.body;
  try {
    await pool.query(
      "INSERT INTO feedbacks (customer_id, shipment_id, content, rating, created_at) VALUES (?,?,?,?,NOW())",
      [customer_id, shipment_id, content, rating]
    );
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Tra cứu trạng thái đơn hàng theo tracking code, hỗ trợ cả khách đăng nhập và khách vãng lai
export const trackShipment = async (req, res) => {
  try {
    const { code } = req.params;
    const customerId = req.query.customer_id || null;
    const last4 = req.query.last4 || null;

    if (!code) {
      return res.status(400).json({ message: "Thiếu mã vận đơn!" });
    }

    let query = `
  SELECT
    s.*,
    d.name AS driver_name,
    d.phone AS driver_phone,
    d.license_no AS plate_number,
    d.avatar AS driver_avatar,
    d.latitude AS driver_lat,
    d.longitude AS driver_lng
  FROM shipments s
  LEFT JOIN assignments a ON a.shipment_id = s.id
  LEFT JOIN drivers d ON a.driver_id = d.id
  WHERE s.tracking_code = ?
`;
    const params = [code];


    if (customerId) {
      query += " AND s.customer_id = ?";
      params.push(customerId);
    }

    else if (last4) {
      query +=
        " AND RIGHT(REGEXP_REPLACE(s.receiver_phone, '[^0-9]', ''), 4) = ?";
      params.push(last4);
    } else {
      return res.status(400).json({
        message: "Khách vãng lai phải nhập 4 số cuối SĐT người nhận!",
      });
    }

    const [rows] = await pool.query(query, params);

    if (!rows.length) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng hoặc thông tin xác thực không đúng!",
      });
    }

    const shipment = rows[0];

    // Chuyển đường dẫn tương đối của ảnh đại diện tài xế thành URL đầy đủ
    if (shipment.driver_avatar) {
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      shipment.driver_avatar = shipment.driver_avatar.startsWith("/uploads")
        ? `${baseUrl}${shipment.driver_avatar}`
        : shipment.driver_avatar;
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};

// Lấy chi tiết đơn hàng kèm thông tin tài xế và vị trí GPS
export const getShipmentDetail = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          s.*,
          d.name AS driver_name,
          d.phone AS driver_phone,
          d.license_no AS plate_number,
          d.avatar AS driver_avatar,
          d.latitude AS driver_lat,
          d.longitude AS driver_lng
        FROM shipments s
        LEFT JOIN assignments a ON a.shipment_id = s.id
        LEFT JOIN drivers d ON a.driver_id = d.id
        WHERE s.id = ?`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const shipment = rows[0];

    // Chuyển đường dẫn tương đối của ảnh đại diện tài xế thành URL đầy đủ
    if (shipment.driver_avatar) {
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      shipment.driver_avatar = shipment.driver_avatar.startsWith("/uploads")
        ? `${baseUrl}${shipment.driver_avatar}`
        : shipment.driver_avatar;
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Đổi mật khẩu
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }


    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const user = users[0];


    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Mật khẩu hiện tại không chính xác!" });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại sau." });
  }
};

// Hủy đơn hàng và hoàn tiền nếu đã thanh toán qua ví hoặc MoMo
export const cancelShipment = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Kiểm tra đơn hàng tồn tại và trạng thái
    const [[shipment]] = await connection.query(
      "SELECT * FROM shipments WHERE id = ?",
      [id]
    );

    if (!shipment) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (shipment.status !== "pending") {
      await connection.rollback();
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý!",
      });
    }

    // Kiểm tra thanh toán đã hoàn tất chưa (MoMo hoặc Wallet)
    let refundAmount = 0;
    const [payments] = await connection.query(
      "SELECT * FROM payments WHERE shipment_id = ? AND status = 'completed'",
      [id]
    );

    if (payments.length > 0) {
      refundAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    // Hoàn tiền về ví nếu đã thanh toán
    if (refundAmount > 0 && shipment.customer_id) {
      const [[wallet]] = await connection.query(
        "SELECT * FROM wallets WHERE user_id = ?",
        [shipment.customer_id]
      );

      if (wallet) {
        await connection.query(
          "UPDATE wallets SET balance = balance + ? WHERE id = ?",
          [refundAmount, wallet.id]
        );

        const refundOrderId = `REFUND${shipment.tracking_code}${Date.now().toString().slice(-4)}`;

        await connection.query(
          `INSERT INTO transactions (wallet_id, order_id, type, amount, description, status)
           VALUES (?, ?, 'deposit', ?, ?, 'success')`,
          [
            wallet.id,
            refundOrderId,
            refundAmount,
            `Hoàn tiền đơn hàng #${shipment.tracking_code} bị hủy`,
          ]
        );
      }
    }

    // Cập nhật trạng thái đơn hàng sang canceled
    await connection.query(
      "UPDATE shipments SET status = 'canceled', updated_at = NOW() WHERE id = ?",
      [id]
    );

    await connection.commit();

    // Gửi thông báo hoàn tiền nếu có
    if (refundAmount > 0 && shipment.customer_id) {
      try {
        await sendNotificationToCustomer(
          shipment.customer_id,
          id,
          `Đơn hàng #${shipment.tracking_code} đã được hủy. Số tiền ${Number(refundAmount).toLocaleString("vi-VN")}đ đã được hoàn vào ví của bạn.`
        );
      } catch (_) {}
    }

    res.json({
      message: refundAmount > 0
        ? `Đã hủy đơn hàng và hoàn ${Number(refundAmount).toLocaleString("vi-VN")}₫ về ví của bạn.`
        : "Đã hủy đơn hàng thành công.",
      refundAmount,
    });
  } catch (err) {
    await connection.rollback();
    console.error("[cancelShipment] Error:", err.message);
    res.status(500).json({ message: "Lỗi hệ thống khi hủy đơn hàng" });
  } finally {
    connection.release();
  }
};
