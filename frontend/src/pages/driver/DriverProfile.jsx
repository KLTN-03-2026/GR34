import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  User, Mail, Phone, Truck, MapPin, Star, Shield, Edit,
  Power, RefreshCw, Award, TrendingUp, PackageCheck, X,
  Lock, Eye, EyeOff, Save, CheckCircle, XCircle, MessageSquare,
} from "lucide-react";

export default function DriverProfile() {
  const { id: paramId } = useParams();
  const [profile, setProfile] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const driverId = paramId || localStorage.getItem("userId");

  const fetchData = async () => {
    if (!driverId) return;
    setIsRefreshing(true);
    try {
      const [profileRes, ratingRes] = await Promise.all([
        API.get(`/drivers/profile/${driverId}`),
        API.get(`/drivers/rating-stats/${driverId}`).catch(() => ({ data: null })),
      ]);
      setProfile(profileRes.data);
      setRatingStats(ratingRes.data);
      setEditName(profileRes.data.name || "");
      setEditPhone(profileRes.data.phone || "");
    } catch {
      toast.error("Không thể tải thông tin tài xế");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [driverId]);

  // Toggle online/offline status
  const toggleStatus = async () => {
    if (!profile) return;
    if (profile.status === "delivering") {
      toast.error("Không thể thay đổi khi đang giao hàng");
      return;
    }
    const isOnline = profile.status === "available" || profile.status === "free";
    const newStatus = isOnline ? "inactive" : "available";
    const toastId = toast.loading("Đang cập nhật...");
    try {
      await API.patch(`/drivers/toggle-status/${driverId}`, { status: newStatus });
      setProfile((p) => ({ ...p, status: newStatus }));
      toast.success(newStatus === "available" ? "Đã bật trực tuyến!" : "Đã chuyển sang nghỉ", { id: toastId });
    } catch {
      toast.error("Lỗi cập nhật trạng thái", { id: toastId });
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!editName.trim()) return toast.error("Họ tên không được để trống");
    setSavingProfile(true);
    try {
      const res = await API.put(`/drivers/update-profile/${driverId}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setProfile((p) => ({ ...p, name: editName.trim(), phone: editPhone.trim() }));
      if (res.data.name) localStorage.setItem("username", res.data.name);
      toast.success("Cập nhật thành công!");
      setIsEditing(false);
    } catch {
      toast.error("Lỗi khi cập nhật");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return toast.error("Vui lòng nhập đầy đủ");
    if (newPassword.length < 6) return toast.error("Mật khẩu mới ít nhất 6 ký tự");
    if (newPassword !== confirmPassword) return toast.error("Xác nhận mật khẩu không khớp");
    setSavingPassword(true);
    try {
      await API.patch(`/drivers/password/${driverId}`, { oldPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-gray-500">Không tìm thấy thông tin tài xế.</div>;

  const isAvailable = profile.status === "available" || profile.status === "free";
  const isDelivering = profile.status === "delivering";
  const avgRating = ratingStats?.avg_rating || 0;
  const totalRatings = ratingStats?.total_ratings || 0;
  const dist = ratingStats?.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const successRate = ratingStats?.success_rate || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] space-y-6 pb-24">
      <Toaster position="top-right" />

      {/* Header Card */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#113e48] to-[#2a6f7d]"></div>
        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end -mt-12 gap-4 md:gap-6">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=113e48&fontSize=50`}
              alt={profile.name}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-white"
            />
            <span className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-white rounded-full ${
              isAvailable ? "bg-green-500 animate-pulse" : isDelivering ? "bg-blue-500 animate-pulse" : "bg-gray-400"
            }`}></span>
          </div>
          <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              {profile.name}
              <Shield size={18} className="text-blue-500" fill="currentColor" fillOpacity={0.2} />
            </h1>
            <p className="text-sm text-gray-500 font-medium">Đối tác vận chuyển SpeedyShip</p>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <button
              onClick={toggleStatus}
              disabled={isDelivering}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                isDelivering ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                  : isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              <Power size={18} />
              {isDelivering ? "Đang giao hàng" : isAvailable ? "Đang trực tuyến" : "Đang nghỉ"}
            </button>
            <button onClick={fetchData} className="p-2.5 rounded-xl bg-gray-50 hover:bg-white text-gray-600 border border-gray-200 hover:shadow transition-all" title="Làm mới">
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-[#113e48]" /> Thông tin cá nhân
              </h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition flex items-center gap-1 text-sm">
                  <Edit size={16} /> Sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={savingProfile} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition">
                    <Save size={16} />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditName(profile.name); setEditPhone(profile.phone || ""); }} className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-lg transition">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium uppercase mb-1 block">Họ tên</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium uppercase mb-1 block">Số điện thoại</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition" />
                </div>
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Truck} label="Phương tiện" value={profile.vehicle_type || profile.type || "Chưa cập nhật"} />
                <InfoRow icon={MapPin} label="Biển số xe" value={profile.plate_no || "Chưa gán"} />
              </div>
            ) : (
              <div className="space-y-4">
                <InfoRow icon={User} label="Họ tên" value={profile.name} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Số điện thoại" value={profile.phone || "Chưa cập nhật"} />
                <InfoRow icon={Truck} label="Phương tiện" value={profile.vehicle_type || profile.type || "Chưa cập nhật"} />
                <InfoRow icon={MapPin} label="Biển số xe" value={profile.plate_no || "Chưa gán"} />
              </div>
            )}
          </motion.div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-[#113e48]" /> Bảo mật
            </h3>
            <button onClick={() => setShowPasswordModal(true)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-[#113e48] transition-colors flex items-center justify-center gap-2">
              <Lock size={16} /> Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Tổng đơn" value={ratingStats?.total_orders || 0} icon={PackageCheck} color="blue" />
            <StatBox label="Hoàn tất" value={ratingStats?.completed_orders || 0} icon={Award} color="green" />
            <StatBox label="Tỉ lệ thành công" value={`${successRate}%`} icon={TrendingUp} color="purple" />
            <StatBox label="Đánh giá" value={avgRating.toFixed(1)} icon={Star} color="yellow" subValue="/ 5.0" />
          </div>

          {/* Rating Detail */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Thống kê đánh giá</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                avgRating >= 4 ? "text-green-600 bg-green-50" : avgRating >= 3 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"
              }`}>
                {avgRating >= 4 ? "Rất tốt" : avgRating >= 3 ? "Khá" : totalRatings === 0 ? "Chưa có" : "Cần cải thiện"}
              </span>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</div>
              <div className="space-y-1">
                <div className="flex text-yellow-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.round(avgRating) ? "currentColor" : "none"} className={i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Dựa trên {totalRatings} lượt đánh giá</p>
              </div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = dist[star] || 0;
                const percent = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(0) : 0;
                return <RatingBar key={star} star={star} percent={Number(percent)} count={count} />;
              })}
            </div>
          </motion.div>

          {/* Recent Feedbacks */}
          {ratingStats?.recent_feedbacks?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#113e48]" /> Đánh giá gần đây
              </h3>
              <div className="space-y-4">
                {ratingStats.recent_feedbacks.map((fb, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      {(fb.customer_name || "K").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-800">{fb.customer_name || "Khách hàng"}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} fill={j < fb.rating ? "currentColor" : "none"} className={j < fb.rating ? "text-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{fb.content || "Không có nội dung"}</p>
                      <p className="text-xs text-gray-400 mt-1">Đơn #{fb.tracking_code} • {new Date(fb.created_at).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#113e48] to-[#2a6f7d] p-5 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Lock size={20} /> Đổi mật khẩu</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <PasswordField label="Mật khẩu hiện tại" value={oldPassword} onChange={setOldPassword} show={showOld} toggle={() => setShowOld(!showOld)} />
                <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} show={showNew} toggle={() => setShowNew(!showNew)} />
                <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
                {newPassword && (
                  <div className="space-y-1">
                    <PasswordRule ok={newPassword.length >= 6} text="Ít nhất 6 ký tự" />
                    <PasswordRule ok={confirmPassword === newPassword && confirmPassword !== ""} text="Xác nhận khớp" />
                  </div>
                )}
                <button type="submit" disabled={savingPassword} className="w-full py-3 bg-gradient-to-r from-[#113e48] to-[#2a6f7d] text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingPassword ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                  {savingPassword ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Icon size={18} /></div>
    <div className="flex-1">
      <p className="text-xs text-gray-400 font-medium uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
    </div>
  </div>
);

const StatBox = ({ label, value, icon: Icon, color, subValue }) => {
  const c = { blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", purple: "bg-purple-50 text-purple-600", yellow: "bg-yellow-50 text-yellow-600" };
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-2">
      <div className={`p-3 rounded-full ${c[color]} mb-1`}><Icon size={24} /></div>
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value} <span className="text-sm text-gray-400 font-normal">{subValue}</span></p>
    </motion.div>
  );
};

const RatingBar = ({ star, percent, count }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-bold text-gray-600 w-3">{star}</span>
    <Star size={14} className="text-yellow-400" fill="currentColor" />
    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-yellow-400 rounded-full" />
    </div>
    <span className="text-xs text-gray-500 w-14 text-right">{count} ({percent}%)</span>
  </div>
);

const PasswordField = ({ label, value, onChange, show, toggle }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 mb-1 block">{label}</label>
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm pr-10 transition" placeholder={label} />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const PasswordRule = ({ ok, text }) => (
  <div className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
    {ok ? <CheckCircle size={14} /> : <XCircle size={14} />} {text}
  </div>
);
