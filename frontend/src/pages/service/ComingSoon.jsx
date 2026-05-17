import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaRocket, FaArrowLeft } from "react-icons/fa";
import { Bell } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ComingSoon({ title = "Dịch vụ mới", icon, bannerSrc = "/assets/img/comingsoon_banner.png" }) {
  const miniBarRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!miniBarRef.current) return;
        const scrollY = window.scrollY;
        if (scrollY > 380) {
          miniBarRef.current.style.opacity = "1";
          miniBarRef.current.style.transform = "translateY(0%)";
        } else {
          miniBarRef.current.style.opacity = "0";
          miniBarRef.current.style.transform = "translateY(-110%)";
        }
        if (imgRef.current) {
          const progress = Math.min(scrollY / 600, 1);
          imgRef.current.style.transform = `scale(${1 - progress * 0.12})`;
          imgRef.current.style.opacity = 1 - progress * 0.5;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="font-sans bg-[#0f1e24]">
      {/* Thanh mini */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#113e48]/97 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{ opacity: 0, transform: "translateY(-110%)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            🚀 {title} — Sắp Ra Mắt
          </span>
          <div className="flex items-center gap-3">
            {[
              { num: "Soon", label: "Ra mắt" },
              { num: "Notify", label: "Thông báo" },
              { num: "24/7", label: "Hỗ trợ" },
              { num: "VIP", label: "Ưu tiên" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-purple-400/20 backdrop-blur-sm border border-purple-200/20 rounded-full px-3 py-1">
                <span className="text-white font-extrabold text-sm leading-none">{s.num}</span>
                <span className="text-white/70 text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src={bannerSrc}
          alt="Coming Soon Banner"
          className="w-full block object-contain"
          style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
        />
      </section>

      {/* Nội dung sắp ra mắt */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-white px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #113e48 50%, #203a43 100%)" }}
      >
        {/* Các khối nền động */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Biểu tượng */}
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl"
            data-aos="zoom-in"
          >
            {icon || <FaRocket className="text-4xl text-orange-500" />}
          </div>

          {/* Nhãn */}
          <div data-aos="fade-up" data-aos-delay="100">
            <span className="px-4 py-1.5 rounded-full border border-orange-500/50 text-orange-400 text-sm font-bold uppercase tracking-widest bg-orange-500/10">
              Coming Soon
            </span>
          </div>

          {/* Tiêu đề */}
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

          {/* Mô tả */}
          <p
            className="text-gray-300 text-lg mb-10 leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Chúng tôi đang nỗ lực hoàn thiện dịch vụ này để mang đến trải nghiệm
            vận chuyển tốt nhất cho bạn. Hãy quay lại sau nhé!
          </p>

          {/* Các nút bấm */}
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

        <p className="absolute bottom-8 text-gray-500 text-sm">
          © 2026 SpeedyShip. All rights reserved.
        </p>
      </section>
    </div>
  );
}
