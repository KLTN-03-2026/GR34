import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import PartnerCarousel from "../components/homepage/PartnerCarousel";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaBolt,
  FaShieldAlt,
  FaHeadset,
  FaKey,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";

// Quên mật khẩu
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count <= 0) return;
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [count]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ type: "error", text: "Vui lòng nhập địa chỉ email!" });
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setMessage({
        type: "success",
        text: "Mã OTP đã được gửi tới email của bạn!",
      });
      setStep(2);
      setCount(60);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không tìm thấy email này.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!otp || !newPassword) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập mã OTP và mật khẩu mới!",
      });
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/reset-password", { email, otp, newPassword });
      setMessage({
        type: "success",
        text: "Đổi mật khẩu thành công! Đang chuyển hướng...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Mã OTP không đúng hoặc hết hạn.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {}
      <Navbar />

      {}
      <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] border border-gray-100"
        >
          {}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
            <div className="mb-8">
              <Link to="/" className="inline-block mb-6">
                <img
                  src="/assets/logo/logoSpeedyShip.png"
                  alt="SpeedyShip Logo"
                  className="w-16 h-16 object-contain hover:scale-105 transition-transform"
                />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#113e48] mb-2">
                {step === 1 ? "Quên mật khẩu?" : "Thiết lập mật khẩu mới"}
              </h1>
              <p className="text-gray-500 text-sm">
                {step === 1
                  ? "Nhập email đã đăng ký để nhận mã xác thực (OTP)."
                  : `Chúng tôi đã gửi mã 6 số đến ${email}`}
              </p>
            </div>

            {}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`mb-6 text-xs p-3 rounded-lg border flex items-center gap-2 ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-green-50 text-green-600 border-green-100"
                }`}
              >
                <span>{message.type === "error" ? "⚠️" : ""}</span>{" "}
                {message.text}
              </motion.div>
            )}

            {}
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#113e48] ml-1">
                    Email đăng ký
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      placeholder="admin@speedyship.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium text-sm"
                      autoFocus
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
                        : "bg-[#113e48] hover:bg-[#0d2f36] shadow-blue-900/20"
                    }`}
                >
                  {loading ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      Gửi mã OTP <FaPaperPlane className="text-xs" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#113e48] ml-1">
                    Mã OTP
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <FaKey />
                    </div>
                    <input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-bold text-sm tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#113e48] ml-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <FaLock />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium text-sm"
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
                      Xác nhận đổi mật khẩu{" "}
                      <FaCheckCircle className="text-sm" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={count > 0 || loading}
                    className={`text-xs font-bold transition-colors ${
                      count > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {count > 0
                      ? `Gửi lại mã sau ${count}s`
                      : "Chưa nhận được mã? Gửi lại"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-gray-500 hover:text-[#113e48] text-xs font-bold flex items-center justify-center gap-2 transition-colors mx-auto group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
                Quay lại đăng nhập
              </Link>
            </div>

            {}
            <div className="border-t border-gray-100 pt-6 mt-auto">
              <PartnerCarousel />
            </div>
          </div>

          {}
          <div className="hidden md:flex w-1/2 relative bg-[#113e48] flex-col justify-center p-12 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-2">Quên mật khẩu?</h2>
              <h2 className="text-4xl font-extrabold text-orange-500 mb-8">
                Đừng lo lắng!
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <FaBolt />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-0.5">
                      Khôi phục tức thì
                    </h3>
                    <p className="text-blue-100 text-xs leading-relaxed">
                      Hệ thống gửi mã OTP tự động chỉ trong vài giây.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-0.5">
                      Bảo mật đa lớp
                    </h3>
                    <p className="text-blue-100 text-xs leading-relaxed">
                      Xác thực 2 bước đảm bảo tài khoản của bạn luôn an toàn.
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
                      Gặp khó khăn? Liên hệ ngay với đội ngũ hỗ trợ của chúng
                      tôi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-12 text-[10px] text-gray-400 opacity-60">
              © 2024 SpeedyShip JSC. All rights reserved.
            </div>
          </div>
        </motion.div>
      </div>

      {}
      <Footer />
    </div>
  );
}
