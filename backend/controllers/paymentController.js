import db from "../config/db.js";
import crypto from "crypto";
import axios from "axios";

// Lấy danh sách tất cả giao dịch thanh toán kèm thông tin đơn hàng và khách hàng
export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.tracking_code, u.name AS customer_name
      FROM payments p
      JOIN shipments s ON p.shipment_id = s.id
      JOIN users u ON p.customer_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo thanh toán mới
export const createPayment = async (req, res) => {
  try {
    const { shipment_id, customer_id, amount, method } = req.body;
    await db.query("UPDATE shipments SET payment_method = ?, status = 'pending' WHERE id = ?", [
      method,
      shipment_id,
    ]);

    await db.query(
      "INSERT INTO payments (shipment_id, customer_id, amount, method, status) VALUES (?, ?, ?, ?, 'pending')",
      [shipment_id, customer_id, amount, method],
    );
    res.json({ message: " Tạo thanh toán thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi tạo thanh toán" });
  }
};

// Tạo yêu cầu thanh toán MoMo cho đơn hàng, sinh link redirect và lưu vào database
export const createMomoPayment = async (req, res) => {
  try {
    const { shipment_id, customer_id, amount } = req.body;
    if (!shipment_id || !customer_id || !amount)
      return res.status(400).json({ error: "Thiếu dữ liệu thanh toán" });
    await db.query(
      "UPDATE shipments SET payment_method = 'MOMO' WHERE id = ?",
      [shipment_id],
    );

    const finalAmount = Math.round(Number(amount));
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const secretKey = process.env.MOMO_SECRET_KEY;
    
    if (!secretKey) {
      return res.status(500).json({ error: "MoMo secret key chưa được cấu hình" });
    }

    const orderId = `SHIP${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toan van don #${shipment_id}`;
    const redirectUrl = `http://localhost:5173/customer/payment-success?orderId=${orderId}&type=shipment`;
    const ipnUrl = "http://localhost:5000/api/payments/momo/callback";
    const requestType = "captureWallet";

    const rawSignature = `accessKey=${accessKey}&amount=${finalAmount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature, "utf8")
      .digest("hex");

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: finalAmount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
      extraData: "",
      lang: "vi",
    };

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
    );

    await db.query(
      `INSERT INTO payments (order_id, shipment_id, customer_id, amount, method, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
      [orderId, shipment_id, customer_id, amount, "Momo"],
    );

    res.json({ ...momoRes.data, payUrl: momoRes.data.payUrl });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.response?.data?.message || "Lỗi tạo thanh toán MoMo",
      });
  }
};

// Tạo yêu cầu nạp tiền ví qua MoMo, tạo giao dịch pending trong transactions
export const createWalletDepositMomo = async (req, res) => {
  try {
    const { wallet_id, amount } = req.body;

    if (!wallet_id || !amount)
      return res.status(400).json({ error: "Thiếu dữ liệu nạp tiền" });

    const finalAmount = Math.round(Number(amount));
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const secretKey = process.env.MOMO_SECRET_KEY;
    
    if (!secretKey) {
      return res.status(500).json({ error: "MoMo secret key chưa được cấu hình" });
    }

    const orderId = `WALLET${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Nap tien vao vi #${wallet_id}`;

    const redirectUrl = `http://localhost:5173/customer/wallet?orderId=${orderId}&resultCode=0&type=wallet`;
    const ipnUrl = "http://localhost:5000/api/payments/momo/callback";
    const requestType = "captureWallet";

    const rawSignature = `accessKey=${accessKey}&amount=${finalAmount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature, "utf8")
      .digest("hex");

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: finalAmount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
      extraData: "",
    };

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
    );

    await db.query(
      `INSERT INTO transactions (order_id, wallet_id, type, amount, description, status) 
       VALUES (?, ?, 'deposit', ?, ?, 'pending')`,
      [orderId, wallet_id, amount, `Nạp tiền qua MoMo #${orderId}`],
    );

    res.json({ ...momoRes.data, payUrl: momoRes.data.payUrl });
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo giao dịch nạp tiền" });
  }
};

