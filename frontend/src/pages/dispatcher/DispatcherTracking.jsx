import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../lib/toast";
import API from "../../services/api";
import { Truck, MapPin, Calendar, Search, RotateCcw, Rocket, Zap, Package, User, Clock, ArrowRight, CheckCircle, XCircle, List } from "lucide-react";
import Pagination from "../../components/Pagination";

const STATUS_FILTER_CONFIG = [
  { key: "all",        label: "Tất cả",      icon: List,         color: "bg-slate-100 text-slate-600 ring-slate-300 hover:bg-slate-200" },
  { key: "assigned",   label: "Đã gán",      icon: Clock,        color: "bg-blue-50 text-blue-700 ring-blue-300 hover:bg-blue-100" },
  { key: "picking",    label: "Lấy hàng",     icon: Package,     color: "bg-yellow-50 text-yellow-700 ring-yellow-300 hover:bg-yellow-100" },
  { key: "delivering", label: "Đang giao",    icon: ArrowRight,   color: "bg-orange-50 text-orange-700 ring-orange-300 hover:bg-orange-100" },
  { key: "completed",  label: "Hoàn tất",     icon: CheckCircle,  color: "bg-green-50 text-green-700 ring-green-300 hover:bg-green-100" },
  { key: "failed",     label: "Thất bại",     icon: XCircle,     color: "bg-red-50 text-red-700 ring-red-300 hover:bg-red-100" },
];

const STATUS_LABEL_MAP = {
  assigned: "Đã gán",
  picking: "Đang lấy hàng",
  delivering: "Đang giao",
  completed: "Hoàn tất",
  failed: "Giao thất bại",
};

const STATUS_BADGE_CLASS = (s) => ({
  completed:  "bg-green-50 text-green-700 border-green-200",
  delivering: "bg-orange-50 text-orange-700 border-orange-200",
  failed:     "bg-red-50 text-red-700 border-red-200",
  picking:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  assigned:   "bg-blue-50 text-blue-700 border-blue-200",
}[s] || "bg-slate-100 text-slate-600 border-slate-200");

const STATUS_BADGE_ICON = (s) => ({
  completed:  CheckCircle,
  delivering: ArrowRight,
  failed:     XCircle,
  picking:    Package,
  assigned:   Clock,
}[s] || List);

// Theo dõi vận chuyển thời gian thực
export default function DispatcherTracking() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter logic: always show completed/failed alongside active filter
  const filtered = assignments.filter((a) => {
    const isHistorical = a.assignment_status === "completed" || a.assignment_status === "failed";
    if (isHistorical) return true;
    const matchStatus = statusFilter === "all" || a.assignment_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (a.tracking_code || "").toLowerCase().includes(q) ||
      (a.driver_name || "").toLowerCase().includes(q) ||
      (a.sender_name || "").toLowerCase().includes(q) ||
      (a.receiver_name || "").toLowerCase().includes(q) ||
      (a.delivery_address || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedAssignments = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Stats badges
  const stats = assignments.reduce((acc, a) => {
    acc[a.assignment_status] = (acc[a.assignment_status] || 0) + 1;
    return acc;
  }, {});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/dispatcher/assignments");
      setAssignments(res.data.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách vận đơn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/dispatcher/assignments/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi cập nhật!");
    }
  };

  const handleRowClick = (shipmentId) => {
    navigate(`/dispatcher/tracking/${shipmentId}`);
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setPage(1); };

  const hasFilters = search || statusFilter !== "all";

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Header + Filter bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#113e48] flex items-center gap-2">
            <Truck className="text-blue-600" /> Theo dõi lộ trình
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Giám sát trạng thái các đơn hàng đang được tài xế thực hiện
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 ml-auto">
          {/* Search */}
          <div className="relative flex-1 xl:w-96">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tài xế, người gửi, người nhận, địa chỉ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTER_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={cfg.key}
                  onClick={() => { setStatusFilter(cfg.key); setPage(1); }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === cfg.key
                      ? "bg-[#113e48] text-white shadow"
                      : `${cfg.color} text-gray-600`
                  }`}
                >
                  <Icon size={11} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <RotateCcw size={12} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Tài xế & Xe</th>
                <th className="px-6 py-4">Lộ trình giao</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Cập nhật nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedAssignments.length > 0 ? (
                paginatedAssignments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => handleRowClick(a.shipment_id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group border-l-[3px] border-transparent hover:border-slate-300"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {a.service_type === "fast" ? (
                          <Rocket size={14} strokeWidth={2.5} className="text-red-500 shrink-0" />
                        ) : (
                          <Package size={14} strokeWidth={2} className="text-green-600 shrink-0" />
                        )}
                        <span className="font-extrabold text-[#113e48] text-sm hover:text-blue-600 transition-colors">
                          #{a.tracking_code}
                        </span>
                        {a.service_type === "fast" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-500 text-white shadow-sm animate-pulse">
                            <Rocket size={9} /> HỎA TỐC
                          </span>
                        )}
                        {a.service_type === "express" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-100 text-orange-700 ring-1 ring-orange-200">
                            <Zap size={9} /> NHANH
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5"><User size={10} className="text-slate-400" />{a.sender_name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="flex items-center gap-0.5 font-medium text-gray-700"><User size={10} className="text-slate-400" />{a.receiver_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-gray-800 text-sm">{a.driver_name}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-0.5 font-medium">
                        {a.vehicle_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="flex items-start gap-1.5">
                        <Package size={13} className="text-green-500 mt-0.5 shrink-0" />
                        <p className="text-gray-600 text-xs line-clamp-2">{a.delivery_address || "—"}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 ml-[22px]">
                        <Calendar size={11} />
                        {new Date(a.assigned_at || Date.now()).toLocaleDateString("vi-VN", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const Icon = STATUS_BADGE_ICON(a.assignment_status);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border ${STATUS_BADGE_CLASS(a.assignment_status)}`}>
                            <Icon size={11} />
                            {STATUS_LABEL_MAP[a.assignment_status] || a.assignment_status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          onChange={(e) => handleStatusUpdate(a.id, e.target.value, e)}
                          defaultValue=""
                          className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-7 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-xs font-medium cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="" disabled>Cập nhật...</option>
                          <option value="picking">Đang lấy hàng</option>
                          <option value="delivering">Đang giao hàng</option>
                          <option value="completed">Hoàn tất</option>
                          <option value="failed">Thất bại</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400 italic">
                    <div className="flex flex-col items-center">
                      <Truck size={48} className="text-gray-200 mb-2" />
                      Không có đơn hàng nào phù hợp.
                      {hasFilters && (
                        <button onClick={clearFilters} className="text-xs text-blue-500 hover:underline mt-1">
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && paginatedAssignments.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}