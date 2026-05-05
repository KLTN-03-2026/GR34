import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Package,
  PackageOpen,
  Search,
  Filter,
  Eye,
  Star,
  XCircle,
  Ban,
  Clock,
  CheckCircle,
  Truck,
  ChevronDown,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import Pagination from "../../components/Pagination";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái", icon: Filter, color: "text-gray-500", bg: "bg-gray-100" },
  { value: "pending", label: "Chờ xử lý", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "assigned", label: "Đã phân công", icon: ClipboardList, color: "text-gray-600", bg: "bg-gray-100" },
  { value: "picking", label: "Đang lấy hàng", icon: PackageOpen, color: "text-orange-600", bg: "bg-orange-100" },
  { value: "delivering", label: "Đang giao hàng", icon: Truck, color: "text-blue-600", bg: "bg-blue-100" },
  { value: "completed", label: "Hoàn thành", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  { value: "failed", label: "Giao thất bại", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  { value: "canceled", label: "Đã hủy", icon: Ban, color: "text-gray-500", bg: "bg-gray-100" },
];


function StatusFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-400 hover:ring-2 hover:ring-orange-500/10 transition-all text-sm font-medium text-gray-700 min-w-[180px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className={`p-1 rounded-lg ${selected.bg} ${selected.color}`}>
            <SelectedIcon size={13} />
          </span>
          <span>{selected.label}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-orange-50 ${isActive ? "bg-orange-50/60 font-semibold" : ""}`}
              >
                <span className={`p-1.5 rounded-lg ${opt.bg} ${opt.color} flex-shrink-0`}>
                  <Icon size={13} />
                </span>
                <span className={isActive ? "text-orange-700" : "text-gray-700"}>{opt.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Lịch sử đơn hàng khách hàng
export default function CustomerHistory() {
  const [shipments, setShipments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);


  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const customerId =
    localStorage.getItem("customer_id") || localStorage.getItem("userId");

  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-out-cubic", once: true });

    if (!customerId) return;

    setLoading(true);
    API.get(`/customers/shipments/${customerId}`)
      .then((res) => {
        setShipments(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error("Không thể tải lịch sử đơn hàng!"))
      .finally(() => setLoading(false));
  }, [customerId]);


  useEffect(() => {
    let result = shipments;


    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }


    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.tracking_code?.toLowerCase().includes(keyword) ||
          s.receiver_name?.toLowerCase().includes(keyword)
      );
    }

    setFiltered(result);
    setPage(1);
  }, [filterStatus, search, shipments]);


  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentShipments = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );


// Tạo badge hiển thị trạng thái
  const getStatusBadge = (status) => {
    const config = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={12} />,
      },
      assigned: {
        label: "Đã phân công",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <Package size={12} />,
      },
      picking: {
        label: "Đang lấy hàng",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Package size={12} />,
      },
      delivering: {
        label: "Đang giao",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Truck size={12} />,
      },
      delivered: {
        label: "Đã giao",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />,
      },
      failed: {
        label: "Giao thất bại",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={12} />,
      },
      canceled: {
        label: "Đã hủy",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <XCircle size={12} />,
      },
    };
    const s = config[status] || {
      label: status,
      color: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`inline-flex items-center justify-center gap-1 min-w-[130px] px-2.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${s.color}`}
      >
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      <Toaster position="top-right" />

      {/* Phần giao diện */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-extrabold text-[#113e48] flex items-center gap-2">
            <Package className="text-orange-500" /> Lịch sử đơn hàng
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý và theo dõi tất cả đơn hàng của bạn.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Phần giao diện */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm mã vận đơn, người nhận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-full sm:w-64 transition-all"
            />
          </div>

          {/* Phần giao diện */}
          <StatusFilterDropdown value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} />
        </div>
      </div>

      {/* Phần giao diện */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã vận đơn</th>
                <th className="px-6 py-4">Người nhận</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">COD</th>
                <th className="px-6 py-4 text-center">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : currentShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                currentShipments.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-[#113e48]">
                      {s.tracking_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {s.receiver_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {s.receiver_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {Number(s.cod_amount).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-start gap-2 w-[72px] mx-auto opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/customer/history/${s.id}`)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {(s.status === "completed" ||
                          s.status === "delivered") && (
                          <button
                            onClick={() =>
                              navigate(`/customer/feedback?shipment_id=${s.id}`)
                            }
                            className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Đánh giá"
                          >
                            <Star size={16} />
                          </button>
                        )}

                        {s.status === "pending" && (
                          <button
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Hủy đơn"
                            onClick={() => {
                              if (confirm("Bạn chắc chắn muốn hủy đơn này?")) {

                                toast.success("Đã gửi yêu cầu hủy đơn");
                              }
                            }}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phần giao diện */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}