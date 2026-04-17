import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Package,
  Search,
  Filter,
  Eye,
  Star,
  XCircle,
  MoreVertical,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import Pagination from "../../components/Pagination"; // Dùng lại Pagination

export default function CustomerHistory() {
  const [shipments, setShipments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
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

  // Filter & Search Logic
  useEffect(() => {
    let result = shipments;

    // Filter by Status
    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Filter by Search (Tracking Code or Receiver Name)
    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.tracking_code?.toLowerCase().includes(keyword) ||
          s.receiver_name?.toLowerCase().includes(keyword),
      );
    }

    setFiltered(result);
    setPage(1); // Reset page
  }, [filterStatus, search, shipments]);

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentShipments = filtered.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Helper: Status Badge
  const getStatusBadge = (status) => {
    const config = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={12} />,
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
        label: "Hoàn tất",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />,
      },
      failed: {
        label: "Thất bại",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={12} />,
      },
      cancelled: {
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
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${s.color}`}
      >
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      <Toaster position="top-right" />

      {/* Header & Controls */}
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
          {/* Search Box */}
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

          {/* Filter Select */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white cursor-pointer appearance-none w-full sm:w-48 transition-all font-medium text-gray-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ xử lý</option>
              <option value="picking">📦 Đang lấy hàng</option>
              <option value="delivering">🚚 Đang giao hàng</option>
              <option value="completed">✅ Hoàn tất</option>
              <option value="failed">❌ Thất bại</option>
              <option value="cancelled">🚫 Đã hủy</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
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
                      <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
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
                                // Gọi API hủy đơn ở đây
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

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
