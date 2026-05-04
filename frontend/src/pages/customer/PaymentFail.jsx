import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

// Thanh toán thất bại
export default function PaymentFail() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-4">
      <XCircle className="text-red-600 w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold text-red-700 mb-2">
        ❌ Thanh toán thất bại
      </h1>
      <p className="text-gray-700 mb-6">
        Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn
        phương thức khác.
      </p>
      <div className="flex gap-4">
        <Link
          to="/customer/payment"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
        >
          🔁 Thử lại
        </Link>
        <Link
          to="/customer/history"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
        >
          🏠 Về lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
}
