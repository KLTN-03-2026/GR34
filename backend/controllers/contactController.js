import db from "../config/db.js";
import nodemailer from "nodemailer";

// Cấu hình transporter gửi email phản hồi liên hệ qua Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi form liên hệ
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

    await db.query(
      `INSERT INTO contacts (name, email, phone, message, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [name, email, phone || null, message],
    );

    // Email xác nhận cho khách hàng
    await transporter.sendMail({
      from: `"SpeedyShip Hỗ trợ Khách hàng" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SpeedyShip | Xác nhận yêu cầu hỗ trợ của bạn",
      html: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;">
    <div style="background:#1e90ff;padding:16px 24px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
      Xác nhận yêu cầu hỗ trợ
    </div>
    <div style="padding:24px 30px;color:#333;font-size:15px;line-height:1.6;">
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã tin tưởng và liên hệ với <strong>SpeedyShip</strong>. Chúng tôi đã tiếp nhận yêu cầu hỗ trợ của bạn với nội dung sau:</p>
      <div style="background:#f4f8fb;border-radius:8px;padding:14px 18px;margin:12px 0;border-left:4px solid #1e90ff;">
        <p style="margin:0;color:#555;font-style:italic;">${message}</p>
      </div>
      <p>Bộ phận chăm sóc khách hàng sẽ xem xét và phản hồi trong vòng <strong>24 giờ làm việc</strong>.</p>
      <p>Nếu cần hỗ trợ gấp, vui lòng liên hệ tổng đài: <strong style="color:#1e90ff;">1900 888 999</strong></p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
      <p style="font-size:12px;color:#777;text-align:center;">
        Email này được gửi tự động từ hệ thống SpeedyShip. Vui lòng không trả lời trực tiếp.
      </p>
    </div>
  </div>
      `,
    });

    // Email thông báo nội bộ cho admin
    await transporter.sendMail({
      from: `"SpeedyShip BOT" <${process.env.EMAIL_USER}>`,
      to: "support@speedyship.com",
      subject: `📩 Yêu cầu liên hệ mới từ khách hàng ${name}`,
      html: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;">
    <div style="background:#e67e22;padding:16px 24px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
      📩 Yêu cầu liên hệ mới
    </div>
    <div style="padding:24px 30px;color:#333;font-size:15px;line-height:1.6;">
      <p>Có yêu cầu liên hệ mới từ khách hàng:</p>
      <div style="background:#f4f8fb;border-radius:8px;padding:14px 18px;margin:12px 0;">
        <p style="margin:4px 0;">👤 <strong>Họ tên:</strong> ${name}</p>
        <p style="margin:4px 0;">📧 <strong>Email:</strong> ${email}</p>
        <p style="margin:4px 0;">📱 <strong>SĐT:</strong> ${phone || "Không cung cấp"}</p>
      </div>
      <p><strong>Nội dung yêu cầu:</strong></p>
      <div style="background:#fff8f0;border-radius:8px;padding:14px 18px;margin:12px 0;border-left:4px solid #e67e22;">
        <p style="margin:0;color:#555;">${message}</p>
      </div>
      <p>Vui lòng kiểm tra chi tiết tại <a href="http://localhost:5173/admin/contact" style="color:#1e90ff;font-weight:700;">Admin Contact Dashboard</a></p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
      <p style="font-size:12px;color:#777;text-align:center;">
        Email thông báo nội bộ từ hệ thống SpeedyShip.
      </p>
    </div>
  </div>
      `,
    });

    res.json({
      success: true,
      message: " Đã lưu liên hệ và gửi email xác nhận thành công!",
    });
  } catch (err) {
    res.status(500).json({ error: "Không thể gửi yêu cầu hoặc email" });
  }
};

// Giao yêu cầu liên hệ cho điều phối viên phụ trách xử lý
export const assignDispatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { dispatcher_id } = req.body;

    if (!dispatcher_id)
      return res.status(400).json({ error: "Thiếu ID điều phối viên" });

    await db.query(
      "UPDATE contacts SET status = 'approved', assigned_to = ? WHERE id = ?",
      [dispatcher_id, id],
    );

    res.json({
      success: true,
      message: "Đã giao yêu cầu cho điều phối viên thành công!",
    });
  } catch (err) {
    res.status(500).json({ error: "Không thể giao yêu cầu" });
  }
};

// Lấy danh sách liên hệ
export const getAllContacts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.message,
        c.status,
        c.note,
        c.created_at,
        u.name AS assigned_name
      FROM contacts c
      LEFT JOIN users u ON c.assigned_to = u.id
      ORDER BY c.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách liên hệ" });
  }
};

// Cập nhật trạng thái liên hệ
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status)
      return res.status(400).json({ error: "Thiếu trạng thái cập nhật" });

    await db.query(
      "UPDATE contacts SET status = ?, note = ?, updated_at = NOW() WHERE id = ?",
      [status, note || null, id],
    );

    if (status === "resolved") {
      const [[contact]] = await db.query(
        "SELECT name, email FROM contacts WHERE id = ?",
        [id],
      );

      if (contact?.email) {
        await transporter.sendMail({
          from: `"SpeedyShip Hỗ trợ" <${process.env.EMAIL_USER}>`,
          to: contact.email,
          subject: "SpeedyShip | Yêu cầu của bạn đã được xử lý",
          html: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;">
    <div style="background:#27ae60;padding:16px 24px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
       Yêu cầu đã được xử lý
    </div>
    <div style="padding:24px 30px;color:#333;font-size:15px;line-height:1.6;">
      <p>Xin chào <strong>${contact.name}</strong>,</p>
      <p>Chúng tôi xin thông báo rằng yêu cầu hỗ trợ của bạn đã được đội ngũ <strong>SpeedyShip</strong> xử lý thành công.</p>
      <p>Cảm ơn bạn đã dành thời gian liên hệ với chúng tôi. Rất mong tiếp tục được đồng hành cùng bạn trong những đơn hàng sắp tới!</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
      <p style="font-size:12px;color:#777;text-align:center;">
        Email này được gửi tự động từ hệ thống SpeedyShip. Vui lòng không trả lời trực tiếp.
      </p>
    </div>
  </div>
          `,
        });
      }
    }

    res.json({
      success: true,
      message: " Cập nhật trạng thái liên hệ thành công!",
    });
  } catch (err) {
    res.status(500).json({ error: "Không thể cập nhật trạng thái" });
  }
};

// Lấy danh sách các yêu cầu liên hệ được giao cho một điều phối viên cụ thể
export const getContactsByDispatcher = async (req, res) => {
  try {
    const { dispatcher_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        c.id, c.name, c.email, c.phone, c.message, 
        c.status, c.created_at, c.note
      FROM contacts c
      WHERE c.assigned_to = ?
      ORDER BY c.created_at DESC
      `,
      [dispatcher_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách liên hệ" });
  }
};
