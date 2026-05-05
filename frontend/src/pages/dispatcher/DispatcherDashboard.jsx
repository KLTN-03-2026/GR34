import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const REGION_META = {
  DN: {
    city: "Đà Nẵng",
    nearby: ["Hòa Vang", "Liên Chiểu", "Thanh Khê", "Ngũ Hành Sơn"],
  },
  HCM: {
    city: "TP.HCM",
    nearby: ["Thủ Đức", "Bình Thạnh", "Gò Vấp", "Tân Bình"],
  },
  HN: {
    city: "Hà Nội",
    nearby: ["Cầu Giấy", "Đống Đa", "Nam Từ Liêm", "Thanh Xuân"],
  },
  OTHER: {
    city: "Liên vùng",
    nearby: ["Khu vực tổng hợp"],
  },
};

// Trang tổng quan của điều phối viên
export default function DispatcherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedShipments, setFailedShipments] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resStats, resFailed] = await Promise.all([
          API.get("/dispatcher/dashboard"),
          API.get("/dispatcher/shipments/failed"),
        ]);
        setStats(resStats.data);
        setFailedShipments(resFailed.data || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );

  if (!stats) return <p className="p-6 text-gray-500">Không có dữ liệu.</p>;

  const regionId =
    stats.region_id || localStorage.getItem("region_id") || "OTHER";
  const regionInfo = REGION_META[regionId] || REGION_META.OTHER;

  const totalShipments = stats.shipments.reduce((a, b) => a + b.count, 0);
  const activeDrivers =
    stats.drivers.find((d) => d.status === "available")?.count || 0;

  const delivering =
    stats.shipments.find((s) => s.status === "delivering")?.count || 0;
  const completed =
    stats.shipments.find((s) => s.status === "completed")?.count || 0;
  const failed = stats.shipments.find((s) => s.status === "failed")?.count || 0;
  const pending =
    stats.shipments.find((s) => s.status === "pending")?.count || 0;


  const pieData = [
    { name: "Đang giao", value: delivering },
    { name: "Hoàn tất", value: completed },
    { name: "Thất bại", value: failed },
    { name: "Chờ xử lý", value: pending },
  ].filter((i) => i.value > 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#113e48] flex items-center gap-2">
            <Truck className="text-orange-500" /> Bảng điều khiển Điều phối
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan vận hành khu vực {regionInfo.city}
          </p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500">
            <option>Hôm nay</option>
            <option>Tuần này</option>
            <option>Tháng này</option>
          </select>
        </div>
      </div>

      <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-2 text-[#113e48] font-bold mb-2">
          <MapPin size={16} className="text-orange-500" />
          Khu vực lân cận đang theo dõi
        </div>
        <div className="flex flex-wrap gap-2">
          {regionInfo.nearby.map((area) => (
            <span
              key={area}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng đơn hàng"
          value={totalShipments}
          icon={<Package size={24} />}
          color="bg-blue-500"
          sub="Đơn hàng trong hệ thống"
        />
        <StatCard
          title="Tài xế sẵn sàng"
          value={activeDrivers}
          icon={<Users size={24} />}
          color="bg-green-500"
          sub="Đang trực tuyến"
        />
        <StatCard
          title="Đang giao hàng"
          value={delivering}
          icon={<Truck size={24} />}
          color="bg-orange-500"
          sub="Xe đang di chuyển"
        />
        <StatCard
          title="Cần xử lý gấp"
          value={failed + pending}
          icon={<AlertTriangle size={24} />}
          color="bg-red-500"
          sub="Đơn lỗi / Chờ duyệt"
        />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-blue-500" /> Tỷ lệ giao hàng
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
              <span className="text-2xl font-bold text-gray-700">
                {totalShipments}
              </span>
              <p className="text-xs text-gray-400">Tổng đơn</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500" /> Doanh thu theo
            tháng
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.revenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">🏆 Top Tài Xế Xuất Sắc</h3>
            <button className="text-xs text-blue-600 font-bold hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {stats.topDrivers.length > 0 ? (
              stats.topDrivers.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                      i === 0
                        ? "bg-yellow-400"
                        : i === 1
                        ? "bg-gray-400"
                        : i === 2
                        ? "bg-orange-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">
                      {d.name}
                    </h4>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${d.completion_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-lg">{d.completion_rate || 0}%</p>
                    <p className="text-xs text-gray-400">{d.completed_deliveries || 0} đơn HT</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Chưa có dữ liệu tài xế.
              </p>
            )}
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle size={18} /> Đơn Cần Xử Lý Gấp
            </h3>
            <button
              onClick={() => navigate("/dispatcher/failed-orders")}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {failedShipments.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-2xl mb-2">•</p>
                <p className="text-sm font-medium">Không có đơn thất bại!</p>
              </div>
            ) : (
              failedShipments.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-4 border border-red-50 bg-red-50/30 rounded-xl flex justify-between items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black text-red-500 uppercase">Thất bại</p>
                      {(s.total_fails || 0) >= 3 && (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black">Được hủy</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-700">#{s.tracking_code}</p>
                    <p className="text-xs text-gray-500 truncate">{s.receiver_name}</p>
                    {s.failure_note && (
                      <p className="text-xs text-red-500 italic truncate mt-0.5">{s.failure_note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {s.failed_at ? new Date(s.failed_at).toLocaleDateString("vi-VN") : "--"}
                      {' · '}{s.total_fails || 0}/3 lần
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/dispatcher/failed-orders")}
                    className="shrink-0 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition"
                  >
                    Xử lý
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function StatCard({ title, value, icon, color, sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      {}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>

      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
        </div>
        <div
          className={`p-3 rounded-xl text-white shadow-lg ${color} bg-opacity-90 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3 font-medium bg-gray-50 inline-block px-2 py-1 rounded-md">
        {sub}
      </p>
    </div>
  );
}
