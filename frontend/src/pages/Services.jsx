import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaTruckMoving,
  FaWarehouse,
  FaBolt,
  FaShieldAlt,
  FaUserSecret,
  FaArrowRight,
  FaPhoneAlt,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Service() {
  const miniBarRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
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
          const scale = 1 - progress * 0.12;
          const opacity = 1 - progress * 0.5;
          imgRef.current.style.transform = `scale(${scale})`;
          imgRef.current.style.opacity = opacity;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);



  const services = [
    {
      id: "01",
      title: "Vận chuyển hàng hóa",
      desc: "Cam kết đúng giờ, an toàn và tối ưu chi phí cho mọi doanh nghiệp. Mạng lưới phủ sóng 63 tỉnh thành.",
      icon: <FaTruckMoving />,
      link: "/services/road",
      color: "blue",
    },
    {
      id: "02",
      title: "Lưu trữ kho bãi",
      desc: "Hệ thống kho bãi rộng rãi, lưu trữ hàng hóa thông minh và cẩn trọng với công nghệ WMS hiện đại.",
      icon: <FaWarehouse />,
      link: "/services/warehouse",
      color: "orange",
    },
    {
      id: "03",
      title: "Giao hàng hỏa tốc",
      desc: "Giải pháp vận chuyển nội thành siêu tốc độ. Cam kết giao nhận đúng hẹn từng phút cho đơn hàng gấp.",
      icon: <FaBolt />,
      link: "/services/express",
      color: "red",
    },
    {
      id: "04",
      title: "Bảo hiểm hàng hóa",
      desc: "Bảo vệ 100% giá trị hàng hóa trước mọi rủi ro mất mát, hư hỏng trong quá trình vận chuyển.",
      icon: <FaShieldAlt />,
      link: "/policy/claims",
      color: "green",
    },
    {
      id: "05",
      title: "Chính sách bảo mật",
      desc: "Cam kết của SpeedyShip về việc bảo vệ dữ liệu và quyền riêng tư của khách hàng tuyệt đối.",
      icon: <FaUserSecret />,
      link: "/policy/privacy",
      color: "slate",
    },
  ];

  return (
    <div className="font-sans bg-slate-50 text-slate-700">
      {/* Mini-bar - luôn tồn tại trong DOM, ẩn/hiện qua CSS transform */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#113e48]/97 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{
          opacity: 0,
          transform: "translateY(-110%)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            ✦ Hệ Sinh Thái Dịch Vụ SpeedyShip
          </span>
          <div className="flex items-center gap-3">
            {[
              { num: "5+", label: "Dịch vụ" },
              { num: "63", label: "Tỉnh thành" },
              { num: "24/7", label: "Hỗ trợ" },
              { num: "100%", label: "Minh bạch" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-blue-400/20 backdrop-blur-sm border border-blue-200/20 rounded-full px-3 py-1">
                <span className="text-white font-extrabold text-sm leading-none">{s.num}</span>
                <span className="text-white/70 text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh - zoom-out mượt khi cuộn */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src="/assets/img/services_banner.png"
          alt="SpeedyShip Services"
          className="w-full block object-contain"
          style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
        />
      </section>

      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #113e48 50%, #1a5c6e 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Trái: tiêu đề */}
          <div data-aos="fade-right">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 tracking-widest uppercase backdrop-blur-sm">
              Hệ sinh thái Logistics
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
              Giải Pháp Vận Chuyển <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                Toàn Diện &amp; Hiệu Quả
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              SpeedyShip cung cấp đa dạng các dịch vụ từ vận chuyển, kho bãi đến bảo hiểm hàng hóa,
              giúp doanh nghiệp tối ưu hóa chuỗi cung ứng.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#services-list"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Xem dịch vụ ↓
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-[#113e48] text-white font-bold rounded-full transition-all flex items-center gap-2"
              >
                Liên hệ ngay
              </a>
            </div>
          </div>

          {/* Phải: stats cards */}
          <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
            {[
              { num: "5+", label: "Dịch vụ", sub: "Toàn diện", color: "from-blue-400/25 to-blue-600/15" },
              { num: "63", label: "Tỉnh thành", sub: "Phủ sóng cả nước", color: "from-indigo-400/25 to-indigo-600/15" },
              { num: "24/7", label: "Hỗ trợ", sub: "Luôn sẵn sàng", color: "from-slate-400/25 to-slate-600/15" },
              { num: "100%", label: "Minh bạch", sub: "Không phí ẩn", color: "from-blue-500/25 to-indigo-700/15" },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-lg`} data-aos="zoom-in" data-aos-delay={i * 80}>
                <div className="text-3xl font-extrabold text-white mb-1">{s.num}</div>
                <div className="text-sm font-bold text-white/90">{s.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Phần giao diện */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-colors duration-300
                  ${
                    item.color === "blue"
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    item.color === "orange"
                      ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    item.color === "red"
                      ? "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    item.color === "green"
                      ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    item.color === "slate"
                      ? "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white"
                      : ""
                  }
                `}
                >
                  {item.icon}
                </div>
                <span className="text-4xl font-black text-gray-100 select-none group-hover:text-gray-200 transition-colors">
                  {item.id}
                </span>
              </div>

              {/* Tiêu đề nội dung */}
              <h3 className="text-xl font-bold text-[#113e48] mb-3 group-hover:text-orange-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                {item.desc}
              </p>

              {/* Phần giao diện */}
              <Link
                to={item.link}
                className="inline-flex items-center gap-2 font-bold text-sm text-[#113e48] hover:text-orange-600 hover:gap-3 transition-all mt-auto"
              >
                Xem chi tiết <FaArrowRight />
              </Link>
            </div>
          ))}

          {/* Phần giao diện */}
          <div
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-center items-center text-center group h-full"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <h3 className="text-2xl font-bold mb-4">Bạn cần tư vấn riêng?</h3>
            <p className="text-white/90 text-sm mb-8">
              Liên hệ ngay với đội ngũ chuyên gia của chúng tôi để nhận giải
              pháp tối ưu nhất cho doanh nghiệp của bạn.
            </p>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-orange-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all w-full flex items-center justify-center gap-2"
            >
              <FaPhoneAlt /> Liên hệ ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#113e48] mb-6">
            Đồng hành cùng sự phát triển của bạn
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Hàng ngàn doanh nghiệp đã tin tưởng lựa chọn SpeedyShip làm đối tác
            vận chuyển chiến lược. Còn bạn thì sao?
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-10 py-3 bg-[#113e48] text-white font-bold rounded-full hover:bg-orange-500 transition-all shadow-lg"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}