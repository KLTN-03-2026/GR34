import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function getCurrentUserId() {
  const keys = ["user", "userId", "userid", "user_id", "customer_id"];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (!value) continue;
    if (key === "user") {
      try {
        const parsed = JSON.parse(value);
        if (parsed?.id) return parsed.id;
      } catch (err) {}
    } else return value;
  }
  return null;
}

// Trang tổng quan của khách hàng
export default function CustomerDashboard() {
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    delivering: 0,
    completed: 0,
    pending: 0,
    totalCod: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out-cubic", once: true });

    if (!userId) {
      toast.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Tải dữ liệu từ server
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/customers/${userId}/shipments`);
        const data = res.data || [];
        setShipments(data);

        const total = data.length;
        const delivering = data.filter((s) =>
          ["delivering", "picking"].includes(s.status),
        ).length;
        const completed = data.filter((s) =>
          ["delivered", "completed"].includes(s.status),
        ).length;
        const pending = data.filter((s) => s.status === "pending").length;
        const assigned = data.filter((s) => s.status === "assigned").length;
        const failed = data.filter((s) =>
          ["failed", "canceled"].includes(s.status),
        ).length;
        const totalCod = data.reduce(
          (sum, s) => sum + (Number(s.cod_amount) || 0),
          0,
        );

        setStats({ total, delivering, completed, pending, totalCod });

        const rawChartData = [
          { name: "Chờ xử lý", value: pending, color: "#F59E0B" },
          { name: "Đã phân công", value: assigned, color: "#8B5CF6" },
          { name: "Đang giao", value: delivering, color: "#3B82F6" },
          { name: "Hoàn thành", value: completed, color: "#10B981" },
          { name: "Thất bại/Hủy", value: failed, color: "#EF4444" },
        ];

        setChartData(rawChartData.filter((item) => item.value > 0));
      } catch (err) {
        toast.error("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#113e48] flex items-center gap-2">
            Xin chào,{" "}
            <span className="text-orange-500 truncate max-w-[150px] md:max-w-none">
              {localStorage.getItem("username") || "Khách hàng"}
            </span>{" "}
            👋
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Tổng quan tình hình vận đơn hôm nay.
          </p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-600 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto text-center">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Tổng đơn"
          value={stats.total}
          icon={<Package className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />}
          bg="bg-blue-50"
        />
        <StatCard
          title="Đang giao"
          value={stats.delivering}
          icon={<Truck className="text-orange-600 w-5 h-5 md:w-6 md:h-6" />}
          bg="bg-orange-50"
        />
        <StatCard
          title="Hoàn tất"
          value={stats.completed}
          icon={
            <CheckCircle className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
          }
          bg="bg-green-50"
        />
        <StatCard
          title="Tiền COD"
          value={stats.totalCod.toLocaleString("vi-VN") + "₫"}
          icon={
            <DollarSign className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
          }
          bg="bg-purple-50"
          valueSize="text-lg md:text-2xl"
        />
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col">
          <h3 className="text-base md:text-lg font-bold text-[#113e48] mb-2 flex items-center gap-2">
            <PieChartIcon size={18} className="text-gray-400" /> Tỷ lệ trạng
            thái
          </h3>

          <div className="flex-1 min-h-[250px] md:min-h-[300px] relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                    itemStyle={{ fontWeight: "bold", color: "#333" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "500" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package size={32} className="mb-2 opacity-20" />
                <p className="text-xs md:text-sm">Chưa có dữ liệu</p>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8 md:pb-10">
                <p className="text-2xl md:text-3xl font-extrabold text-[#113e48]">
                  {stats.total}
                </p>
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Đơn hàng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-[#113e48]">
              Đơn hàng mới nhất
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Xem tất cả
            </button>
          </div>

          <div className="w-full">
            {shipments.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {shipments.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-gray-50/30"
                    >
                      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            Mã VĐ
                          </p>
                          <p className="font-bold text-[#113e48] text-sm">
                            {s.tracking_code}
                          </p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">
                            Người nhận
                          </p>
                          <p className="font-medium text-gray-800 truncate">
                            {s.receiver_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.receiver_phone}
                          </p>
                        </div>
                        <div className="text-right flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase">
                              Tiền COD
                            </p>
                            <p className="font-bold text-gray-700">
                              {Number(s.cod_amount).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(s.created_at).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Mã vận đơn</th>
                        <th className="px-4 py-3">Người nhận</th>
                        <th className="px-4 py-3 text-center">Trạng thái</th>
                        <th className="px-4 py-3 text-right">COD</th>
                        <th className="px-4 py-3 rounded-tr-lg text-right">
                          Ngày tạo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {shipments.slice(0, 5).map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-4 font-bold text-[#113e48]">
                            {s.tracking_code}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">
                              {s.receiver_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {s.receiver_phone}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-gray-600">
                            {Number(s.cod_amount).toLocaleString("vi-VN")}₫
                          </td>
                          <td className="px-4 py-4 text-right text-gray-400 text-xs">
                            {new Date(s.created_at).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bg,
  valueSize = "text-xl md:text-2xl",
}) {
  return (
    <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group h-full">
      <div className="w-[60%]">
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 line-clamp-1">
          {title}
        </p>
        <h3 className={`${valueSize} font-extrabold text-[#113e48] truncate`}>
          {value}
        </h3>
      </div>
      <div
        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
  );
}

// Tạo badge hiển thị trạng thái
function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-400",
    },
    assigned: {
      label: "Đã phân công",
      color: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    },
    picking: {
      label: "Đang lấy hàng",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      dot: "bg-orange-400",
    },
    delivering: {
      label: "Đang giao",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-400",
    },
    delivered: {
      label: "Đã giao",
      color: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-400",
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    failed: {
      label: "Giao thất bại",
      color: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
    canceled: {
      label: "Đã hủy",
      color: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
    },
  };

  const s = config[status] || {
    label: status,
    color: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 min-w-[130px] px-2.5 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${s.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {s.label}
    </span>
  );
}
