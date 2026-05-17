import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "../../lib/toast";
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

  const { shipment_id: initialShipmentId, payload, amount, shipping_fee, cod, cod_payer = "customer" } = location.state || {};
  const isCustomerPay = cod_payer === "customer";

  const [shipmentId, setShipmentId] = useState(initialShipmentId);
  const [paymentMethod, setPaymentMethod] = useState(isCustomerPay ? "Wallet" : "COD");
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
    if (!initialShipmentId && !payload) {
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
  }, [initialShipmentId, payload, amount, navigate, currentUserId]);

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
      let currentShipmentId = shipmentId;
      
      // Nếu chưa có shipment_id (từ trang tạo đơn chuyển sang), thì gọi API tạo đơn trước
      if (!currentShipmentId && payload) {
        const res = await API.post("/shipments", payload);
        currentShipmentId = res.data.id || res.data.shipmentId || res.data.insertId;
        
        if (currentShipmentId) {
          setShipmentId(currentShipmentId);
        } else {
          throw new Error("Không lấy được mã đơn hàng mới.");
        }
      }

      if (paymentMethod === "Wallet") {
        if (walletBalance < Number(amount)) {
          toast.error("Số dư ví không đủ. Vui lòng nạp thêm!");
          setLoading(false);
          return;
        }

        await API.post("/payments/wallet-pay", {
          shipment_id: currentShipmentId,
          user_id: Number(currentUserId),
          amount: Number(amount),
        });

        toast.success("Thanh toán ví thành công!");
        sessionStorage.removeItem("createShipmentData");
        navigate(
          `/customer/payment-success?orderId=SHIP${currentShipmentId}&resultCode=0&type=shipment`,
        );
      } else if (paymentMethod === "Momo") {
        const res = await API.post("/payments/momo", {
          shipment_id: currentShipmentId,
          customer_id: Number(currentUserId),
          amount: Number(amount),
        });

        if (res.data && res.data.payUrl) {
          setMomoUrl(res.data.payUrl);
          setShowMomoPopup(true);
          startCheckingPayment(currentShipmentId);
        } else {
          toast.error("Lỗi lấy link thanh toán MoMo");
          setLoading(false);
        }
      } else {
        await API.post("/payments", {
          shipment_id: currentShipmentId,
          customer_id: Number(currentUserId),
          amount: Number(amount),
          method: "COD",
        });
        sessionStorage.removeItem("createShipmentData");
        navigate(
          `/customer/payment-success?orderId=SHIP${currentShipmentId}&resultCode=0&type=shipment`,
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Thanh toán/Tạo đơn thất bại");
      setLoading(false);
    }
  };

  const startCheckingPayment = (checkShipmentId) => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/payments`);
        const payment = res.data.find(
          (p) =>
            Number(p.shipment_id) === Number(checkShipmentId) &&
            (p.status === "completed" || p.status === "success"),
        );

        if (payment) {
          clearInterval(checkIntervalRef.current);
          setShowMomoPopup(false);
          toast.success("Thanh toán MoMo thành công!");
          sessionStorage.removeItem("createShipmentData");
          navigate(
            `/customer/payment-success?orderId=${
              payment.order_id || "UNKNOWN"
            }&resultCode=0&type=shipment`,
          );
        }
      } catch (err) {}
    }, 3000);
  };

  const closePopup = () => {
    setShowMomoPopup(false);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    setLoading(false);
  };

  if (!initialShipmentId && !payload) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 flex items-center justify-center animate-in fade-in duration-500 relative">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Phần giao diện */}
        <div className="lg:col-span-3 space-y-6">
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
              {isCustomerPay && (
                <>
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

                  <div
                    onClick={() => setPaymentMethod("Momo")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      paymentMethod === "Momo"
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-100 hover:border-pink-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img src="/assets/logo/Logo MoMo Square.png" className="w-12 h-12 rounded-xl shadow-sm" alt="MoMo" />
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
                </>
              )}

              {/* Phần giao diện - Chỉ hiện COD khi người nhận thanh toán */}
              {!isCustomerPay && (
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
                      Xác nhận tạo đơn
                    </p>
                    <p className="text-sm text-gray-500">Người nhận trả phí ship & COD</p>
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
              )}
            </div>
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100/50 sticky top-10">
            <h3 className="text-xl font-bold text-[#113e48] mb-5 flex items-center gap-2">
              <Package size={22} className="text-orange-500" /> Thông tin thanh toán
            </h3>
            
            {/* Box chứa thông tin chi tiết */}
            <div className="bg-gray-50/80 rounded-2xl p-5 mb-6 space-y-4 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Mã đơn:</span>
                <span className="font-mono font-bold text-[#113e48] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                  #{shipmentId || "Chờ tạo"}
                </span>
              </div>
              
              {payload && (
                <>
                  <div className="h-px bg-gray-200/60 my-2"></div>
                  <div>
                    <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Thông tin người nhận:</span>
                    <p className="font-bold text-gray-800">{payload.receiver_name}</p>
                    <p className="text-gray-600 text-sm mt-0.5">{payload.receiver_phone}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{payload.delivery_address}</p>
                  </div>
                  <div className="h-px bg-gray-200/60 my-2"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Hàng hóa:</span>
                      <p className="font-medium text-gray-800 text-sm max-w-[150px] truncate" title={payload.item_name}>{payload.item_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 font-medium text-xs uppercase tracking-wider block mb-1">Trọng lượng:</span>
                      <p className="font-bold text-[#113e48] text-sm">{payload.weight_kg} kg</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4 text-sm mb-6 px-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Người thanh toán:</span>
                <span className={`font-bold px-2 py-1 rounded text-xs uppercase tracking-wider ${isCustomerPay ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isCustomerPay ? "Bạn (Người gửi)" : "Người nhận thanh toán"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-bold text-gray-800 text-base">
                  {Number(shipping_fee || 0).toLocaleString()}<span className="text-xs text-gray-400 ml-0.5">₫</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  Tiền thu hộ (COD):
                </span>
                <div className="text-right flex flex-col items-end">
                  <span className="font-bold text-gray-800 text-base">
                    {Number(cod || 0).toLocaleString()}<span className="text-xs text-gray-400 ml-0.5">₫</span>
                  </span>
                  {!isCustomerPay && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">(Người nhận trả)</span>}
                </div>
              </div>
            </div>

            {isCustomerPay ? (
              <div className="flex flex-col items-end gap-1.5 p-5 bg-orange-50 rounded-2xl border border-orange-100/60 mb-6">
                <span className="font-bold text-[#113e48] text-sm uppercase tracking-wider">Tổng cộng bạn cần trả:</span>
                <span className="text-3xl font-black text-orange-600 tracking-tight">
                  {Number(amount).toLocaleString()}<span className="text-xl font-bold ml-1">₫</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1.5 p-5 bg-emerald-50 rounded-2xl border border-emerald-100/60 mb-6">
                <span className="font-bold text-emerald-800 text-sm uppercase tracking-wider">Số tiền người nhận phải trả:</span>
                <span className="text-3xl font-black text-emerald-600 tracking-tight">
                  {Number((shipping_fee || 0) + Number(cod || 0)).toLocaleString()}<span className="text-xl font-bold ml-1">₫</span>
                </span>
              </div>
            )}

            {!isCustomerPay ? (
              <div className="bg-blue-50 p-3.5 rounded-xl text-xs text-blue-700 flex items-start gap-2 border border-blue-100 mb-6 leading-relaxed">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <p>
                  <span className="font-bold">Lưu ý:</span> Người nhận sẽ thanh toán <span className="font-bold">{Number((shipping_fee || 0) + Number(cod || 0)).toLocaleString()}₫</span> (bao gồm phí vận chuyển và COD) cho tài xế khi nhận hàng. Bạn không cần thanh toán thêm bất kỳ chi phí nào ở bước này.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 p-3.5 rounded-xl text-xs text-orange-700 flex items-start gap-2 border border-orange-100 mb-6 leading-relaxed">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-orange-500" />
                <p>
                  <span className="font-bold">Lưu ý:</span> Bạn (người gửi) sẽ thanh toán toàn bộ chi phí. Tài xế sẽ <span className="font-bold">không thu tiền</span> từ người nhận khi giao hàng.
                </p>
              </div>
            )}

            {/* Hiển thị có điều kiện */}
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

      {/* Hiển thị có điều kiện */}
      {showMomoPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-2 w-full max-w-5xl h-[85vh] relative flex flex-col items-center">
            <div className="w-full flex justify-between items-center p-3 border-b border-gray-100 mb-2">
              <h3 className="text-lg font-bold text-pink-600 flex items-center gap-2">
                <img src="/assets/logo/Logo MoMo Square.png" className="w-6 h-6 rounded" alt="MoMo" />
                Cổng thanh toán MoMo
              </h3>
              <button
                onClick={closePopup}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="w-full h-full bg-gray-50 rounded-xl overflow-hidden relative">
              <iframe
                src={momoUrl}
                title="MoMo Payment"
                className="w-full h-full border-none"
              ></iframe>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center bg-white/50 -z-10">
                <Loader2 className="animate-spin text-pink-500" />
              </div>
            </div>
            <div className="w-full flex items-center justify-between px-2 mt-2 pb-2">
              <p className="text-xs text-gray-500">
                Đang chờ thanh toán... Popup sẽ tự đóng khi hoàn tất.
              </p>
              <button
                onClick={async () => {
                  closePopup();
                  navigate(`/customer/payment-success?orderId=CANCELLED&resultCode=1&type=shipment`);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl border border-red-200 transition-all flex items-center gap-1.5"
              >
                <X size={14} /> Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
