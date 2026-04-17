import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Search,
  Calendar,
  History,
  Filter,
  ListFilter,
} from "lucide-react";

export default function DriverHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/drivers/history/${id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch sử:", err);
      toast.error("Không thể tải lịch sử giao hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchStatus = filter === "all" || h.status === filter;
      const matchSearch =
        h.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [history, filter, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return { date: "--/--/----", time: "--:--" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Helper: Status Config
  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          text: "Hoàn tất",
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-100",
        };
      case "failed":
        return {
          icon: XCircle,
          text: "Thất bại",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100",
        };
      default:
        return {
          icon: Clock,
          text: "Đã xử lý",
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-100",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 space-y-6 pb-20">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#113e48] flex items-center gap-2">
            <History className="text-orange-500" /> Lịch sử vận chuyển
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem lại các đơn hàng bạn đã giao thành công hoặc thất bại
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <Search className="text-gray-400 ml-2" size={18} />
          <input
            type="text"
            placeholder="Tìm mã đơn, địa chỉ..."
            className="w-full md:w-64 px-2 py-1.5 outline-none text-sm bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {[
          {
            id: "all",
            label: "Tất cả",
            icon: ListFilter,
            color: "text-gray-600",
          },
          {
            id: "completed",
            label: "Thành công",
            icon: CheckCircle2,
            color: "text-green-600",
          },
          {
            id: "failed",
            label: "Thất bại",
            icon: XCircle,
            color: "text-red-600",
          },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                filter === tab.id
                  ? "bg-[#113e48] text-white border-[#113e48] shadow-md"
                  : `bg-white ${tab.color} border-gray-200 hover:bg-gray-50`
              }`}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-24 animate-pulse"
            >
              <div className="flex justify-between mb-2">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : filteredHistory.length > 0 ? (
          <AnimatePresence>
            {filteredHistory.map((h, i) => {
              const statusConfig = getStatusConfig(h.status);
              const StatusIcon = statusConfig.icon;
              const { date, time } = formatDate(h.updated_at || h.completed_at);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={h.id || i}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                  >
                    <StatusIcon size={24} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {h.tracking_code}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                      >
                        {statusConfig.text}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                      <p className="text-sm font-medium line-clamp-2">
                        {h.delivery_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 text-gray-400 text-xs sm:text-right border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} /> {date}
                    </div>
                    <div className="flex items-center gap-1 sm:mt-1">
                      <Clock size={12} /> {time}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Filter size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Không tìm thấy lịch sử nào
            </p>
            <p className="text-sm text-gray-400">
              Thử thay đổi bộ lọc hoặc tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
