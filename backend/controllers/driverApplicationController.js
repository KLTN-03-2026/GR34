import pool from "../config/db.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Cấu hình transporter gửi email qua Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Lấy role_id của driver, tự tạo nếu chưa có trong bảng roles
const ensureDriverRole = async () => {
  const [rows] = await pool.query("SELECT id FROM roles WHERE code = 'driver'");
  if (rows.length) return rows[0].id;

  const [result] = await pool.query(
    "INSERT INTO roles (code, name) VALUES ('driver', 'Tài xế')",
  );
  return result.insertId;
};

// Nhận đơn đăng ký tài xế từ form và lưu vào bảng driver_applications
export const applyDriver = async (req, res) => {
  try {
    const { name, phone, email, license_plate, vehicle_type, experience } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !phone || !email || !license_plate) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    // Lưu hồ sơ đăng ký vào database
    await pool.query(
      `INSERT INTO driver_applications 
       (name, phone, email, license_plate, vehicle_type, experience)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, email, license_plate, vehicle_type || "", experience || ""],
    );

    // Gửi email xác nhận — không block nếu email lỗi
    try {
      await transporter.sendMail({
        from: `"SpeedyShip" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "SpeedyShip - Xác nhận nhận hồ sơ tài xế",
        html: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;">
    <div style="background:#1e90ff;padding:16px 24px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
      Xác nhận nhận hồ sơ tài xế
    </div>
    <div style="padding:24px 30px;color:#333;font-size:15px;line-height:1.6;">
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã gửi đơn ứng tuyển làm tài xế cho <strong>SpeedyShip</strong>.</p>
      <p>Chúng tôi đã tiếp nhận hồ sơ của bạn với thông tin:</p>
      <div style="background:#f4f8fb;border-radius:8px;padding:14px 18px;margin:12px 0;">
        <p style="margin:4px 0;">📧 <strong>Email:</strong> ${email}</p>
        <p style="margin:4px 0;">📱 <strong>SĐT:</strong> ${phone}</p>
        <p style="margin:4px 0;">🚗 <strong>Biển số:</strong> ${license_plate}</p>
      </div>
      <p>Hồ sơ sẽ được xem xét và chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
      <p style="font-size:12px;color:#777;text-align:center;">
        Email này được gửi tự động từ hệ thống SpeedyShip. Vui lòng không trả lời trực tiếp.
      </p>
    </div>
  </div>
        `,
      });
    } catch (_mailErr) {
      // Bỏ qua lỗi email, không ảnh hưởng kết quả lưu hồ sơ
    }

    res.json({ message: "Nộp đơn thành công! Chúng tôi sẽ liên hệ sớm." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};

// Lấy danh sách tất cả đơn đăng ký tài xế, sắp xếp mới nhất trước
export const getApplications = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM driver_applications ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};

// Duyệt hồ sơ tài xế: tạo tài khoản user + driver + vehicle, gửi email thông báo
export const approveApplication = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy thông tin hồ sơ cần duyệt
    const [[app]] = await pool.query(
      "SELECT * FROM driver_applications WHERE id = ?",
      [id],
    );

    if (!app) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ!" });
    }

    // Ngăn duyệt trùng
    if (app.status === "approved") {
      return res
        .status(400)
        .json({ error: "Hồ sơ này đã được duyệt trước đó!" });
    }

    // Kiểm tra email đã có tài khoản user chưa
    const [[existingUser]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [app.email],
    );

    let userId;
    const plainPassword = "123456";

    // Đảm bảo role driver tồn tại trong bảng roles
    const driverRoleId = await ensureDriverRole();

    if (existingUser) {
      userId = existingUser.id;

      // Cập nhật role thành driver trong bảng users
      await pool.query("UPDATE users SET role = 'driver' WHERE id = ?", [
        userId,
      ]);

      // Gán role driver trong bảng user_roles nếu chưa có
      const [existingRole] = await pool.query(
        "SELECT user_id FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, driverRoleId],
      );

      if (!existingRole.length) {
        await pool.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, driverRoleId],
        );
      }
    } else {
      // Tạo tài khoản mới với mật khẩu mặc định 123456 (đã hash bcrypt)
      const hashed = await bcrypt.hash(plainPassword, 10);
      const [userRes] = await pool.query(
        `INSERT INTO users (name, email, password, phone, role)
         VALUES (?, ?, ?, ?, 'driver')`,
        [app.name, app.email, hashed, app.phone],
      );
      userId = userRes.insertId;

      // Gán role driver qua bảng user_roles
      await pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [userId, driverRoleId],
      );
    }

    // Kiểm tra bản ghi driver đã tồn tại chưa (tránh duplicate)
    const [[existingDriver]] = await pool.query(
      "SELECT id FROM drivers WHERE user_id = ? OR email = ?",
      [userId, app.email],
    );

    let driverId;
    if (existingDriver) {
      driverId = existingDriver.id;
    } else {
      // Tạo mới bản ghi driver
      const [driverRes] = await pool.query(
        `INSERT INTO drivers (user_id, name, phone, email, license_no, vehicle_type, status)
         VALUES (?, ?, ?, ?, ?, ?, 'free')`,
        [
          userId,
          app.name,
          app.phone,
          app.email,
          app.license_plate,
          app.vehicle_type,
        ],
      );
      driverId = driverRes.insertId;
    }

    // Kiểm tra xe đã tồn tại chưa (plate_no là UNIQUE)
    let vehicleId;
    const [[existingVehicle]] = await pool.query(
      "SELECT id FROM vehicles WHERE plate_no = ?",
      [app.license_plate],
    );

    if (existingVehicle) {
      vehicleId = existingVehicle.id;
      // Gán driver_id cho xe nếu chưa được gán
      await pool.query(
        "UPDATE vehicles SET driver_id = ? WHERE id = ? AND driver_id IS NULL",
        [driverId, vehicleId],
      );
    } else {
      // Tạo mới bản ghi xe và liên kết với driver
      const [vehicleRes] = await pool.query(
        `INSERT INTO vehicles (plate_no, type, capacity_kg, driver_id, status)
         VALUES (?, ?, ?, ?, 'available')`,
        [app.license_plate, app.vehicle_type, 150, driverId],
      );
      vehicleId = vehicleRes.insertId;
    }

    // Cập nhật trạng thái hồ sơ thành approved
    await pool.query(
      "UPDATE driver_applications SET status='approved' WHERE id = ?",
      [id],
    );

    // Gửi email thông báo duyệt kèm thông tin đăng nhập
    try {
      await transporter.sendMail({
        from: `"SpeedyShip" <${process.env.EMAIL_USER}>`,
        to: app.email,
        subject: "SpeedyShip - Tài khoản tài xế đã được kích hoạt",
        html: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;">
    <div style="background:#1e90ff;padding:16px 24px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
      🎉 Chúc mừng! Hồ sơ đã được duyệt
    </div>
    <div style="padding:24px 30px;color:#333;font-size:15px;line-height:1.6;">
      <p>Xin chào <strong>${app.name}</strong>,</p>
      <p>Hồ sơ ứng tuyển tài xế của bạn đã được <strong style="color:#27ae60;">duyệt thành công</strong>.</p>
      <p>Thông tin đăng nhập hệ thống SpeedyShip của bạn:</p>
      <div style="background:#f4f8fb;border-radius:8px;padding:14px 18px;margin:12px 0;">
        <p style="margin:6px 0;">📧 <strong>Email:</strong> ${app.email}</p>
        <p style="margin:6px 0;">🔑 <strong>Mật khẩu:</strong></p>
        <div style="font-size:28px;font-weight:700;color:#1e90ff;text-align:center;margin:10px 0;letter-spacing:6px;">
          123456
        </div>
      </div>
      <p style="color:#e74c3c;font-size:13px;">⚠️ Vui lòng đăng nhập và <strong>đổi mật khẩu</strong> ngay sau lần đăng nhập đầu tiên.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
      <p style="font-size:12px;color:#777;text-align:center;">
        Email này được gửi tự động từ hệ thống SpeedyShip. Vui lòng không trả lời trực tiếp.
      </p>
    </div>
  </div>
        `,
      });
    } catch (_mailErr) {
      // Bỏ qua lỗi email, không ảnh hưởng kết quả duyệt hồ sơ
    }

    res.json({
      message: "Duyệt thành công! Tài xế + Xe đã được tạo & email đã gửi.",
      driverId,
      vehicleId,
    });
  } catch (err) {
    console.error("Lỗi duyệt hồ sơ:", err);
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};

// Từ chối hồ sơ đăng ký tài xế, cập nhật status thành rejected
export const rejectApplication = async (req, res) => {
  try {
    await pool.query(
      "UPDATE driver_applications SET status='rejected' WHERE id=?",
      [req.params.id],
    );
    res.json({ message: "Đã từ chối hồ sơ." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};
