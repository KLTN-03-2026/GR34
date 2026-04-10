import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0a1f26] text-white pt-20 pb-10 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- PHẦN TRÊN: 4 CỘT --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Cột 1: Thông tin công ty */}
          <div data-aos="fade-up">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/assets/logo/logoSpeedyShip.png"
                alt="SpeedyShip Logo"
                className="w-10 h-10 object-contain brightness-0 invert"
              />
              <span className="text-2xl font-extrabold tracking-tight">
                SpeedyShip<span className="text-orange-500">VN</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Nền tảng giao hàng thông minh hàng đầu Việt Nam. Chúng tôi kết nối
              hàng triệu đơn hàng mỗi ngày với cam kết Nhanh chóng - An toàn -
              Minh bạch.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all duration-300"
                  >
                    <Icon size={14} />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h4 className="text-lg font-bold text-white mb-5 uppercase tracking-wider">
              Liên kết nhanh
            </h4>
            <ul className="mt-2 space-y-3 text-sm text-gray-400">
              {["Về chúng tôi"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to="about"
                    className="hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <span className="text-orange-500/50">›</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-2 space-y-3 text-sm text-gray-400">
              {["Dịch vụ vận chuyển"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to="services/road"
                    className="hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <span className="text-orange-500/50">›</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-2 space-y-3 text-sm text-gray-400">
              {["Bảng giá"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to="services/price-list"
                    className="hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <span className="text-orange-500/50">›</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-2 space-y-3 text-sm text-gray-400 top-1">
              {["Tuyển dụng tài xế"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to="/apply-driver"
                    className="hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <span className="text-orange-500/50">›</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-2 space-y-3 text-sm text-gray-400">
              {["Giao hàng hỏa tốc"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to="services/express"
                    className="hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <span className="text-orange-500/50">›</span> {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ (Có icon) */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-500 mt-1 shrink-0" />
                <span>
                  55 Nguyễn Văn Linh, Q. Hải Châu,
                  <br /> TP. Đà Nẵng, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-orange-500 shrink-0" />
                <span className="font-bold text-white">1900 888 999</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-orange-500 shrink-0" />
                <span>support@speedyship.vn</span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin (Newsletter) */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Đăng ký nhận tin
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Nhận thông tin khuyến mãi và bảng giá mới nhất từ chúng tôi.
            </p>
            <form className="relative">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 border border-gray-700 placeholder-gray-500"
              />
              <button
                type="button"
                className="absolute right-1 top-1 bottom-1 bg-orange-500 hover:bg-orange-600 text-white px-3 rounded-md transition-colors"
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* --- DÒNG KẺ NGANG --- */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* --- PHẦN DƯỚI: COPYRIGHT & CHÍNH SÁCH --- */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-bold">SpeedyShip VN</span>. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
