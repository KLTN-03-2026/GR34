
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../../components/Pagination";
import {
  Truck,
  MapPin,
  Package,
  Clock,
  Search,
  CheckCircle2,
  MoreVertical,
  Navigation2,
  ClipboardList,
  PackageOpen,
  XCircle,
  ChevronDown,
  Rocket,
  Zap,
  AlertTriangle,
  X,
} from "lucide-react";


const STATUS_CONFIG = {
  assigned: {
    label: "Đã nhận đơn",
    icon: ClipboardList,
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
    buttonBg: "bg-white border-gray-300 text-gray-700",
  },
  picking: {
    label: "Đang lấy hàng",
    icon: PackageOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    buttonBg: "bg-orange-600 text-white border-transparent",
  },
  delivering: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    buttonBg: "bg-blue-600 text-white border-transparent",
  },
  completed: {
    label: "Hoàn tất",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    buttonBg: "bg-green-600 text-white border-transparent",
  },
  failed: {
    label: "Giao thất bại",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    buttonBg: "bg-red-600 text-white border-transparent",
  },
};


const StatusDropdown = ({ currentStatus, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.assigned;
  const CurrentIcon = CurrentConfig.icon;

  if (disabled) {
    return (
      <div
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${CurrentConfig.bg} ${CurrentConfig.color} opacity-80 cursor-not-allowed border ${CurrentConfig.border}`}
      >
        <CurrentIcon size={18} /> {CurrentConfig.label}
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      ref={dropdownRef}

      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 ${CurrentConfig.buttonBg}`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon size={18} />
          <span>{CurrentConfig.label}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-full mb-2 right-0 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              if (key === currentStatus || key === "assigned") return null;

              const ItemIcon = config.icon;
              return (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(key);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div
                    className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}
                  >
                    <ItemIcon size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// Danh sách đơn được phân công cho tài xế
export default function DriverAssignments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const [failedModal, setFailedModal] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const FAILED_REASONS = [
    "Khách hàng không có người nhận",
    "Sai địa chỉ giao hàng",
    "Khách hủy đơn hàng",
    "Hàng bị hư hỏng trong khi vận chuyển",
    "Tài xế gặp sự cố trên đường",
    "Vượt khu vực giao hàng",
  ];

// Tải danh sách đơn hàng được phân công
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/drivers/assignments/${id}`);
      setAssignments(res.data);
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [id]);

// Xử lý thay đổi trạng thái
  const handleStatusChange = async (shipmentId, status, tracking_code) => {

    if (status === 'failed') {
      setFailedModal({ shipmentId, tracking_code });
      setSelectedReason("");
      setCustomReason("");
      return;
    }
    const toastId = toast.loading("Đang cập nhật...");
    try {
      await API.patch(`/drivers/shipments/${shipmentId}/status`, { status });
      setAssignments((prev) =>
        prev.map((a) =>
          a.shipment_id === shipmentId ? { ...a, status: status } : a
        )
      );
      toast.success("Đã cập nhật trạng thái!", { id: toastId });
    } catch {
      toast.error("❌ Lỗi cập nhật trạng thái!", { id: toastId });
      fetchAssignments();
    }
  };

// Xác nhận đơn giao thất bại
  const handleConfirmFailed = async () => {
    const reason = selectedReason || customReason.trim();
    if (!reason) {
      toast.error("Vui lòng chọn hoặc nhập lý do thất bại!");
      return;
    }
    const { shipmentId } = failedModal;
    const toastId = toast.loading("Đang cập nhật...");
    try {
      await API.patch(`/drivers/shipments/${shipmentId}/status`, {
        status: 'failed',
        note: reason,
      });
      setAssignments((prev) =>
        prev.map((a) =>
          a.shipment_id === shipmentId ? { ...a, status: 'failed' } : a
        )
      );
      toast.success("⚠️ Đã ghi nhận giao hàng thất bại!", { id: toastId });
      setFailedModal(null);
    } catch {
      toast.error("❌ Lỗi cập nhật!", { id: toastId });
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchStatus = filter === "all" || a.status === filter;
      const matchSearch =
        a.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [assignments, filter, searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE);
  const pagedAssignments = filteredAssignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  useMemo(() => { setCurrentPage(1); }, [filter, searchTerm]);


  const handleCardClick = (shipmentId) => {
    navigate(`/driver/${id}/shipments/${shipmentId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 space-y-6 pb-24">
      <Toaster position="top-center" />

      {/* Phần giao diện */}
      <AnimatePresence>
        {failedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setFailedModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Phần giao diện */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Xác nhận thất bại</h3>
                    {failedModal.tracking_code && (
                      <p className="text-red-100 text-xs">Đơn #{failedModal.tracking_code}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setFailedModal(null)} className="text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 font-medium">Chọn lý do thất bại:</p>

                {/* Phần giao diện */}
                <div className="grid grid-cols-1 gap-2">
                  {FAILED_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => { setSelectedReason(reason); setCustomReason(""); }}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedReason === reason
                          ? "bg-red-50 border-red-400 text-red-700 ring-2 ring-red-200"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50"
                      }`}
                    >
                      <span className="mr-2">{selectedReason === reason ? "●" : "○"}</span>
                      {reason}
                    </button>
                  ))}
                </div>

                {/* Phần giao diện */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Hoặc nhập lý do khác:</label>
                  <textarea
                    rows={2}
                    placeholder="Nhập lý do cụ thể..."
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setSelectedReason(""); }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                </div>

                {/* Phần giao diện */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setFailedModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleConfirmFailed}
                    disabled={!selectedReason && !customReason.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Xác nhận Thất bại
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phần giao diện */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#113e48] flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> Quản lý đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các đơn hàng được phân công
          </p>
        </div>

        <div className="w-full md:w-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm mã đơn, địa chỉ..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Phần giao diện */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {[
          { id: "all", label: "Tất cả" },
          { id: "assigned", label: "Mới nhận" },
          { id: "picking", label: "Đang lấy" },
          { id: "delivering", label: "Đang giao" },
          { id: "completed", label: "Hoàn tất" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setFilter(tab.id); setCurrentPage(1); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border ${
              filter === tab.id
                ? "bg-[#113e48] text-white border-[#113e48] shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Phần giao diện */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-56 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="mt-8 h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : filteredAssignments.length > 0 ? (
          <AnimatePresence>
            {pagedAssignments.map((a) => {
              const statusConfig =
                STATUS_CONFIG[a.status] || STATUS_CONFIG.assigned;
              const StatusBadgeIcon = statusConfig.icon;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={a.shipment_id}
                  onClick={() => handleCardClick(a.shipment_id)}
                  className={`rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 hover:shadow-lg transition-all group relative cursor-pointer ${
                    a.service_type === 'fast'
                      ? 'bg-gradient-to-br from-white via-white to-red-50 border-2 border-red-200 ring-1 ring-red-100'
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  {/* Render điều kiện */}
                  {a.service_type === 'fast' && (
                    <div className="absolute -top-2.5 right-4 z-10">
                      <span className="inline-flex items-center justify-center gap-1 min-w-[130px] px-3 py-1.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse uppercase tracking-wider">
                        <Rocket size={12} />
                        Hỏa tốc — Ưu tiên
                      </span>
                    </div>
                  )}
                  {a.service_type === 'express' && (
                    <div className="absolute -top-2.5 right-4 z-10">
                      <span className="inline-flex items-center justify-center gap-1 min-w-[130px] px-2.5 py-1.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 ring-1 ring-orange-200 uppercase tracking-wider">
                        <Zap size={11} />
                        Nhanh
                      </span>
                    </div>
                  )}
                  {/* Phần giao diện */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {/* Phần giao diện */}
                      <div className={`text-lg font-bold group-hover:text-blue-600 transition-colors flex items-center gap-2 ${
                        a.service_type === 'fast' ? 'text-red-700' : 'text-[#113e48]'
                      }`}>
                        {a.service_type === 'fast' && <Rocket size={18} className="text-red-500" />}
                        {a.tracking_code}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-medium flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {new Date(
                          a.updated_at || Date.now()
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                    >
                      <StatusBadgeIcon size={12} /> {statusConfig.label}
                    </span>
                  </div>

                  {/* Phần giao diện */}
                  <div className="space-y-4 mb-6 relative">
                    <div className="absolute left-[9px] top-3 bottom-8 w-[2px] bg-gray-100"></div>

                    <div className="flex items-start gap-3 relative z-10">
                      <div className="mt-0.5 min-w-[20px] h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Package size={12} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Người nhận
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {a.receiver_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.receiver_phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 relative z-10">
                      <div className="mt-0.5 min-w-[20px] h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                        <MapPin size={12} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Giao đến
                        </p>
                        <p
                          className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-medium"
                          title={a.delivery_address}
                        >
                          {a.delivery_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    {/* Phần giao diện */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        a.delivery_address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-white hover:text-blue-600 hover:shadow-md border border-transparent hover:border-gray-100 transition-all z-10"
                    >
                      <Navigation2 size={18} /> Chỉ đường
                    </a>

                    {/* Phần giao diện */}
                    <div className="flex-1 z-10">
                      <StatusDropdown
                        currentStatus={a.status}
                        onChange={(newStatus) =>
                          handleStatusChange(a.shipment_id, newStatus, a.tracking_code)
                        }
                        disabled={
                          a.status === "completed" || a.status === "failed"
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4 animate-bounce">
              <PackageOpen size={48} className="text-gray-300" />
            </div>
            <p className="text-lg font-bold text-gray-500">
              Chưa có đơn hàng nào
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Vui lòng kiểm tra lại bộ lọc
            </p>
          </div>
        )}
      </div>

      {/* Render điều kiện */}
      {!loading && filteredAssignments.length > PAGE_SIZE && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}