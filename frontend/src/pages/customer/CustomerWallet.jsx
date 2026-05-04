import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";

// Quản lý ví điện tử
export default function CustomerWallet() {
  const [searchParams] = useSearchParams();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInputModal, setShowInputModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const [txPage, setTxPage] = useState(1);
  const txPerPage = 8;

  const [showMomoPopup, setShowMomoPopup] = useState(false);
  const [momoUrl, setMomoUrl] = useState("");
  const checkIntervalRef = useRef(null);

  const customerId =
    localStorage.getItem("userId") || localStorage.getItem("customer_id");

  // Tải dữ liệu từ server
  const fetchData = async () => {
    try {
      const resWallet = await API.get(`/wallet/${customerId}`);
      setWallet(resWallet.data);

      if (resWallet.data?.id) {
        const resTrans = await API.get(
          `/wallet/transactions/${resWallet.data.id}`,
        );
        setTransactions(resTrans.data);
      }
    } catch (err) {
      toast.error("Lỗi tải thông tin ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchData();
    return () => clearInterval(checkIntervalRef.current);
  }, [customerId]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10000) {
      return toast.error("Vui lòng nạp tối thiểu 10.000đ");
    }

    setProcessing(true);
    try {
      const res = await API.post("/payments/momo-deposit", {
        wallet_id: wallet.id,
        amount: Number(amount),
      });

      if (res.data && res.data.payUrl) {
        setShowInputModal(false);
        setMomoUrl(res.data.payUrl);
        setShowMomoPopup(true);

        const currentBalance = Number(wallet.balance);

        startCheckingDeposit(currentBalance);
      } else {
        toast.error("Không lấy được link thanh toán MoMo");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến cổng thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  const startCheckingDeposit = (oldBalance) => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/wallet/${customerId}`);
        const newBalance = Number(res.data.balance);
        const newWalletData = res.data;

        if (newBalance > oldBalance) {
          clearInterval(checkIntervalRef.current);
          setShowMomoPopup(false);
          setWallet(newWalletData);

          const resTrans = await API.get(
            `/wallet/transactions/${newWalletData.id}`,
          );
          setTransactions(resTrans.data);

          toast.success(
            `🎉 Nạp thành công +${(newBalance - oldBalance).toLocaleString()}đ`,
          );
          setAmount("");
        }
      } catch (err) {}
    }, 3000);
  };

  const closeMomoPopup = () => {
    setShowMomoPopup(false);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    fetchData();
  };

  const totalDeposit = transactions
    .filter((t) => t.type === "deposit" && t.status === "success")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSpent = transactions
    .filter(
      (t) =>
        (t.type === "payment" || t.type === "withdraw") &&
        t.status === "success",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const txTotalPages = Math.ceil(transactions.length / txPerPage);
  const txStart = (txPage - 1) * txPerPage;
  const currentTransactions = transactions.slice(txStart, txStart + txPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#113e48] to-[#0f2a30] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                Số dư khả dụng
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                {wallet ? Number(wallet.balance).toLocaleString() : 0} ₫
              </h2>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <Wallet size={32} className="text-orange-400" />
            </div>
          </div>
          <div className="relative z-10 mt-10 flex gap-4">
            <button
              onClick={() => setShowInputModal(true)}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20"
            >
              <ArrowUpRight size={20} /> Nạp qua MoMo
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-md border border-white/10 cursor-not-allowed opacity-60">
              <CreditCard size={20} /> Rút tiền
            </button>
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng chi tiêu</p>
              <p className="text-xl font-bold text-[#113e48]">
                {totalSpent.toLocaleString()} ₫
              </p>
            </div>
          </div>
          <div className="h-[1px] bg-gray-100 w-full mb-6"></div>
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span>Tổng nạp:</span>
              <span className="font-bold text-green-600">
                +{totalDeposit.toLocaleString()} ₫
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 pt-1">
              Trạng thái ví:{" "}
              <span className="font-bold text-green-500 uppercase">
                {wallet?.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-[#113e48] text-lg flex items-center gap-2">
            <History size={20} className="text-gray-400" /> Lịch sử giao dịch
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4 text-center">Ngày</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                      #{t.order_id || t.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#113e48]">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            t.type === "deposit"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {t.type === "deposit" ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <span
                          className="truncate max-w-[200px]"
                          title={t.description}
                        >
                          {t.description ||
                            (t.type === "deposit" ? "Nạp tiền" : "Thanh toán")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {new Date(t.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        t.type === "deposit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "deposit" ? "+" : "-"}
                      {Number(t.amount).toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          t.status === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {t.status === "success" ? "Thành công" : "Đang xử lý"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-400 italic"
                  >
                    Chưa có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={txPage}
          totalPages={txTotalPages}
          onPageChange={setTxPage}
        />
      </div>

      {}
      {showInputModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#113e48] flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                  className="w-6 h-6 rounded"
                  alt="MoMo"
                />
                Nạp tiền qua MoMo
              </h3>
              <button
                onClick={() => setShowInputModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền muốn nạp
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 pr-12 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-pink-600"
                    placeholder="VD: 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    ₫
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Tối thiểu 10.000 ₫</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {processing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Thanh toán ngay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showMomoPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-2 w-full max-w-5xl h-[85vh] relative flex flex-col items-center">
            {}
            <div className="w-full flex justify-between items-center p-3 border-b border-gray-100 mb-2">
              <h3 className="text-lg font-bold text-pink-600 flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                  className="w-6 h-6 rounded"
                  alt=""
                />
                Cổng thanh toán MoMo
              </h3>
              <button
                onClick={closeMomoPopup}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {}
            <div className="w-full h-full bg-gray-50 rounded-xl overflow-hidden relative">
              <iframe
                src={momoUrl}
                title="MoMo Deposit"
                className="w-full h-full border-none"
              ></iframe>

              {}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center bg-white/50 -z-10">
                <Loader2 className="animate-spin text-pink-500" />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 pb-2">
              Đang chờ thanh toán... Popup sẽ tự đóng khi hoàn tất.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
