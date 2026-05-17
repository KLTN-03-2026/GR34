import pool from "../config/db.js";

// Khởi tạo hoặc lấy lại phiên chat đang hoạt động của khách hàng
export const startChat = async (req, res) => {
  const { customer_id } = req.body;
  try {
    let [rows] = await pool.query(
      "SELECT * FROM chats WHERE customer_id = ? AND status='active'",
      [customer_id],
    );

    let chatId;
    if (rows.length > 0) {
      chatId = rows[0].id;
    } else {
      const [result] = await pool.query(
        "INSERT INTO chats (customer_id, status) VALUES (?, 'active')",
        [customer_id],
      );
      chatId = result.insertId;
    }

    res.json({ chatId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách tất cả phiên chat (dùng cho nhân viên điều phối, bao gồm phiên đang hoạt động và đã đóng)
export const getChats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.customer_id,
        c.dispatcher_id,
        c.status,
        c.started_at,
        c.ended_at,
        u.name AS customer_name,
        u.phone AS customer_phone,
        (
          SELECT content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_at
      FROM chats c
      LEFT JOIN users u ON u.id = c.customer_id
      ORDER BY
        CASE WHEN c.status = 'active' THEN 0 ELSE 1 END,
        COALESCE(c.ended_at, c.started_at) DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error("[getChats] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy danh sách tất cả phiên chat đã đóng (dùng cho quản trị viên xem lịch sử)
export const getClosedChats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.customer_id,
        c.status,
        c.started_at,
        c.ended_at,
        u.name AS customer_name,
        u.phone AS customer_phone,
        (
          SELECT content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_at
      FROM chats c
      LEFT JOIN users u ON u.id = c.customer_id
      WHERE c.status = 'closed'
      ORDER BY c.ended_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error("[getClosedChats] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Lấy lịch sử tin nhắn của một phiên chat theo chatId
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
      [chatId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Lưu tin nhắn mới vào cơ sở dữ liệu (được gọi nội bộ từ socket)
export const saveMessage = async (chatId, senderId, role, content) => {
  try {
    await pool.query(
      "INSERT INTO messages (chat_id, sender_id, role, content, created_at) VALUES (?, ?, ?, ?, NOW())",
      [chatId, senderId, role, content],
    );
  } catch (err) {
    console.error(`[saveMessage] Error saving message: ${err.message}`);
  }
};

// Kết thúc phiên chat, cập nhật trạng thái thành đã đóng
export const endChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    await pool.query(
      "UPDATE chats SET status='closed', ended_at=NOW() WHERE id=?",
      [chatId],
    );
    res.json({ message: " Chat đã kết thúc" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