// Nhận IPN callback từ MoMo, cập nhật trạng thái thanh toán và số dư ví
export const momoIPN = async (req, res) => {
  try {
    const { orderId, resultCode, signature } = req.body;
    if (!orderId) return res.status(400).json({ message: "Thiếu orderId" });

    // Verify signature to prevent fake IPN
    const secretKey = process.env.MOMO_SECRET_KEY;
    if (secretKey && signature) {
      const rawSignature = `orderId=${orderId}&resultCode=${resultCode}&message=${req.body.message || ""}`;
      const expectedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error(`[MoMo IPN] Invalid signature for order ${orderId}`);
        return res.status(403).json({ message: "Invalid signature" });
      }
    }

    const status = resultCode === 0 ? "success" : "failed";

    if (orderId.startsWith("SHIP")) {
      await db.query("UPDATE payments SET status=? WHERE order_id=?", [
        status === "success" ? "completed" : "failed",
        orderId,
      ]);
      
      if (status === "success") {
        await db.query(
          "UPDATE shipments SET status = 'pending' WHERE id = (SELECT shipment_id FROM payments WHERE order_id = ? LIMIT 1)",
          [orderId]
        );
      }
    } else if (orderId.startsWith("WALLET")) {
      // Use transaction for wallet deposit to prevent race conditions
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        
        // Update transaction status with row lock
        await connection.query(
          "UPDATE transactions SET status=? WHERE order_id=? AND status='pending'",
          [status, orderId]
        );
        
        if (status === "success") {
          // Get transaction details with lock
          const [trans] = await connection.query(
            "SELECT wallet_id, amount FROM transactions WHERE order_id = ? FOR UPDATE",
            [orderId],
          );

          if (trans.length > 0) {
            const { wallet_id, amount } = trans[0];
            
            // Update wallet balance atomically
            await connection.query(
              "UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?",
              [amount, wallet_id],
            );
          }
        }
        
        await connection.commit();
      } catch (err) {
        await connection.rollback();
        console.error(`[MoMo IPN] Wallet deposit error for ${orderId}:`, err.message);
        return res.status(500).json({ message: "Lỗi xử lý nạp tiền" });
      } finally {
        connection.release();
      }
    }

    if (process.env.NODE_ENV !== "production") {
      let redirectUrl = "";
      if (orderId.startsWith("WALLET")) {
        redirectUrl = `http://localhost:5173/customer/wallet?orderId=${orderId}&resultCode=${resultCode}`;
      } else {
        redirectUrl = `http://localhost:5173/customer/payment-success?orderId=${orderId}&resultCode=${resultCode}`;
      }

      setTimeout(() => {
        res.redirect(redirectUrl);
      }, 1500);
      return;
    }

    res.json({ message: "IPN received", orderId, status });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xử lý IPN" });
  }
};

// Cập nhật trạng thái giao dịch thanh toán (admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query("UPDATE payments SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: " Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
};

// Xóa bản ghi thanh toán theo ID (admin)
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM payments WHERE id = ?", [id]);
    res.json({ message: "🗑️ Đã xóa thanh toán" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xóa thanh toán" });
  }
};

// Thanh toán đơn hàng bằng số dư ví, kiểm tra đủ tiền và trừ số dư (dùng transaction)
export const payShipmentByWallet = async (req, res) => {
  const { shipment_id, user_id, amount } = req.body;
  let connection;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    const [wallets] = await connection.query(
      "SELECT * FROM wallets WHERE user_id = ? FOR UPDATE",
      [user_id],
    );

    if (wallets.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Không tìm thấy ví" });
    }

    const wallet = wallets[0];

    if (Number(wallet.balance) < Number(amount)) {
      await connection.rollback();
      return res.status(400).json({ error: "Số dư ví không đủ để thanh toán" });
    }

    await connection.query(
      "UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?",
      [amount, wallet.id],
    );

    const transactionId = `TRANS${Date.now()}`;
    await connection.query(
      "INSERT INTO transactions (wallet_id, order_id, amount, type, description, status, created_at) VALUES (?, ?, ?, 'payment', ?, 'success', NOW())",
      [wallet.id, transactionId, amount, `Thanh toán đơn hàng #${shipment_id}`],
    );

    await connection.query(
      "UPDATE shipments SET payment_method = 'WALLET', status = 'pending' WHERE id = ?",
      [shipment_id],
    );

    await connection.query(
      "INSERT INTO payments (shipment_id, customer_id, amount, method, status, order_id) VALUES (?, ?, ?, 'WALLET', 'completed', ?)",
      [shipment_id, user_id, amount, transactionId],
    );

    await connection.commit();

    res.json({ message: "Thanh toán thành công", transactionId });
  } catch (err) {
    if (connection) await connection.rollback();

    res.status(500).json({ error: "Lỗi xử lý thanh toán ví" });
  } finally {
    if (connection) connection.release();
  }
};
