import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomerNotifications from "../components/CustomerNotifications";
import {
  LogOut,
  Home,
  PlusCircle,
  Search,
  Clock,
  User,
  Bell,
  ChevronRight,
  MapPin,
  Wallet,
  Headphones,
  Gift,
  Menu,
  X,
  FileText,
} from "lucide-react";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "Khách hàng";
  const customerId = localStorage.getItem("customer_id") || localStorage.getItem("userId");


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

// Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const navLinkClasses = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative
    ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 translate-x-1"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    }
  `;


  const getPageTitle = () => {
    switch (location.pathname) {
      case "/customer":
        return "Dashboard";
      case "/customer/create":
      case "/customer/create-order":
        return "Tạo đơn hàng mới";
      case "/customer/track":
        return "Tra cứu vận đơn";
      case "/customer/history":
        return "Lịch sử đơn hàng";
      case "/customer/addresses":
        return "Sổ địa chỉ";
      case "/customer/wallet":
        return "Ví & Thanh toán";
      case "/customer/support":
        return "Hỗ trợ khách hàng";
      case "/customer/invoices":
        return "Xuất phiếu giao hàng";
      case "/customer/profile":
        return "Hồ sơ cá nhân";
      default:
        return "Bảng điều khiển";
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Render điều kiện */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Phần giao diện */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#113e48] text-white flex flex-col shadow-2xl 
          transition-transform duration-300 ease-in-out transform
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Phần giao diện */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 border-b border-white/10 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_3px_rgba(255,255,255,0.15)] shrink-0 overflow-hidden">
              <img
                src="/assets/logo/logoSpeedyShip.png"
                alt="Logo"
                className="w-full h-full object-contain scale-125"
              />
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight">
              Speedy<span className="text-orange-500">Ship</span>
            </span>
          </div>

          {/* Nút hành động */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Phần giao diện */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {/* Phần giao diện */}
          <div>
            <p className="px-4 mb-2 text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">
              Quản lý vận đơn
            </p>
            <nav className="flex flex-col space-y-1">
              <NavLink to="/customer" end className={navLinkClasses}>
                <Home size={18} /> <span>Tổng quan</span>
              </NavLink>
              <NavLink to="/customer/create-order" className={navLinkClasses}>
                <PlusCircle size={18} /> <span>Tạo đơn hàng</span>
              </NavLink>
              <NavLink to="/customer/track" className={navLinkClasses}>
                <Search size={18} /> <span>Tra cứu đơn</span>
              </NavLink>
              <NavLink to="/customer/history" className={navLinkClasses}>
                <Clock size={18} /> <span>Lịch sử đơn</span>
              </NavLink>
            </nav>
          </div>

          {/* Phần giao diện */}
          <div>
            <p className="px-4 mb-2 text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">
              Tiện ích
            </p>
            <nav className="flex flex-col space-y-1">
              <NavLink to="/customer/addresses" className={navLinkClasses}>
                <MapPin size={18} /> <span>Sổ địa chỉ</span>
              </NavLink>
              <NavLink to="/customer/wallet" className={navLinkClasses}>
                <Wallet size={18} /> <span>Ví & Thanh toán</span>
              </NavLink>
              <NavLink to="/customer/support" className={navLinkClasses}>
                <Headphones size={18} /> <span>Hỗ trợ</span>
              </NavLink>
              <NavLink to="/customer/invoices" className={navLinkClasses}>
                <FileText size={18} /> <span>Xuất phiếu giao hàng</span>
              </NavLink>
            </nav>
          </div>

          {/* Phần giao diện */}
          <div>
            <p className="px-4 mb-2 text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">
              Cài đặt
            </p>
            <nav className="flex flex-col space-y-1">
              <NavLink to="/customer/profile" className={navLinkClasses}>
                <User size={18} /> <span>Hồ sơ cá nhân</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="p-4 bg-[#0d2f36] border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm font-bold text-white shadow-inner shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate max-w-[100px] group-hover:text-orange-400 transition-colors">
                  {username}
                </h4>
                <p className="text-[10px] text-blue-200">Thành viên Bạc</p>
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
        <header className="h-16 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Nút hành động */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-extrabold text-[#113e48] truncate max-w-[150px] sm:max-w-[300px]">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <CustomerNotifications customerId={customerId} />
            <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>
            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center gap-1 text-xs font-bold text-[#113e48] hover:text-orange-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              Trang chủ <ChevronRight size={14} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 scroll-smooth w-full">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}