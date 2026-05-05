import db from "../config/db.js";

// Lấy danh sách thông báo của tài xế (theo user_id và driver_id)
export const getDriverNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const [driverRows] = await db.query("SELECT id FROM drivers WHERE user_id=?", [
      id,
    ]);

    const receiverIds = [Number(id), ...driverRows.map((d) => Number(d.id))];
    const uniqueReceiverIds = [...new Set(receiverIds.filter(Boolean))];
    const placeholders = uniqueReceiverIds.map(() => "?").join(",");

    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE receiver_id IN (${placeholders}) AND target_role='driver' ORDER BY created_at DESC`,
      uniqueReceiverIds,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách thông báo" });
  }
};

// Lấy danh sách thông báo của điều phối viên theo receiver_id
export const getDispatcherNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE receiver_id=? AND target_role='dispatcher' ORDER BY created_at DESC",
      [id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách thông báo" });
  }
};

// Đánh dấu một thông báo là đã đọc theo ID
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE notifications SET is_read=1 WHERE id=?", [id]);
    res.json({ message: " Đã đánh dấu đã đọc" });
  } catch (err) {
    res.status(500).json({ error: "Không thể cập nhật thông báo" });
  }
};

// Lấy danh sách thông báo của khách hàng, giới hạn 50 bản ghi mới nhất
export const getCustomerNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE receiver_id=? AND target_role='customer' ORDER BY created_at DESC LIMIT 50",
      [id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách thông báo" });
  }
};

// Đánh dấu tất cả thông báo chưa đọc của khách hàng là đã đọc
export const markAllCustomerRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE notifications SET is_read=1 WHERE receiver_id=? AND target_role='customer' AND is_read=0",
      [id],
    );
    res.json({ message: "Đã đánh dấu tất cả đã đọc" });
  } catch (err) {
    res.status(500).json({ error: "Không thể cập nhật" });
  }
};
