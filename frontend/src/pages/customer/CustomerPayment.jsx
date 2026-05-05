import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  CreditCard,
  Banknote,
  ChevronLeft,
  Package,
  ShieldCheck,
  Loader2,
  X,
  Wallet,
} from "lucide-react";

// Thanh toán đơn hàng
export default function CustomerPayment() {
  const location = useLocation();
  const navigate = useNavigate();


  const { shipment_id, amount, cod } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("Wallet");
  const [loading, setLoading] = useState(false);


  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [showMomoPopup, setShowMomoPopup] = useState(false);
  const [momoUrl, setMomoUrl] = useState("");
  const checkIntervalRef = useRef(null);


  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr).id;
      } catch (e) {
        return localStorage.getItem("userId");
      }
    }
    return localStorage.getItem("userId");
  };
  const currentUserId = getUserId();


  useEffect(() => {
    if (!shipment_id || !amount) {
      toast.error("Không tìm thấy thông tin đơn hàng!");
      navigate("/customer/create-order");
      return;
    }


    if (currentUserId) {
      API.get(`/wallet/${currentUserId}`)
        .then((res) => setWalletBalance(Number(res.data.balance)))
        .catch((err) => console.error("Lỗi tải ví:", err))
        .finally(() => setLoadingWallet(false));
    }
  }, [shipment_id, amount, navigate, currentUserId]);

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);


// Xử lý thanh toán
  const handlePayment = async () => {
    if (!currentUserId) return toast.error("Vui lòng đăng nhập lại.");
    setLoading(true);

    try {

      if (paymentMethod === "Wallet") {
        if (walletBalance < Number(amount)) {
          toast.error("Số dư ví không đủ. Vui lòng nạp thêm!");
          setLoading(false);
          return;
        }


        await API.post("/payments/wallet-pay", {
          shipment_id: shipment_id,
          user_id: Number(currentUserId),
          amount: Number(amount),
        });

        toast.success("Thanh toán ví thành công!");
        navigate(
          `/customer/payment-success?orderId=SHIP${shipment_id}&resultCode=0&type=shipment`
        );
      }


      else if (paymentMethod === "Momo") {
        const res = await API.post("/payments/momo", {
          shipment_id: shipment_id,
          customer_id: Number(currentUserId),
          amount: Number(amount),
        });

        if (res.data && res.data.payUrl) {
          setMomoUrl(res.data.payUrl);
          setShowMomoPopup(true);
          startCheckingPayment();
        } else {
          toast.error("Lỗi lấy link thanh toán MoMo");
          setLoading(false);
        }
      }


      else {
        await API.post("/payments", {
          shipment_id: shipment_id,
          customer_id: Number(currentUserId),
          amount: Number(amount),
          method: "COD",
        });
        navigate(
          `/customer/payment-success?orderId=SHIP${shipment_id}&resultCode=0&type=shipment`
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Thanh toán thất bại");
      setLoading(false);
    }
  };


  const startCheckingPayment = () => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/payments`);
        const payment = res.data.find(
          (p) =>
            Number(p.shipment_id) === Number(shipment_id) &&
            (p.status === "completed" || p.status === "success")
        );

        if (payment) {
          clearInterval(checkIntervalRef.current);
          setShowMomoPopup(false);
          toast.success("Thanh toán MoMo thành công!");
          navigate(
            `/customer/payment-success?orderId=${
              payment.order_id || "UNKNOWN"
            }&resultCode=0&type=shipment`
          );
        }
      } catch (err) {
      }
    }, 3000);
  };

  const closePopup = () => {
    setShowMomoPopup(false);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    setLoading(false);
  };

  if (!shipment_id) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 flex items-center justify-center animate-in fade-in duration-500 relative">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Phần giao diện */}
        <div className="md:col-span-2 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#113e48] font-bold transition-colors"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-extrabold text-[#113e48] mb-6 flex items-center gap-2">
              <CreditCard className="text-blue-600" /> Phương thức thanh toán
            </h2>

            <div className="space-y-4">
              {/* Phần giao diện */}
              <div
                onClick={() => setPaymentMethod("Wallet")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  paymentMethod === "Wallet"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-100 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Wallet size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      Ví của tôi
                    </p>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      Số dư:{" "}
                      {loadingWallet ? (
                        <Loader2 className="animate-spin w-3 h-3" />
                      ) : (
                        <span className="font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-100">
                          {walletBalance.toLocaleString()} ₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "Wallet"
                      ? "border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "Wallet" && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Phần giao diện */}
              <div
                onClick={() => setPaymentMethod("Momo")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  paymentMethod === "Momo"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-100 hover:border-pink-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                    className="w-12 h-12 rounded-xl shadow-sm"
                    alt="MoMo"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Ví MoMo</p>
                    <p className="text-sm text-gray-500">Quét mã QR</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "Momo"
                      ? "border-pink-500"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "Momo" && (
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Phần giao diện */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  paymentMethod === "COD"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 hover:border-green-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Banknote size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      Tiền mặt (COD)
                    </p>
                    <p className="text-sm text-gray-500">Thanh toán khi nhận</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "COD"
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "COD" && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-10">
            <h3 className="text-lg font-bold text-[#113e48] mb-4 flex items-center gap-2">
              <Package size={18} /> Chi tiết đơn hàng
            </h3>
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Mã đơn:</span>
                <span className="font-mono font-bold text-[#113e48]">
                  #{shipment_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>COD:</span>
                <span className="font-medium">
                  {Number(cod).toLocaleString()}₫
                </span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between items-center text-base">
                <span className="font-bold text-[#113e48]">Tổng:</span>
                <span className="text-2xl font-extrabold text-orange-600">
                  {Number(amount).toLocaleString()}₫
                </span>
              </div>
            </div>

            {/* Render điều kiện */}
            {paymentMethod === "Wallet" && walletBalance < Number(amount) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium text-center">
                Số dư ví không đủ. Vui lòng nạp thêm.
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={
                loading ||
                (paymentMethod === "Wallet" && walletBalance < Number(amount))
              }
              className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-70 ${
                paymentMethod === "Momo"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : paymentMethod === "Wallet"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : paymentMethod === "Momo" ? (
                "Thanh toán MoMo"
              ) : paymentMethod === "Wallet" ? (
                "Thanh toán ngay"
              ) : (
                "Xác nhận COD"
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} /> Bảo mật 100%
            </div>
          </div>
        </div>
      </div>

      {/* Render điều kiện */}
      {showMomoPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-2 w-full max-w-5xl h-[85vh] relative flex flex-col items-center">
            <div className="w-full flex justify-between items-center p-3 border-b">
              <h3 className="font-bold text-pink-600 flex items-center gap-2">
                MoMo Payment
              </h3>
              <button
                onClick={closePopup}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X />
              </button>
            </div>
            <iframe
              src={momoUrl}
              className="w-full h-full border-none"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}