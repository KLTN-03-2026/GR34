import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaKey,
  FaArrowRight,
  FaBolt,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Validate
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên.";
    if (!form.email) newErrors.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Email không hợp lệ.";
    if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu.";
    else if (form.password.length < 6)
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.phone && !/^0\d{9}$/.test(form.phone))
      newErrors.phone = "SĐT không hợp lệ (10 số).";
    if (otpSent && !otp) newErrors.otp = "Vui lòng nhập mã OTP.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Gửi OTP
  const handleSendOtp = async () => {
    setMessage({ type: "", text: "" });
    if (!form.email)
      return setErrors({ ...errors, email: "Nhập email để nhận OTP" });

    try {
      setLoading(true);
      await API.post("/auth/send-otp", { email: form.email });
      setMessage({ type: "success", text: "Mã OTP đã gửi đến email!" });
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi gửi OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) return;
    if (!otpSent)
      return setMessage({
        type: "error",
        text: "Vui lòng xác thực Email trước.",
      });

    try {
      setLoading(true);
      await API.post("/auth/verify-otp", { email: form.email, otp });
      await API.post("/auth/register", form);
      setMessage({
        type: "success",
        text: "Đăng ký thành công! Đang chuyển hướng...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Đăng ký thất bại.",
      });
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
        {/* --- CỘT TRÁI: FORM ĐĂNG KÝ --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
          <div className="mb-6">
            <img
              src="/assets/logo/logoSpeedyShip.png"
              alt="Logo"
              className="w-16 h-16 object-contain mb-4"
            />
            <h1 className="text-2xl font-extrabold text-[#113e48] mb-1">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-500 text-xs">
              Tham gia cùng SpeedyShip ngay hôm nay.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs p-3 rounded-lg border flex items-center gap-2 ${
                    message.type === "error"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-green-50 text-green-600 border-green-100"
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Họ tên */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Họ và tên
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${
                    errors.name ? "border-red-300" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-red-500 ml-1">{errors.name}</p>
              )}
            </div>

            {/* Email + OTP Button */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={otpSent}
                  className={`w-full pl-11 pr-24 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0 || otpSent}
                  className={`absolute right-1.5 top-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                    otpSent
                      ? "bg-green-100 text-green-700 cursor-default"
                      : countdown > 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#113e48] text-white hover:bg-[#0d2f36]"
                  }`}
                >
                  {otpSent
                    ? "Đã gửi"
                    : countdown > 0
                      ? `${countdown}s`
                      : "Gửi OTP"}
                </button>
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 ml-1">{errors.email}</p>
              )}
            </div>

            {/* OTP Input (Hiện khi đã gửi) */}
            <AnimatePresence>
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <label className="text-xs font-bold text-[#113e48] ml-1">
                    Mã OTP
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <FaKey />
                    </div>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Nhập 6 số OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-[10px] text-red-500 ml-1">
                      {errors.otp}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Số điện thoại (Tuỳ chọn)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, phone: val.slice(0, 10) });
                  }}
                  maxLength={10}
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm ${
                    errors.phone ? "border-red-300" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] text-red-500 ml-1">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 mt-2
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
                  Đăng ký ngay <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-orange-600 font-bold hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI: INFO (Giống Login) --- */}
        <div className="hidden md:flex w-1/2 relative bg-[#113e48] flex-col justify-center p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-2">
              Trải nghiệm dịch vụ
            </h2>
            <h2 className="text-4xl font-extrabold text-orange-500 mb-8">
              Đẳng cấp 5 sao
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaBolt />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">
                    Đăng ký siêu tốc
                  </h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Chỉ mất 2 phút để tạo tài khoản và bắt đầu gửi hàng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">
                    Xác thực an toàn
                  </h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Hệ thống OTP bảo vệ tài khoản của bạn ngay từ bước đầu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <FaHeadset />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">
                    Ưu đãi thành viên
                  </h3>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Nhận ngay mã giảm giá cho đơn hàng đầu tiên sau khi đăng ký.
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
