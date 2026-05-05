
import { useEffect, useState } from "react";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  XCircle,
  CalendarClock,
  Truck,
  MapPin,
  Phone,
  User,
  ChevronDown,
  X,
  RotateCcw,
  Ban,
  Rocket,
} from "lucide-react";

const MAX_FAILS = 3;

// Bảng đơn hàng giao thất bại cần xử lý
export default function FailedShipmentsPanel() {
  const [failedList, setFailedList] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [submitting, setSubmitting] = useState(false);

// Tải dữ liệu từ server
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFailed, resDrivers] = await Promise.all([
        API.get("/dispatcher/shipments/failed"),
        API.get("/dispatcher/drivers"),
      ]);
      setFailedList(resFailed.data);
      setDrivers(resDrivers.data);
    } catch (err) {
      toast.error("Không thể tải dữ liệu đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const defaultTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const openReschedule = (shipment) => {
    setActionModal({ shipment, mode: "reschedule" });
    setSelectedDate(defaultTomorrow());
    setSelectedDriver("");
  };

  const openCancel = (shipment) => {
    setActionModal({ shipment, mode: "cancel" });
  };

  const handleReschedule = async () => {
    setSubmitting(true);
    try {
      await API.post(
        `/dispatcher/shipments/${actionModal.shipment.id}/reschedule`,
        {
          scheduled_date: selectedDate,
          driver_id: selectedDriver || undefined,
        },
      );
      toast.success(
        `Đã lên lịch giao lại vào ${new Date(selectedDate).toLocaleDateString("vi-VN")}`,
      );
      setActionModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi giao lại");
    } finally {
      setSubmitting(false);
    }
  };

// Hủy thao tác
  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await API.post(`/dispatcher/shipments/${actionModal.shipment.id}/cancel`);
      toast.success(`🗑️ Đã hủy đơn hàng thành công`);
      setActionModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi hủy đơn");
    } finally {
      setSubmitting(false);
    }
  };

  const failBadge = (count) => {
    const n = count || 0;
    if (n >= MAX_FAILS)
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
          🔴 {n}/3 — Được phép hủy
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
        ⚠️ {n}/3 lần thất bại
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 pb-20 space-y-6">
      <Toaster position="top-right" />

      {/* Phần giao diện */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setActionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {actionModal.mode === "reschedule" ? (
                <>
                  {/* Phần giao diện */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <CalendarClock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">
                          Giao lại đơn hàng
                        </h3>
                        <p className="text-blue-100 text-xs">
                          #{actionModal.shipment.tracking_code}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActionModal(null)}
                      className="text-white/70 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Render điều kiện */}
                    {actionModal.shipment.failure_note && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                        <p className="font-bold text-xs text-red-400 mb-1">
                          LÝ DO THẤT BẠI
                        </p>
                        {actionModal.shipment.failure_note}
                      </div>
                    )}

                    {/* Phần giao diện */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                        📅 Ngày giao lại
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={defaultTomorrow()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                    </div>

                    {/* Phần giao diện */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                        🚴 Phân công tài xế mới{" "}
                        <span className="text-gray-400 font-normal">
                          (tùy chọn)
                        </span>
                      </label>
                      <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                      >
                        <option value="">— Không phân công ngay —</option>
                        {drivers
                          .filter(
                            (d) => d.id !== actionModal.shipment.last_driver_id,
                          )
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.vehicle_type || "Xe máy"})
                            </option>
                          ))}
                      </select>
                      {selectedDriver && (
                        <p className="text-xs text-blue-600 mt-1">
                          Đơn sẽ được phân công ngay cho tài xế này
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setActionModal(null)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={handleReschedule}
                        disabled={!selectedDate || submitting}
                        className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <RotateCcw size={16} />
                        )}
                        Lên lịch giao lại
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Phần giao diện */}
                  <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Ban size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">Hủy đơn hàng</h3>
                        <p className="text-gray-300 text-xs">
                          #{actionModal.shipment.tracking_code}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActionModal(null)}
                      className="text-white/70 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                      <p className="font-bold text-yellow-700 text-sm">
                        ⚠️ Xác nhận hủy đơn hoàn toàn?
                      </p>
                      <p className="text-yellow-600 text-xs mt-1">
                        Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy và
                        khách hàng sẽ được thông báo.
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                      <p>
                        <span className="text-gray-500">Mã đơn:</span>{" "}
                        <span className="font-bold">
                          {actionModal.shipment.tracking_code}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Người nhận:</span>{" "}
                        <span className="font-bold">
                          {actionModal.shipment.receiver_name}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Số lần thất bại:</span>{" "}
                        <span className="font-bold text-red-600">
                          {actionModal.shipment.total_fails ||
                            actionModal.shipment.fail_count ||
                            0}{" "}
                          lần
                        </span>
                      </p>
                      {actionModal.shipment.failure_note && (
                        <p>
                          <span className="text-gray-500">Lý do cuối:</span>{" "}
                          <span className="italic text-gray-700">
                            {actionModal.shipment.failure_note}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setActionModal(null)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Quay lại
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold transition disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Ban size={16} />
                        )}
                        Xác nhận Hủy đơn
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phần giao diện */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={26} />
            Cần xử lý gấp
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Các đơn hàng giao thất bại — chọn giao lại hoặc hủy đơn
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Render điều kiện */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-orange-500">
              {failedList.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Đơn thất bại</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-red-600">
              {
                failedList.filter((s) => (s.total_fails || 0) >= MAX_FAILS)
                  .length
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">Đủ điều kiện hủy</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-blue-600">
              {failedList.filter((s) => s.service_type === "fast").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hỏa tốc thất bại</p>
          </div>
        </div>
      )}

      {/* Phần giao diện */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100"
            />
          ))
        ) : failedList.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center text-gray-400">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <XCircle size={32} className="text-green-400" />
            </div>
            <p className="font-bold text-gray-500">
              Không có đơn nào thất bại!
            </p>
            <p className="text-sm mt-1">
              Tất cả đơn hàng đang được giao bình thường.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {failedList.map((s, i) => {
              const isExpressOrder = s.service_type === "fast";
              const failsCount = s.total_fails || s.fail_count || 0;

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                    isExpressOrder
                      ? "border-red-200 ring-1 ring-red-100"
                      : "border-orange-100"
                  }`}
                >
                  {/* Phần giao diện */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isExpressOrder && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                          <Rocket size={10} /> Hỏa tốc
                        </span>
                      )}
                      <h3 className="font-bold text-gray-800">
                        {s.tracking_code}
                      </h3>
                      {failBadge(failsCount)}
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      {s.failed_at
                        ? new Date(s.failed_at).toLocaleDateString("vi-VN")
                        : "--"}
                    </p>
                  </div>

                  {/* Phần giao diện */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {s.receiver_name} — {s.receiver_phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {s.driver_name || "Chưa có tài xế"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                      <MapPin
                        size={14}
                        className="text-gray-400 mt-0.5 shrink-0"
                      />
                      <span className="line-clamp-1">{s.delivery_address}</span>
                    </div>
                  </div>

                  {/* Render điều kiện */}
                  {s.failure_note && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs font-bold text-red-400 mb-0.5">
                        Lý do thất bại
                      </p>
                      <p className="text-sm text-red-700">{s.failure_note}</p>
                    </div>
                  )}

                  {/* Phần giao diện */}
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => openReschedule(s)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold transition"
                    >
                      <CalendarClock size={15} />
                      Giao lại ngày mai
                    </button>

                    <button
                      onClick={() => openCancel(s)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold transition"
                    >
                      <Ban size={15} />
                      Hủy đơn
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}