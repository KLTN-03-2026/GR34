import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  LogOut,
  LayoutDashboard,
  Truck,
  Map,
  Phone,
  MessageSquare,
  Bell,
  Menu,
  ChevronRight,
  UserCog,
} from "lucide-react";
import DispatcherNotifications from "../components/DispatcherNotifications";

// ⚡ Khởi tạo socket kết nối backend
const socket = io("http://localhost:5000", { transports: ["websocket"] });

export default function DispatcherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "Dispatcher";
  const dispatcherId = localStorage.getItem("dispatcher_id") || 1;
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🚪 Đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // 🟣 Kết nối socket
  useEffect(() => {
    socket.emit("joinDispatcher");
    socket.on("newMessage", (msg) => {
      if (msg.role === "customer") {
        console.log("📩 Tin nhắn mới:", msg);
        if (!location.pathname.includes("/dispatcher/chat")) {
          setHasNewMessage(true);
        }
      }
    });
    return () => socket.off("newMessage");
  }, [location.pathname]);

  // Style cho Link
  const navLinkClasses = ({ isActive }) => `
    relative flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group
    ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 translate-x-1"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    }
  `;

  // Title Header
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dispatcher":
        return "Dashboard điều phối";
      case "/dispatcher/assignments":
        return "Phân công vận chuyển";
      case "/dispatcher/tracking":
        return "Theo dõi lộ trình";
      case "/dispatcher/contacts":
        return "Danh bạ khách hàng";
      case "/dispatcher/chat":
        return "Hỗ trợ trực tuyến";
      default:
        return "Trung tâm điều hành";
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =============== SIDEBAR =============== */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#113e48] text-white flex flex-col shadow-2xl transition-transform duration-300
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* 1. Brand Logo */}
        <div className="h-20 flex items-center px-8 border-b border-white/10 bg-[#0d2f36]">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
              <img
                src="/assets/logo/logoSpeedyShip.png"
                alt="Logo"
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Speedy<span className="text-orange-500">Ship</span>
            </span>
          </div>
        </div>

        {/* 2. Menu */}
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1 custom-scrollbar">
          <p className="px-4 mb-4 text-xs font-bold text-blue-200/60 uppercase tracking-widest">
            Điều hành
          </p>

          <nav className="flex flex-col space-y-1.5">
            <NavLink to="/dispatcher" end className={navLinkClasses}>
              <LayoutDashboard size={20} /> <span>Tổng quan</span>
            </NavLink>

            <NavLink to="/dispatcher/assignments" className={navLinkClasses}>
              <Truck size={20} /> <span>Phân công tài xế</span>
            </NavLink>

            <NavLink to="/dispatcher/tracking" className={navLinkClasses}>
              <Map size={20} /> <span>Theo dõi đơn hàng</span>
            </NavLink>

            <NavLink to="/dispatcher/contacts" className={navLinkClasses}>
              <Phone size={20} /> <span>Liên hệ khách hàng</span>
            </NavLink>

            <p className="px-4 mt-8 mb-4 text-xs font-bold text-blue-200/60 uppercase tracking-widest">
              Hỗ trợ & CSKH
            </p>

            <NavLink
              to="/dispatcher/chat"
              onClick={() => setHasNewMessage(false)}
              className={navLinkClasses}
            >
              <MessageSquare size={20} />
              <span className="flex-1">Hỗ trợ khách hàng</span>
              {hasNewMessage && (
                <span className="absolute right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              {hasNewMessage && (
                <span className="absolute right-4 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#113e48]" />
              )}
            </NavLink>
          </nav>
        </div>

        {/* 3. User Profile */}
        <div className="p-4 bg-[#0d2f36] border-t border-white/5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-inner shrink-0">
                <UserCog size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate max-w-[100px]">
                  {username}
                </h4>
                <p className="text-[10px] text-blue-200">Điều phối viên</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-blue-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* =============== MAIN CONTENT =============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER BAR */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-40 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-extrabold text-[#113e48]">
                {getPageTitle()}
              </h2>
              <p className="hidden md:block text-xs text-gray-400 mt-1">
                Hệ thống quản lý vận tải tập trung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Component Thông Báo */}
            <div className="relative">
              <DispatcherNotifications dispatcherId={dispatcherId} />
            </div>

            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-bold text-[#113e48] hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Trang chủ</span>{" "}
              <ChevronRight size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
