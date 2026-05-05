import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  User,
  Mail,
  Phone,
  Camera,
  MapPin,
  ShoppingBag,
  Award,
  CreditCard,
  Edit,
  Save,
  Wallet,
  ArrowUpRight,
  History,
  Loader2,
  Lock,
  X,
  KeyRound,
  BookUser,
  CheckCircle2,
} from "lucide-react";


function getCurrentUserId() {
  try {
    const u = localStorage.getItem("user");
    if (u) return String(JSON.parse(u).id);
  } catch (_) {
    _;
  }
  return localStorage.getItem("userId");
}

// Hồ sơ cá nhân khách hàng
export default function CustomerProfile() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();


  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    rank: "Thành viên mới",
    total_orders: 0,
    wallet_balance: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);


  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);


  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);


  useEffect(() => {
    AOS.init({ duration: 600, once: true });

    if (!userId) {
      toast.error("Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await API.get(`/customers/profile/${userId}`);
        const data = res.data;

        setProfile({
          ...data,
          avatar:
            data.avatar ||
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${
              data.name || "User"
            }`,
          rank: data.rank || "Thành viên mới",
          total_orders: data.total_orders || 0,
          wallet_balance: data.wallet_balance ?? 0,
          address: data.address || "",
        });
      } catch (err) {
        toast.error("Lỗi tải hồ sơ!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);


  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/customers/profile/${userId}`, profile);
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (err) {
      toast.error("❌ Lỗi cập nhật!");
    }
  };


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("⚠️ Mật khẩu xác nhận không khớp!");
    }
    if (passData.newPassword.length < 6) {
      return toast.error("⚠️ Mật khẩu mới quá ngắn!");
    }

    setPassLoading(true);
    try {
      await API.put(`/customers/change-password/${userId}`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      toast.success("🎉 Đổi mật khẩu thành công!");
      setShowPassModal(false);
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Đổi mật khẩu thất bại!");
    } finally {
      setPassLoading(false);
    }
  };


  const openAddressBook = async () => {
    setShowAddressModal(true);


    if (savedAddresses.length === 0) {
      setLoadingAddresses(true);
      try {
        const res = await API.get(`/addresses/${userId}`);
        setSavedAddresses(res.data);
      } catch (error) {
        toast.error("Không tải được sổ địa chỉ");
      } finally {
        setLoadingAddresses(false);
      }
    }
  };


  const handleSelectAddress = (addr) => {

    setProfile({ ...profile, address: addr.address });
    setShowAddressModal(false);
    toast.success("Đã chọn địa chỉ!");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans relative">
      {/* Phần giao diện */}
      <div className="h-60 bg-gradient-to-r from-[#113e48] to-[#0f2a30] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phần giao diện */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phần giao diện */}
            <div
              className="bg-white rounded-3xl shadow-xl p-6 text-center border border-gray-100 relative overflow-visible"
              data-aos="fade-up"
            >
              <div className="relative inline-block -mt-20 mb-4 group">
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
                />
                {isEditing && (
                  <label className="absolute bottom-1 right-1 bg-orange-500 p-2 rounded-full text-white cursor-pointer hover:bg-orange-600 transition shadow-lg border-2 border-white hover:scale-110">
                    <Camera size={16} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                {profile.name}
              </h2>
              <div className="flex justify-center items-center gap-2 mt-2">
                <Award size={16} className="text-yellow-500" />
                <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  {profile.rank}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Đơn hàng
                  </p>
                  <p className="text-xl font-extrabold text-[#113e48] mt-1">
                    {profile.total_orders}
                  </p>
                </div>
                <div className="text-center border-l border-gray-100">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Điểm tích lũy
                  </p>
                  <p className="text-xl font-extrabold text-orange-500 mt-1">
                    {/* Phần giao diện */}
                    {Math.floor(
                      Number(profile.wallet_balance) / 1000
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="absolute top-[-50%] right-[-50%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">
                    Số dư khả dụng
                  </p>
                  <h3 className="text-3xl font-bold mt-1 tracking-tight flex items-baseline">
                    {Number(profile.wallet_balance).toLocaleString()}
                    <span className="text-lg text-blue-300 ml-1">₫</span>
                  </h3>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <Wallet size={24} className="text-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                  onClick={() => navigate("/customer/wallet")}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
                >
                  <ArrowUpRight size={16} /> Nạp tiền
                </button>
                <button
                  onClick={() => navigate("/customer/wallet")}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-md hover:-translate-y-0.5"
                >
                  <History size={16} /> Lịch sử
                </button>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="lg:col-span-2" data-aos="fade-left">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#113e48]">
                    Thông tin cá nhân
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Quản lý thông tin hồ sơ và bảo mật
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPassModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm"
                  >
                    <Lock size={16} /> Đổi mật khẩu
                  </button>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      isEditing
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }`}
                  >
                    {isEditing ? (
                      "Hủy bỏ"
                    ) : (
                      <>
                        <Edit size={16} /> Chỉnh sửa
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleUpdate}
                className={isEditing ? "animate-in fade-in duration-300" : ""}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Phần giao diện */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Họ và tên
                    </label>
                    <div
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isEditing
                          ? "bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
                          : "bg-gray-50 border-transparent"
                      }`}
                    >
                      <User size={18} className="text-gray-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full bg-transparent outline-none text-gray-800 font-medium disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Số điện thoại
                    </label>
                    <div
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isEditing
                          ? "bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
                          : "bg-gray-50 border-transparent"
                      }`}
                    >
                      <Phone size={18} className="text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full bg-transparent outline-none text-gray-800 font-medium disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      Email
                      {isEditing && (
                        <span className="text-xs font-normal text-gray-400 italic">
                          Không thể thay đổi
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-transparent bg-gray-100 opacity-70 cursor-not-allowed">
                      <Mail size={18} className="text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-transparent outline-none text-gray-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-gray-700">
                        Địa chỉ giao hàng mặc định
                      </label>

                      {/* Render điều kiện */}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={openAddressBook}
                          className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-blue-200"
                        >
                          <BookUser size={14} /> Chọn từ sổ địa chỉ
                        </button>
                      )}
                    </div>

                    <div
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        isEditing
                          ? "bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
                          : "bg-gray-50 border-transparent"
                      }`}
                    >
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <textarea
                        value={profile.address}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        disabled={!isEditing}
                        rows="3"
                        placeholder="Chưa cập nhật địa chỉ..."
                        className="w-full bg-transparent outline-none text-gray-800 font-medium disabled:text-gray-600 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-[#113e48] hover:bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-[#113e48]/20 transition-all hover:-translate-y-1"
                    >
                      <Save size={18} /> Lưu thay đổi
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Render điều kiện */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#113e48] p-6 text-white flex justify-between items-center relative">
              <div className="absolute inset-0 bg-white/5 pattern-grid-lg opacity-20"></div>
              <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                <KeyRound size={20} /> Đổi mật khẩu
              </h3>
              <button
                onClick={() => setShowPassModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition relative z-10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    placeholder="••••••••"
                    value={passData.currentPassword}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    placeholder="Ít nhất 6 ký tự"
                    value={passData.newPassword}
                    onChange={(e) =>
                      setPassData({ ...passData, newPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    placeholder="Nhập lại mật khẩu mới"
                    value={passData.confirmPassword}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPassModal(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition flex justify-center items-center gap-2"
                  >
                    {passLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Xác nhận đổi"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Render điều kiện */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            {/* Phần giao diện */}
            <div className="bg-[#113e48] p-5 text-white flex justify-between items-center relative shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookUser size={20} /> Chọn từ sổ địa chỉ
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Phần giao diện */}
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50/50">
              {loadingAddresses ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Loader2
                    className="animate-spin mb-2 text-orange-500"
                    size={32}
                  />
                  <p>Đang tải danh sách...</p>
                </div>
              ) : savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 hover:shadow-md cursor-pointer transition group flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#113e48] flex items-center gap-1">
                            {addr.name}
                            <span className="text-xs font-normal text-gray-500">
                              (
                              {addr.type === "home"
                                ? "Nhà riêng"
                                : addr.type === "office"
                                ? "Văn phòng"
                                : "Khác"}
                              )
                            </span>
                          </span>
                          {(addr.is_default === 1 ||
                            addr.is_default === true) && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-bold">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {addr.address}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          {addr.phone}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <BookUser size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Sổ địa chỉ trống.</p>
                  <button
                    onClick={() => navigate("/customer/addresses")}
                    className="mt-2 text-orange-600 font-bold hover:underline text-sm"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}