import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// --- 1. LẤY HỒ SƠ KHÁCH HÀNG (FULL THÔNG TIN) ---
export const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Câu lệnh SQL: Lấy thông tin user + Số dư ví + Thống kê đơn hàng + Tổng chi tiêu
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

    // --- Logic tính Hạng thành viên (Rank) ---
    let rank = "Thành viên mới";
    const spent = Number(user.total_spent);

    if (spent >= 20000000) rank = "💎 Kim Cương";
    else if (spent >= 10000000) rank = "🏆 Vàng";
    else if (spent >= 2000000) rank = "🥈 Bạc";
    else if (spent > 0) rank = "🥉 Đồng";

    // Trả về dữ liệu đã gộp
    res.json({
      ...user,
      rank: rank,
      wallet_balance: Number(user.wallet_balance), // Đảm bảo là số
      total_spent: spent,
    });
  } catch (err) {
    console.error("Lỗi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- 2. CẬP NHẬT HỒ SƠ (Bao gồm Avatar & Address) ---
export const updateCustomerProfile = async (req, res) => {
  const { name, email, phone, address, avatar } = req.body;
  const userId = req.params.id;

  try {
    // Chỉ cập nhật các trường được gửi lên
    // Lưu ý: Avatar gửi lên là chuỗi Base64 rất dài, nên dùng LONGTEXT trong DB
    await pool.query(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, avatar = ? 
       WHERE id = ? AND role = 'customer'`,
      [name, phone, address, avatar, userId]
    );

    res.json({ message: "Cập nhật hồ sơ thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật hồ sơ:", err);
    res.status(500).json({ message: "Không thể cập nhật hồ sơ" });
  }
};

//Tạo đơn hàng mới (và tự động tạo thanh toán)
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
    shipping_fee, // FE gửi
    service_type, // standard / express / fast
    payment_method = "COD",
  } = req.body;

  try {
    // Tạo mã vận đơn
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

    // Nếu thanh toán Momo -> tạo payment chờ xử lý
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
    console.error("❌ Lỗi tạo đơn hàng:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách đơn hàng
export const getShipmentsByCustomer = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM shipments WHERE customer_id = ? ORDER BY created_at DESC",
      [req.params.customer_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Gửi feedback
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

// Theo dõi đơn hàng theo mã (tracking_code) — chỉ cho khách hàng của chính mình
export const trackShipment = async (req, res) => {
  try {
    const { code } = req.params;
    const customerId = req.query.customer_id || null;
    const last4 = req.query.last4 || null; // 4 số cuối SĐT

    if (!code) {
      return res.status(400).json({ message: "Thiếu mã vận đơn!" });
    }

    let query = `
  SELECT 
    s.*, 
    d.name AS driver_name, 
    d.phone AS driver_phone,
    d.license_no AS plate_number, 
    d.latitude AS driver_lat, 
    d.longitude AS driver_lng
  FROM shipments s
  LEFT JOIN assignments a ON a.shipment_id = s.id
  LEFT JOIN drivers d ON a.driver_id = d.id
  WHERE s.tracking_code = ?
`;
    const params = [code];

    //  Nếu là khách hàng đã đăng nhập → chỉ xem đơn của mình
    if (customerId) {
      query += " AND s.customer_id = ?";
      params.push(customerId);
    }
    //  Nếu là khách vãng lai → yêu cầu nhập 4 số cuối SĐT
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

    res.json(shipment);
  } catch (err) {
    console.error("❌ Lỗi tra cứu đơn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};
//  Xem chi tiết đơn hàng (hiển thị vị trí tài xế)
export const getShipmentDetail = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.*, 
          d.name AS driver_name,
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

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi SQL:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- ĐỔI MẬT KHẨU ---
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // 2. Lấy thông tin user từ DB để lấy mật khẩu đã mã hóa hiện tại
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const user = users[0];

    // 3. So sánh mật khẩu cũ (currentPassword) với mật khẩu trong DB (user.password)
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Mật khẩu hiện tại không chính xác!" });
    }

    // 4. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. Cập nhật mật khẩu mới vào DB
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại sau." });
  }
};
