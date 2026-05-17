
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  ChevronRight,
} from "lucide-react";
import DriverNotifications from "../components/DriverNotifications";

// Các biến thể chuyển động cho hiệu ứng chuyển trang - gọn nhẹ
const pageVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function DriverLayout() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const [driverId, setDriverId] = useState(
    paramId || localStorage.getItem("userId")
  );
  const username = localStorage.getItem("username") || "Tài xế";
  const [avatar, setAvatar] = useState(localStorage.getItem("userAvatar") || "");

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatar(localStorage.getItem("userAvatar") || "");
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);


  useEffect(() => {
    const storedId = localStorage.getItem("userId");


    if (!storedId) {
      navigate("/login");
      return;
    }


    if (!paramId && storedId) {
      setDriverId(storedId);
      navigate(`/driver/${storedId}`, { replace: true });
    }

    else if (paramId && paramId !== storedId) {

      setDriverId(storedId);
      navigate(`/driver/${storedId}`, { replace: true });
    }
  }, [paramId, navigate]);

// Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userAvatar");
    navigate("/login");
  };


  const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      end={to === `/driver/${driverId}`}
      onClick={() => setIsMobileMenuOpen(false)}
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

  if (!driverId) return null;

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Hiển thị có điều kiện */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Phần giao diện */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Phần giao diện */}
        <div className="p-6 text-center border-b border-blue-700/50 relative">
          {/* Nút hành động */}
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

        {/* Phần giao diện */}
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

        {/* Phần giao diện */}
        <div className="p-4 bg-blue-950 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover bg-white shadow-inner shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm font-bold text-white shadow-inner shrink-0 leading-none select-none">
                  TX
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate max-w-[100px] group-hover:text-orange-400 transition-colors">
                  {username}
                </h4>
                <p className="text-[10px] text-blue-200">Tài xế SpeedyShip</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-blue-200 hover:text-red-400 transition-colors shrink-0"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Phần giao diện */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Phần giao diện */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between z-10 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">
              SpeedyShip Driver
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <DriverNotifications driverId={driverId} />
            <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>
            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Trang chủ <ChevronRight size={14} />
            </button>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover bg-white shadow-sm shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold shrink-0 leading-none select-none">
                TX
              </div>
            )}
          </div>
        </header>

        {/* Phần giao diện */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
