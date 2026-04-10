// src/layouts/DriverLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  History,
  UserCircle,
  LogOut,
  Home,
  Menu,
  X,
  User,
} from "lucide-react";

export default function DriverLayout() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // State quản lý sidebar trên mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State User
  const [driverId, setDriverId] = useState(
    paramId || localStorage.getItem("userId"),
  );
  const username = localStorage.getItem("username") || "Tài xế";

  // Kiểm tra đăng nhập
  useEffect(() => {
    const storedId = localStorage.getItem("userId");

    // Nếu không có ID trong URL và trong Storage cũng không có -> Đá về Login
    if (!storedId) {
      navigate("/login");
      return;
    }

    // Nếu URL không có ID nhưng Storage có -> Điều hướng về đúng URL
    if (!paramId && storedId) {
      setDriverId(storedId);
      navigate(`/driver/${storedId}`, { replace: true });
    }
    // Nếu URL có ID nhưng khác Storage (cố tình nhập ID khác) -> Cảnh báo hoặc reset về ID đúng
    else if (paramId && paramId !== storedId) {
      // Tùy logic bảo mật, ở đây ta cứ set theo paramId,
      // nhưng đúng ra nên đá về storedId để tránh xem trộm
      setDriverId(storedId);
      navigate(`/driver/${storedId}`, { replace: true });
    }
  }, [paramId, navigate]);

  const handleLogout = () => {
    // Chỉ xóa thông tin user, giữ lại các setting khác (nếu có)
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Component con cho Link để code gọn hơn
  const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      end={to === `/driver/${driverId}`} // Chỉ exact match cho Dashboard
      onClick={() => setIsMobileMenuOpen(false)} // Đóng menu khi click trên mobile
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-white/10 text-white font-bold shadow-lg border-l-4 border-yellow-400"
            : "text-blue-100 hover:bg-blue-600 hover:text-white"
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  if (!driverId) return null; // Hoặc loading spinner

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* --- MOBILE OVERLAY (Mờ nền khi mở menu) --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-6 text-center border-b border-blue-700/50 relative">
          {/* Nút đóng trên mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-blue-300 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>

          <div className="w-20 h-20 mx-auto bg-blue-700 rounded-full flex items-center justify-center mb-3 ring-4 ring-blue-600/30">
            <User size={40} className="text-blue-200" />
          </div>
          <h2 className="text-lg font-medium text-blue-200">Xin chào,</h2>
          <p className="text-xl font-bold text-white truncate">{username}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-blue-950/50 rounded-full text-xs text-blue-300 font-mono border border-blue-800">
            ID: {driverId}
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1">
          <p className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 mt-2">
            Menu chính
          </p>

          <SidebarLink
            to={`/driver/${driverId}`}
            icon={LayoutDashboard}
            label="Tổng quan"
          />
          <SidebarLink
            to={`/driver/${driverId}/assignments`}
            icon={Truck}
            label="Đơn hàng cần giao"
          />
          <SidebarLink
            to={`/driver/${driverId}/history`}
            icon={History}
            label="Lịch sử vận chuyển"
          />
          <SidebarLink
            to={`/driver/${driverId}/profile`}
            icon={UserCircle}
            label="Hồ sơ cá nhân"
          />
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-blue-700/50 space-y-3 bg-blue-900/50">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 bg-blue-800/50 hover:bg-blue-700 text-blue-200 py-2.5 rounded-lg font-medium transition duration-200 border border-blue-700"
          >
            <Home size={18} /> Về trang chủ
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition duration-200 shadow-md shadow-red-900/20"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header (Chỉ hiện trên màn hình nhỏ) */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">
              SpeedyShip Driver
            </span>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
            {username.charAt(0)}
          </div>
        </header>

        {/* Nội dung trang con (Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
