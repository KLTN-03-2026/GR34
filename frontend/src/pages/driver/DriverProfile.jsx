import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Truck,
  MapPin,
  Star,
  Shield,
  Calendar,
  Edit,
  Power,
  RefreshCw,
  Award,
  TrendingUp,
  PackageCheck,
} from "lucide-react";

export default function DriverProfile() {
  const { id: paramId } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefeshing, setIsRefreshing] = useState(false);

  const driverId = paramId || localStorage.getItem("userId");

  const fetchData = async () => {
    if (!driverId) return;
    setIsRefreshing(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        API.get(`/drivers/profile/${driverId}`),
        API.get(`/drivers/dashboard/${driverId}`).catch(() => ({
          data: { total: 0, completed: 0, rating: 5.0 },
        })),
      ]);

      setProfile(profileRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu:", err);
      toast.error("Không thể tải thông tin tài xế");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driverId]);

  const toggleStatus = async () => {
    if (!profile) return;
    const newStatus = profile.status === "available" ? "inactive" : "available";
    const toastId = toast.loading("Đang cập nhật trạng thái...");

    try {
      setProfile((prev) => ({ ...prev, status: newStatus }));
      toast.success(
        newStatus === "available"
          ? "Đã bật trạng thái Sẵn sàng!"
          : "Đã chuyển sang Nghỉ ngơi",
        { id: toastId },
      );
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="p-8 text-center">Không tìm thấy thông tin tài xế.</div>
    );

  const isAvailable = profile.status === "available";
  const isDelivering = profile.status === "delivering";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 space-y-6 pb-24">
      <Toaster position="top-right" />

      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#113e48] to-[#2a6f7d]"></div>

        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end -mt-12 gap-4 md:gap-6">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                profile.name,
              )}&backgroundColor=113e48&fontSize=50`}
              alt={profile.name}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-white"
            />

            <span
              className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-white rounded-full ${
                isAvailable
                  ? "bg-green-500"
                  : isDelivering
                    ? "bg-blue-500"
                    : "bg-gray-400"
              }`}
            ></span>
          </div>

          <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              {profile.name}
              <Shield
                size={18}
                className="text-blue-500"
                fill="currentColor"
                fillOpacity={0.2}
              />
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Đối tác vận chuyển • Tham gia từ 2024
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <button
              onClick={toggleStatus}
              disabled={isDelivering}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm
                  ${
                    isDelivering
                      ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                      : isAvailable
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
            >
              <Power size={18} />
              {isDelivering
                ? "Đang giao hàng"
                : isAvailable
                  ? "Đang trực tuyến"
                  : "Đang nghỉ"}
            </button>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-gray-50 hover:bg-white text-gray-600 border border-gray-200 hover:shadow transition-all"
              title="Làm mới"
            >
              <RefreshCw
                size={20}
                className={isRefeshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-[#113e48]" /> Thông tin cá nhân
              </h3>
              <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition">
                <Edit size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow
                icon={Phone}
                label="Số điện thoại"
                value={profile.phone}
              />
              <InfoRow
                icon={Truck}
                label="Phương tiện"
                value={profile.vehicle_type || "Xe máy"}
              />
              <InfoRow
                icon={MapPin}
                label="Khu vực"
                value={profile.region_id || "Hồ Chí Minh"}
              />
              <InfoRow icon={Calendar} label="Ngày sinh" value="01/01/1995" />
            </div>
          </motion.div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-[#113e48]" /> Bảo mật
            </h3>
            <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-[#113e48] transition-colors">
              Đổi mật khẩu
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Tổng đơn"
              value={stats?.total || 0}
              icon={PackageCheck}
              color="blue"
            />
            <StatBox
              label="Hoàn tất"
              value={stats?.completed || 0}
              icon={Award}
              color="green"
            />
            <StatBox
              label="Tỉ lệ thành công"
              value={`${((stats?.completed / stats?.total) * 100 || 0).toFixed(
                0,
              )}%`}
              icon={TrendingUp}
              color="purple"
            />
            <StatBox
              label="Đánh giá"
              value={stats?.rating?.toFixed(1) || "5.0"}
              icon={Star}
              color="yellow"
              subValue="/ 5.0"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Đánh giá gần đây</h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                Rất tốt
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="text-5xl font-bold text-gray-800">
                {stats?.rating?.toFixed(1) || 5.0}
              </div>
              <div className="space-y-1">
                <div className="flex text-yellow-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  Dựa trên {stats?.completed || 0} lượt đánh giá
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <RatingBar star={5} percent={80} />
              <RatingBar star={4} percent={15} />
              <RatingBar star={3} percent={5} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400 font-medium uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const StatBox = ({ label, value, icon: Icon, color, subValue }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-2"
    >
      <div className={`p-3 rounded-full ${colorClasses[color]} mb-1`}>
        <Icon size={24} />
      </div>
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value}{" "}
        <span className="text-sm text-gray-400 font-normal">{subValue}</span>
      </p>
    </motion.div>
  );
};

const RatingBar = ({ star, percent }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-bold text-gray-600 w-3">{star}</span>
    <Star size={14} className="text-gray-300" />
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-yellow-400 rounded-full"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
    <span className="text-xs text-gray-400 w-8 text-right">{percent}%</span>
  </div>
);
