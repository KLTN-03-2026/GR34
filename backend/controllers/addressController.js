import db from "../config/db.js";

// Lấy danh sách địa chỉ người dùng
export const getAddresses = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) return res.status(400).json({ error: "Thiếu ID" });

    const [rows] = await db.query(
      "SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [customer_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm địa chỉ mới
export const createAddress = async (req, res) => {
  try {
    const { customer_id, name, phone, address, type, is_default } = req.body;

    if (!customer_id || !name || !address) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    // Số điện thoại cho phép = 0 (dữ liệu cũ) hoặc chuỗi rỗng
    const phoneVal = phone === 0 ? "0" : (phone || "");

    if (is_default) {
      await db.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [customer_id],
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM customer_addresses WHERE user_id = ?",
      [customer_id],
    );
    const shouldBeDefault = is_default || existing.length === 0;

    const isDefaultVal = shouldBeDefault ? 1 : 0;

    await db.query(
      "INSERT INTO customer_addresses (user_id, name, phone, address, type, is_default) VALUES (?, ?, ?, ?, ?, ?)",
      [customer_id, name, phoneVal, address, type || "other", isDefaultVal],
    );

    res.status(201).json({ message: "Thêm thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi thêm địa chỉ" });
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, name, phone, address, type, is_default } = req.body;

    if (is_default) {
      await db.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [customer_id],
      );
    }

    const isDefaultVal = is_default ? 1 : 0;

    const phoneVal = phone === 0 ? "0" : (phone || "");

    await db.query(
      "UPDATE customer_addresses SET name = ?, phone = ?, address = ?, type = ?, is_default = ? WHERE id = ? AND user_id = ?",
      [name, phoneVal, address, type, isDefaultVal, id, customer_id],
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
};

// Xóa địa chỉ
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM customer_addresses WHERE id = ?", [id]);

    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa" });
  }
};

// Dọn dẹp địa chỉ: bỏ postal code & "Việt Nam" cho tất cả địa chỉ
export const cleanupAddresses = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, address FROM customer_addresses");

    let updated = 0;
    for (const row of rows) {
      const raw = row.address || "";
      const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
      while (
        parts.length > 1 &&
        (/^Việt Nam$/i.test(parts[parts.length - 1]) ||
          /^\d{4,6}$/.test(parts[parts.length - 1]))
      ) {
        parts.pop();
      }
      const cleaned = parts.join(", ");
      if (cleaned !== raw) {
        await db.query(
          "UPDATE customer_addresses SET address = ? WHERE id = ?",
          [cleaned, row.id],
        );
        updated++;
      }
    }

    res.json({ message: `Đã cập nhật ${updated} địa chỉ` });
  } catch (err) {
    res.status(500).json({ error: "Lỗi dọn dẹp" });
  }
};
