import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  Package,
  Home,
  ArrowRight,
} from "lucide-react";

export default function PaymentResult() {
  const [params] = useSearchParams();

  // 1. Lấy kết quả từ URL do MoMo trả về
  const orderId = params.get("orderId");
  const resultCode = params.get("resultCode"); // 0 = Thành công, Khác 0 = Thất bại
  const type = params.get("type"); // shipment hoặc wallet

  const isSuccess = resultCode === "0";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập loading nhẹ để UX mượt hơn
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cấu hình nút bấm quay về đâu
  const backLink = type === "wallet" ? "/customer/wallet" : "/customer/history";
  const backLabel =
    type === "wallet" ? "Về ví của tôi" : "Xem lịch sử đơn hàng";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100"
      >
        {isLoading ? (
          <div className="py-10">
            <Loader2 className="animate-spin text-blue-500 w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-500">Đang xác thực giao dịch...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              {isSuccess ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle
                    className="text-green-600 w-10 h-10"
                    strokeWidth={3}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="text-red-600 w-10 h-10" strokeWidth={3} />
                </div>
              )}
            </div>

            <h1
              className={`text-2xl font-bold mb-2 ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>

            <p className="text-gray-500 mb-6 text-sm">
              {isSuccess
                ? `Cảm ơn bạn! Đơn hàng #${orderId} đã được thanh toán.`
                : "Giao dịch bị hủy hoặc xảy ra lỗi. Vui lòng thử lại."}
            </p>

            <div className="space-y-3">
              <Link
                to={backLink}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
                  isSuccess
                    ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {type === "wallet" ? (
                  <Wallet size={18} />
                ) : (
                  <Package size={18} />
                )}
                {backLabel}
              </Link>

              {!isSuccess && (
                <Link
                  to="/customer/create-order"
                  className="w-full py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} /> Thử lại
                </Link>
              )}

              <Link
                to="/customer"
                className="block text-sm text-gray-400 hover:text-gray-600 mt-4"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
