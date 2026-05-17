// ============================================
// Hằng số ứng dụng
// ============================================

// Phân trang
export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

// Mã OTP
export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const OTP_LENGTH = 6;

// JWT
export const JWT_EXPIRY = "1d";
export const JWT_RESET_EXPIRY = "15m";

// Loại dịch vụ
export const SERVICE_TYPE_NORMAL = "normal";
export const SERVICE_TYPE_EXPRESS = "express";
export const SERVICE_TYPE_FAST = "fast";

// Trạng thái đơn hàng
export const SHIPMENT_STATUS = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  PICKING: "picking",
  DELIVERING: "delivering",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELED: "canceled",
};

// Trạng thái phân công
export const ASSIGNMENT_STATUS = {
  ASSIGNED: "assigned",
  PICKING: "picking",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Phương thức thanh toán
export const PAYMENT_METHOD = {
  COD: "COD",
  WALLET: "WALLET",
  MOMO: "MOMO",
  CARD: "CARD",
};

// Trạng thái thanh toán
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Loại giao dịch
export const TRANSACTION_TYPE = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  PAYMENT: "payment",
  REFUND: "refund",
};

// Vai trò người dùng
export const USER_ROLE = {
  ADMIN: "admin",
  DISPATCHER: "dispatcher",
  DRIVER: "driver",
  CUSTOMER: "customer",
};

// Trạng thái tài xế
export const DRIVER_STATUS = {
  AVAILABLE: "available",
  FREE: "free",
  DELIVERING: "delivering",
  INACTIVE: "inactive",
};

// Trạng thái cuộc trò chuyện
export const CHAT_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
};

// Khu vực (dùng mặc định)
export const REGIONS = {
  HN: { code: "HN", name: "Hà Nội" },
  HCM: { code: "HCM", name: "TP. Hồ Chí Minh" },
  DN: { code: "DN", name: "Đà Nẵng" },
  CT: { code: "CT", name: "Cần Thơ" },
  HP: { code: "HP", name: "Hải Phòng" },
};

// Tiền tố mã đơn hàng
export const ORDER_PREFIX = {
  SHIPMENT: "SHIP",
  WALLET: "WALLET",
  TRANSACTION: "TRANS",
};

// Thiết lập bản đồ
export const MAP_ZOOM_DEFAULT = 12;
export const MAP_ZOOM_MIN = 1;
export const MAP_ZOOM_MAX = 20;
