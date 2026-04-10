import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ChevronDownIcon,
  UserIcon,
  LogoutIcon,
  DashboardIcon,
} from "../assets/icons/ui";

const CustomMenuIcon = () => (
  <svg
    className="w-7 h-7"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

const CustomCloseIcon = () => (
  <svg
    className="w-7 h-7"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [name, setName] = useState(localStorage.getItem("username") || "User");

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("username") || "User");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setName("");
    navigate("/login");
  };

  const handleGoToDashboard = () => {
    if (!role) return navigate("/login");
    const paths = {
      admin: "/admin",
      dispatcher: "/dispatcher",
      driver: `/driver/${localStorage.getItem("userId")}`,
      customer: "/customer",
    };
    navigate(paths[role] || "/");
  };

  // THÊM HÀM XỬ LÝ NÚT GỬI HÀNG NGAY TẠI ĐÂY
  const handleCreateOrder = () => {
    if (!role) {
      // Yêu cầu đăng nhập nếu chưa có role
      navigate("/login");
    } else if (role !== "customer") {
      // Ngăn các role khác (admin, driver, dispatcher) tạo đơn hàng
      alert("Chức năng tạo đơn hàng chỉ dành cho tài khoản Khách hàng.");
    } else {
      // Nếu đúng là khách hàng thì cho phép chuyển hướng
      navigate("/customer/create-order");
    }
  };

  const getRoleLabel = (r) => {
    const roles = {
      admin: "Quản trị viên",
      dispatcher: "Điều phối viên",
      driver: "Tài xế",
      customer: "Khách hàng",
    };
    return roles[r] || "Thành viên";
  };

  const getInitials = (n) => (n ? n.charAt(0).toUpperCase() : "U");

  const NavLink = ({ to, children }) => (
    <Link to={to} className="relative group py-4">
      <span className="font-bold text-slate-700 uppercase hover:text-orange-600 transition-colors duration-300 text-sm tracking-wide whitespace-nowrap">
        {children}
      </span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      {/* ===== TOP BAR ===== */}
      <div
        className={`bg-slate-900 text-white text-xs md:text-sm transition-all duration-300 overflow-hidden ${
          scrolled ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 h-full flex justify-between items-center font-medium">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="bg-green-500 rounded-full w-2 h-2 inline-block animate-pulse"></span>
            Top 10 Đơn vị vận chuyển uy tín 2024
          </span>
          <div className="flex gap-4 opacity-90 text-gray-200 whitespace-nowrap">
            <span className="hidden sm:inline">✉ contact@speedyship.vn</span>
            <span>📞 1900 1234 (24/7)</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN NAV ===== */}
      <nav
        className={`transition-all duration-300 border-b border-gray-100 ${
          scrolled ? "bg-white/95 backdrop-blur-md py-2" : "bg-white py-3"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <img
              src="/assets/logo/logoSpeedyShip.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tighter whitespace-nowrap">
              SpeedyShip<span className="text-orange-500">VN</span>
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 shrink-0">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/about">Giới thiệu</NavLink>

            {/* DỊCH VỤ DROPDOWN */}
            <div className="relative group py-2">
              <span className="cursor-pointer font-bold text-slate-700 uppercase hover:text-orange-600 transition-colors text-sm tracking-wide flex items-center whitespace-nowrap">
                Dịch vụ{" "}
                <ChevronDownIcon className="w-5 h-5 ml-1 opacity-70 group-hover:rotate-180 transition" />
              </span>

              <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 mt-2 overflow-hidden">
                <div className="h-1 bg-orange-500"></div>
                <div className="p-1">
                  <Link
                    to="/tracking"
                    className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors group/item"
                  >
                    <span className="flex items-center gap-2">
                      🔍 Tra cứu vận đơn
                    </span>
                    <span className=" text-[10px] font-bold bg-red-500 text-white px-2 py-0 rounded border border-gray-200 group-hover/item:bg-orange-100 group-hover/item:text-orange-600 group-hover/item:border-orange-200 transition-all whitespace-nowrap">
                      Hot
                    </span>
                  </Link>
                  <Link
                    to="/services/road"
                    className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors group/item"
                  >
                    <span className="flex items-center gap-2">
                      🚛 Vận chuyển Đường bộ
                    </span>
                    <span className=" text-[10px] font-bold bg-red-500 text-white px-2 py-0 rounded border border-gray-200 group-hover/item:bg-orange-100 group-hover/item:text-orange-600 group-hover/item:border-orange-200 transition-all whitespace-nowrap">
                      Hot
                    </span>
                  </Link>
                  <Link
                    to="/services/air"
                    className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors group/item"
                  >
                    <span className="flex items-center gap-2">
                      ✈️ Vận chuyển Hàng không
                    </span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 group-hover/item:bg-orange-100 group-hover/item:text-orange-600 group-hover/item:border-orange-200 transition-all whitespace-nowrap">
                      Sắp ra mắt
                    </span>
                  </Link>
                  <Link
                    to="/services/warehouse"
                    className="block px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors"
                  >
                    🏭 Kho bãi & Lưu trữ
                  </Link>
                  <Link
                    to="/services/express"
                    className="block px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors"
                  >
                    ⚡ Giao hàng hỏa tốc
                  </Link>
                  <Link
                    to="/services/price-list"
                    className="block px-4 py-3 hover:bg-orange-50 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                  >
                    💸 Bảng giá dịch vụ
                  </Link>
                </div>
              </div>
            </div>

            <NavLink to="/apply-driver">Tuyển dụng</NavLink>

            {/* CHÍNH SÁCH DROPDOWN */}
            <div className="relative group py-2">
              <span className="cursor-pointer font-bold text-slate-700 uppercase hover:text-orange-600 transition-colors text-sm tracking-wide flex items-center whitespace-nowrap">
                Chính sách{" "}
                <ChevronDownIcon className="w-5 h-5 ml-1 opacity-70 group-hover:rotate-180 transition" />
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 mt-2 overflow-hidden">
                <div className="h-1 bg-blue-500"></div>
                <div className="p-1">
                  <Link
                    to="/policy/privacy"
                    className="block px-4 py-3 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    🛡️ Bảo mật thông tin
                  </Link>
                  <Link
                    to="/policy/claims"
                    className="block px-4 py-3 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    ⚖️ Giải quyết khiếu nại
                  </Link>
                  <Link
                    to="/policy/terms"
                    className="block px-4 py-3 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    📝 Điều khoản sử dụng
                  </Link>
                  <Link
                    to="/policy/shipping-rules"
                    className="block px-4 py-3 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    📦 Quy định gửi hàng
                  </Link>
                </div>
              </div>
            </div>

            <NavLink to="/contact">Liên hệ</NavLink>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            {/* UPDATE: GẮN SỰ KIỆN onClick VÀO NÚT BỎ THẺ Link */}
            <button
              onClick={handleCreateOrder}
              className="hidden md:flex relative overflow-hidden group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-2 rounded-full shadow-md hover:shadow-orange-500/30 transition-all items-center gap-2 transform active:scale-95 whitespace-nowrap"
            >
              <span className="relative z-10 text-sm flex items-center gap-2">
                <i className="fas fa-paper-plane"></i> GỬI HÀNG NGAY
              </span>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
            </button>

            {role ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-all border border-transparent hover:border-gray-200 group"
                >
                  <div className="text-right hidden xl:block leading-tight">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">
                      {getRoleLabel(role)}
                    </p>
                    <p className="text-sm font-bold text-slate-800 max-w-[100px] truncate">
                      {name}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white group-hover:ring-orange-200 transition-all shrink-0">
                    {getInitials(name)}
                  </div>
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 transform origin-top-right transition-all duration-200 z-50 overflow-hidden ${
                    userDropdownOpen
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible"
                  }`}
                >
                  <div className="p-4 border-b border-gray-50 xl:hidden bg-slate-50/50">
                    <p className="font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-orange-500 font-semibold uppercase">
                      {getRoleLabel(role)}
                    </p>
                  </div>

                  <div className="p-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleGoToDashboard();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <DashboardIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Dashboard</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          Quản lý hệ thống
                        </span>
                      </div>
                    </button>

                    <Link
                      to="/customer/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-gray-100 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Tài khoản</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          Thông tin cá nhân
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <LogoutIcon className="w-4 h-4" />
                      </div>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4 ml-4 border-l border-gray-200 pl-4 shrink-0">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors whitespace-nowrap"
                >
                  ĐĂNG NHẬP
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-orange-50 text-orange-600 text-sm font-bold rounded-full hover:bg-orange-100 transition-colors border border-orange-200 whitespace-nowrap"
                >
                  ĐĂNG KÝ
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none ml-2"
            >
              {mobileMenuOpen ? <CustomCloseIcon /> : <CustomMenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-screen opacity-100 border-t mt-2"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-1 bg-white shadow-inner">
          <Link
            to="/"
            className="block py-2.5 px-4 font-semibold text-slate-700 hover:bg-gray-50 rounded-lg"
          >
            Trang chủ
          </Link>
          <Link
            to="/about"
            className="block py-2.5 px-4 font-semibold text-slate-700 hover:bg-gray-50 rounded-lg"
          >
            Giới thiệu
          </Link>

          {/* Mobile Dịch vụ */}
          <div className="py-2 px-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Dịch vụ
            </p>
            <div className="space-y-1 border-l-2 border-gray-100 pl-3">
              <div className="flex items-center justify-between py-1.5 pr-2 text-sm text-gray-400 cursor-not-allowed select-none">
                <span className="flex items-center gap-1">✈️ Hàng không</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                  Sắp ra mắt
                </span>
              </div>
              <Link
                to="/services/road"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600 transition-colors"
              >
                🚛 Vận chuyển Đường bộ
              </Link>
              <Link
                to="/services/warehouse"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600 transition-colors"
              >
                🏭 Kho bãi & Lưu trữ
              </Link>
              <Link
                to="/services/express"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600 transition-colors"
              >
                ⚡ Giao hàng hỏa tốc
              </Link>
              <Link
                to="/services/price-list"
                className="block py-1.5 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
              >
                💸 Bảng giá dịch vụ
              </Link>
            </div>
          </div>

          {/* Mobile Chính sách */}
          <div className="py-2 px-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Chính sách
            </p>
            <div className="space-y-1 border-l-2 border-gray-100 pl-3">
              <Link
                to="/policy/privacy"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600"
              >
                🛡️ Bảo mật
              </Link>
              <Link
                to="/policy/claims"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600"
              >
                ⚖️ Khiếu nại
              </Link>
              <Link
                to="/policy/terms"
                className="block py-1.5 text-sm text-slate-600 hover:text-orange-600"
              >
                📝 Điều khoản
              </Link>
            </div>
          </div>

          <Link
            to="/contact"
            className="block py-2.5 px-4 font-semibold text-slate-700 hover:bg-gray-50 rounded-lg"
          >
            Liên hệ
          </Link>

          {!role && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t mt-2">
              <Link
                to="/login"
                className="text-center py-2.5 bg-gray-100 rounded-lg font-bold text-slate-700"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-center py-2.5 bg-orange-500 text-white rounded-lg font-bold"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
