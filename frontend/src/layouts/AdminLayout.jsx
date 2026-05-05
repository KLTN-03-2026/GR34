import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  CreditCard,
  MessageSquare,
  UserCog,
  Phone,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
  ShieldCheck,
  Newspaper,
  FileText,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const username = localStorage.getItem("username") || "Administrator";


  // Danh sách menu điều hướng sidebar admin
  const MENU_ITEMS = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      end: true,
    },
    {
      path: "/admin/shipments",
      label: "Quản lý đơn hàng",
      icon: <Package size={20} />,
    },
    {
      path: "/admin/drivers",
      label: "Quản lý tài xế",
      icon: <Truck size={20} />,
    },
    {
      path: "/admin/customers",
      label: "Quản lý khách hàng",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/payments",
      label: "Quản lý thanh toán",
      icon: <CreditCard size={20} />,
    },
    {
      path: "/admin/feedbacks",
      label: "Đánh giá & Phản hồi",
      icon: <MessageSquare size={20} />,
    },
    {
      path: "/admin/users",
      label: "Phân quyền hệ thống",
      icon: <UserCog size={20} />,
    },
    {
      path: "/admin/contact",
      label: "Quản lý liên hệ",
      icon: <Phone size={20} />,
    },
    {
      path: "/admin/news",
      label: "Quản lý Tin tức",
      icon: <Newspaper size={20} />,
    },
  ];


// Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi quyền Admin?")) {
      localStorage.clear();
      navigate("/login");
    }
  };


  // Hàm trả về class CSS cho NavLink, active thì nổi bật màu cam
  const navLinkClasses = ({ isActive }) => `
    relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group
    ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 translate-x-1"
        : "text-blue-100 hover:bg-white/10 hover:text-white"
    }
  `;


  // Lấy tiêu đề trang dựa theo đường dẫn hiện tại
  const getPageTitle = () => {
    if (location.pathname.startsWith("/admin/shipments/")) {
      return "Chi tiết vận đơn";
    }
    const currentItem = MENU_ITEMS.find(
      (item) => item.path === location.pathname
    );
    return currentItem ? currentItem.label : "Admin Control Panel";
  };

  // Lấy icon trang cho header, hiển thị icon vận đơn khi xem chi tiết shipment
  const getPageIcon = () => {
    if (location.pathname.startsWith("/admin/shipments/")) {
      return <FileText size={22} className="text-orange-500" />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Overlay mờ khi sidebar mở trên mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar điều hướng chính */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#113e48] text-white flex flex-col shadow-2xl transition-transform duration-300
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Logo và tên thương hiệu */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 bg-[#0d2f36]">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_3px_rgba(255,255,255,0.15)] shrink-0 overflow-hidden">
              <img
                src="/assets/logo/logoSpeedyShip.png"
                alt="Logo"
                className="w-full h-full object-contain scale-125"
              />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">
                Speedy<span className="text-orange-500">Ship</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách menu điều hướng */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <p className="px-4 mb-3 text-xs font-bold text-blue-200/50 uppercase tracking-widest">
            Hệ thống
          </p>
          <nav className="flex flex-col space-y-1.5">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                className={navLinkClasses}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Thông tin admin và nút đăng xuất */}
        <div className="p-4 bg-[#0d2f36] border-t border-white/5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-inner shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate max-w-[100px]">
                  {username}
                </h4>
                <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>{" "}
                  Online
                </p>
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

      {/* Vùng nội dung chính bên phải sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header thanh trên cùng: tiêu đề trang + nút thông báo + về trang chủ */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-extrabold text-[#113e48] flex items-center gap-2">
                {getPageIcon()}
                {getPageTitle()}
              </h2>
              <p className="hidden md:block text-xs text-gray-400 mt-0.5">
                Quản trị viên hệ thống cấp cao
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Nút thông báo bell với badge đỏ */}
            <button className="relative p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

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

        {/* Vùng render nội dung trang con qua Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
