import db from "../config/db.js";

// 1. Lấy danh sách
export const getAddresses = async (req, res) => {
  try {
    // Frontend gửi lên customer_id, ta nhận vào biến này
    const { customer_id } = req.params;

    if (!customer_id) return res.status(400).json({ error: "Thiếu ID" });

    // 👇 SỬA Ở ĐÂY: Đổi customer_id thành user_id cho khớp với Database
    const [rows] = await db.query(
      "SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [customer_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 2. Thêm mới
export const createAddress = async (req, res) => {
  try {
    const { customer_id, name, phone, address, type, is_default } = req.body;

    if (!customer_id || !name || !phone || !address) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    // 👇 SỬA SQL: Dùng user_id
    if (is_default) {
      await db.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [customer_id]
      );
    }

    // 👇 SỬA SQL: Dùng user_id
    const [existing] = await db.query(
      "SELECT id FROM customer_addresses WHERE user_id = ?",
      [customer_id]
    );
    const shouldBeDefault = is_default || existing.length === 0;

    const isDefaultVal = shouldBeDefault ? 1 : 0;

    // 👇 SỬA SQL: INSERT vào cột user_id
    await db.query(
      "INSERT INTO customer_addresses (user_id, name, phone, address, type, is_default) VALUES (?, ?, ?, ?, ?, ?)",
      [customer_id, name, phone, address, type || "other", isDefaultVal]
    );

    res.status(201).json({ message: "Thêm thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi thêm địa chỉ" });
  }
};

// 3. Cập nhật
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, name, phone, address, type, is_default } = req.body;

    // 👇 SỬA SQL: Dùng user_id
    if (is_default) {
      await db.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [customer_id]
      );
    }

    const isDefaultVal = is_default ? 1 : 0;

    // 👇 SỬA SQL: Dùng user_id trong WHERE để bảo mật (chỉ update nếu đúng chủ sở hữu)
    await db.query(
      "UPDATE customer_addresses SET name = ?, phone = ?, address = ?, type = ?, is_default = ? WHERE id = ? AND user_id = ?",
      [name, phone, address, type, isDefaultVal, id, customer_id]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
};

// 4. Xóa
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Bạn có thể thêm check user_id ở đây nếu muốn bảo mật kỹ hơn
    await db.query("DELETE FROM customer_addresses WHERE id = ?", [id]);

    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xóa" });
  }
};
