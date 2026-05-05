import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

import PartnerCarousel from "../components/homepage/PartnerCarousel";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaBolt,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

// Trang đăng nhập
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

// Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email && !form.password) {
      setError("Vui lòng nhập đầy đủ Email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      localStorage.clear();

      const res = await API.post("/auth/login", form);
      const { token, user } = res.data;

      if (!user || !user.id) {
        setError("Không xác định được tài khoản người dùng.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.name);
      localStorage.setItem("userId", user.id.toString());
      if (user.region_id) {
        localStorage.setItem("region_id", String(user.region_id));
      }

      if (user.role === "customer") {
        localStorage.setItem("customer_id", user.id.toString());
      }
      if (user.role === "dispatcher") {
        localStorage.setItem("dispatcher_id", user.id.toString());
      }

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "dispatcher") navigate("/dispatcher");
      else if (user.role === "driver") navigate(`/driver/${user.id}`);
      else navigate("/customer");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 403) return setError(msg || "Tài khoản đã bị vô hiệu hóa");
      if (status === 401) return setError("Sai tài khoản hoặc mật khẩu");
      setError(msg || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px]"
      >
        {}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
          <div className="mb-6">
            <img
              src="/assets/logo/logoSpeedyShip.png"
              alt="SpeedyShip Logo"
              className="w-16 h-16 object-contain mb-4"
            />
            <h1 className="text-2xl font-extrabold text-[#113e48] mb-1">
              Chào mừng trở lại!
            </h1>
            <p className="text-gray-500 text-xs">
              Đăng nhập hệ thống quản lý vận đơn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            {}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="khachhang@speedyship.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium text-sm"
                />
              </div>
            </div>

            {}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-[#113e48]">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  class="text-[10px] font-bold text-orange-500 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                }`}
            >
              {loading ? (
                "Đang xử lý..."
              ) : (
                <>
                  Đăng nhập <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center mb-6">
            <p className="text-xs text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-orange-600 font-bold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {}
          <div className="border-t border-gray-100 pt-2">
            <PartnerCarousel />
          </div>
        </div>

        {}
        <div className="hidden md:flex w-1/2 relative bg-[#113e48] flex-col justify-center p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-2">Tại sao chọn</h2>
            <h2 className="text-4xl font-extrabold text-orange-500 mb-8">
              SpeedyShip?
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaBolt />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Nhanh như chớp</h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Cam kết giao hàng đúng hẹn, tối ưu lộ trình thông minh.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">
                    Bảo mật tuyệt đối
                  </h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Thông tin khách hàng được mã hóa chuẩn quốc tế.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaHeadset />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Hỗ trợ 24/7</h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Giải quyết khiếu nại nhanh chóng, đền bù thỏa đáng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-12 text-[10px] text-gray-400 opacity-60">
            © 2026 SpeedyShip JSC. All rights reserved.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
