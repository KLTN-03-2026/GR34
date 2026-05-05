import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRocket, FaArrowLeft, FaPlaneDeparture } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ComingSoon({ title = "Dịch vụ mới", icon }) {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-[#113e48] flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Phần giao diện */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Phần giao diện */}
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl"
          data-aos="zoom-in"
        >
          {icon || <FaRocket className="text-4xl text-orange-500" />}
        </div>

        {/* Phần giao diện */}
        <div data-aos="fade-up" data-aos-delay="100">
          <span className="px-4 py-1.5 rounded-full border border-orange-500/50 text-orange-400 text-sm font-bold uppercase tracking-widest bg-orange-500/10">
            Coming Soon
          </span>
        </div>

        {/* Tiêu đề nội dung */}
        <h1
          className="text-4xl md:text-6xl font-extrabold mt-6 mb-4 leading-tight"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {title} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
            Đang cất cánh!
          </span>
        </h1>

        {/* Phần giao diện */}
        <p
          className="text-gray-300 text-lg mb-10 leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Chúng tôi đang nỗ lực hoàn thiện dịch vụ này để mang đến trải nghiệm
          vận chuyển tốt nhất cho bạn. Hãy quay lại sau nhé!
        </p>

        {/* Phần giao diện */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <Link
            to="/"
            className="px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Về trang chủ
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            Liên hệ tư vấn
          </Link>
        </div>
      </div>

      {/* Phần giao diện */}
      <p className="absolute bottom-8 text-gray-500 text-sm">
        © 2026 SpeedyShip. All rights reserved.
      </p>
    </div>
  );
}