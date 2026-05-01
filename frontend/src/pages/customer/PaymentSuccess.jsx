import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const resultCode = params.get("resultCode");
  const isSuccess = resultCode === "0";

  const [isLoading, setIsLoading] = useState(params.get("loading") === "true");

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center border border-gray-100"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="flex justify-center mb-6"
            >
              <Loader2 className="text-blue-500 w-16 h-16" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-gray-500">
              Vui lòng đợi trong giây lát ⏳<br />
              Hệ thống đang xác nhận giao dịch từ MoMo.
            </p>
          </>
        ) : (
          <>
            {/* ICON */}
            <div className="flex justify-center mb-5">
              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="text-green-500 w-20 h-20 drop-shadow-lg" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <XCircle className="text-red-500 w-20 h-20 drop-shadow-lg" />
                </motion.div>
              )}
            </div>

            {/* TITLE */}
            <h1
              className={`text-3xl font-extrabold mb-3 ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
            </h1>

            <p className="text-gray-600 mb-2">
              Mã đơn hàng: <span className="font-semibold">{orderId}</span>
            </p>
            <p className="text-gray-500 mb-6">
              {isSuccess
                ? "Cảm ơn bạn đã tin tưởng SpeedyShip 🚀"
                : "Vui lòng kiểm tra lại hoặc thử lại sau."}
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/customer/history"
                className="px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90 shadow-md transition"
              >
                Xem lịch sử đơn hàng
              </Link>

              {isSuccess ? (
                <Link
                  to="/customer"
                  className="px-6 py-3 rounded-lg text-blue-600 font-semibold border border-blue-400 hover:bg-blue-50 transition"
                >
                  Trang khách hàng
                </Link>
              ) : (
                <Link
                  to="/customer/payment"
                  className="px-6 py-3 rounded-lg text-red-600 font-semibold border border-red-400 hover:bg-red-50 transition"
                >
                  Thử thanh toán lại
                </Link>
              )}
            </div>
          </>
        )}

        <div className="mt-8 text-sm text-gray-400">
          © {new Date().getFullYear()} SpeedyShip · Secure Payment Gateway
        </div>
      </motion.div>
    </div>
  );
}
