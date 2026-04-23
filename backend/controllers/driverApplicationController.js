import pool from "../config/db.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

//  Setup gửi email

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  Ứng viên nộp đơn (PUBLIC)

export const applyDriver = async (req, res) => {
  try {
    const { name, phone, email, license_plate, vehicle_type, experience } =
      req.body;

    await pool.query(
      `INSERT INTO driver_applications 
       (name, phone, email, license_plate, vehicle_type, experience)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, email, license_plate, vehicle_type, experience]
    );

    //  Gửi mail thông báo đã nhận hồ sơ
    await transporter.sendMail({
      from: `"SpeedyShip" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SpeedyShip - Xác nhận nhận hồ sơ tài xế",
      html: `
        <h2>Xin chào ${name},</h2>
        <p>Cảm ơn bạn đã gửi đơn ứng tuyển làm tài xế cho SpeedyShip.</p>
        <p>Chúng tôi sẽ xem xét hồ sơ và liên hệ với bạn trong thời gian sớm nhất.</p>
        <p>Trân trọng,<br>Đội ngũ SpeedyShip</p>
      `,
    });

    res.json({ message: "✅ Nộp đơn thành công! Chúng tôi sẽ liên hệ sớm." });
  } catch (err) {
    console.error("applyDriver:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
};

//  Lấy danh sách ứng viên (ADMIN)

export const getApplications = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM driver_applications ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("getApplications:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
};
//  Admin duyệt hồ sơ + tạo xe + tạo driver

export const approveApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const [[app]] = await pool.query(
      "SELECT * FROM driver_applications WHERE id = ?",
      [id]
    );

    if (!app) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ!" });
    }

    //  1. Kiểm tra email có tồn tại trong users chưa

    const [[existingUser]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [app.email]
    );

    let userId;
    let plainPassword = "123456";

    if (existingUser) {
      userId = existingUser.id;
      console.log("⚠ User đã tồn tại, dùng lại userId =", userId);
    } else {
      const hashed = await bcrypt.hash(plainPassword, 10);

      const [userRes] = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, 'driver')`,
        [app.name, app.email, hashed]
      );

      userId = userRes.insertId;
    }

    // 2. Tạo driver

    const [driverRes] = await pool.query(
      `INSERT INTO drivers (user_id, name, phone, email, license_no, vehicle_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'available')`,
      [
        userId,
        app.name,
        app.phone,
        app.email,
        app.license_plate,
        app.vehicle_type,
      ]
    );

    const driverId = driverRes.insertId;

    //  3. Thêm xe vào bảng vehicles (tự động tạo xe theo hồ sơ)

    const [vehicleRes] = await pool.query(
      `INSERT INTO vehicles (plate_no, type, capacity_kg, driver_id, status)
       VALUES (?, ?, ?, ?, 'available')`,
      [
        app.license_plate,
        app.vehicle_type,
        150, // default capacity, bạn có thể sửa
        driverId,
      ]
    );

    //  4. Update application status

    await pool.query(
      "UPDATE driver_applications SET status='approved' WHERE id = ?",
      [id]
    );

    // 5. Gửi email thông báo tài khoản login cho tài xế

    await transporter.sendMail({
      from: `"SpeedyShip" <${process.env.EMAIL_USER}>`,
      to: app.email,
      subject: "Tài khoản tài xế SpeedyShip của bạn",
      html: `
        <h2>Xin chúc mừng ${app.name}!</h2>
        <p>Hồ sơ của bạn đã được <strong>duyệt</strong>.</p>
        <p>Bạn có thể đăng nhập vào hệ thống SpeedyShip với thông tin:</p>
        <ul>
          <li><strong>Email:</strong> ${app.email}</li>
          <li><strong>Mật khẩu:</strong> 123456</li>
        </ul>
        <p>Vui lòng đăng nhập và đổi mật khẩu của bạn sớm nhất.</p>
        <br>
        <p>Chúc bạn làm việc hiệu quả!</p>
      `,
    });

    //  6. Trả kết quả

    res.json({
      message: "✅ Duyệt thành công! Tài xế + Xe đã được tạo & email đã gửi.",
      driverId,
      vehicleId: vehicleRes.insertId,
    });
  } catch (err) {
    console.error("approveApplication:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
};

//  Từ chối hồ sơ

export const rejectApplication = async (req, res) => {
  try {
    await pool.query(
      "UPDATE driver_applications SET status='rejected' WHERE id=?",
      [req.params.id]
    );

    res.json({ message: "❌ Đã từ chối hồ sơ." });
  } catch (err) {
    console.error("rejectApplication:", err);
    res.status(500).json({ error: "Lỗi server!" });
  }
};
