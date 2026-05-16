import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaBolt,
  FaClock,
  FaMapMarkerAlt,
  FaRocket,
  FaShieldAlt,
  FaCheckCircle,
  FaMotorcycle,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ExpressDelivery() {
  const imgRef = useRef(null);
  const miniBarRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);

    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (imgRef.current) {
          const scale = Math.max(0.88, 1 - scrollY * 0.00018);
          const opacity = Math.max(0.45, 1 - scrollY * 0.0014);
          imgRef.current.style.transform = `scale(${scale})`;
          imgRef.current.style.opacity = opacity;
        }
        if (miniBarRef.current) {
          if (scrollY > 380) {
            miniBarRef.current.style.opacity = "1";
            miniBarRef.current.style.transform = "translateY(0)";
          } else {
            miniBarRef.current.style.opacity = "0";
            miniBarRef.current.style.transform = "translateY(-110%)";
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const servicePackages = [
    {
      name: "Hỏa Tốc 2H",
      icon: <FaBolt />,
      desc: "Giao nhận siêu tốc nội thành chỉ trong 2 giờ. Dành cho hồ sơ gấp, thực phẩm, thuốc men.",
      price: "Từ 35.000đ",
      features: [
        "Lấy hàng trong 30p",
        "Giao ngay không ghép đơn",
        "Ưu tiên cao nhất",
      ],
      color: "from-red-500 to-orange-500",
      recommeded: true,
    },
    {
      name: "Nhanh 4H",
      icon: <FaMotorcycle />,
      desc: "Giải pháp tối ưu chi phí cho đơn hàng cần giao trong buổi (Sáng lấy chiều giao).",
      price: "Từ 25.000đ",
      features: [
        "Lấy hàng trước 11h",
        "Giao trước 17h cùng ngày",
        "Ghép đơn thông minh",
      ],
      color: "from-blue-600 to-blue-400",
      recommeded: false,
    },
    {
      name: "Trong Ngày (Same Day)",
      icon: <FaClock />,
      desc: "Giao hàng trước 22h cùng ngày với chi phí tiết kiệm nhất cho shop online.",
      price: "Từ 20.000đ",
      features: [
        "Lấy hàng trước 16h",
        "Giao xong trước 22h",
        "Phủ sóng toàn nội thành",
      ],
      color: "from-[#113e48] to-slate-700",
      recommeded: false,
    },
  ];

  return (
    <div className="font-sans bg-slate-50 text-slate-700">
      {/* Khối nội dung */}
      {/* Mini-bar - luôn tồn tại trong DOM, ẩn/hiện qua CSS transform */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#1a0a00]/95 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{
          opacity: 0,
          transform: "translateY(-110%)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Tên dịch vụ */}
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            <FaBolt className="inline w-5 h-5 mr-1" /> Giao Hàng Hỏa Tốc — Nhanh Như Chớp
          </span>
          {/* 4 stat pills */}
          <div className="flex items-center gap-3">
            {[
              { num: "60'", label: "Giao Trong" },
              { num: "24/7", label: "Hoạt Động" },
              { num: "100%", label: "Đền Bù" },
              { num: "VIP", label: "Ưu Tiên" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-red-400/20 backdrop-blur-sm border border-red-200/20 rounded-full px-3 py-1">
                <span className="text-white font-extrabold text-sm leading-none">{s.num}</span>
                <span className="text-white/70 text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh - zoom-out mườ́t khi cuộn */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src="/assets/img/services_expressbanner.png"
          alt="Fast Delivery"
          className="w-full block object-contain"
          style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
        />
      </section>

      {/* Tiêu đề trang - section đẹp bên dưới ảnh */}
      <section className="relative overflow-hidden py-16 px-6" style={{background: "linear-gradient(135deg, #1a0a00 0%, #3d0e00 40%, #6b1a00 100%)"}}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Trái: tiêu đề + nút */}
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-red-600/80 text-white font-bold text-xs uppercase tracking-widest mb-6 border border-red-400/40 shadow-lg shadow-red-900/50">
              <FaBolt className="animate-pulse" /> Dịch vụ Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
              Giao Hàng Hỏa Tốc <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-300">
                Nhanh Như Chớp
              </span>
            </h1>
            <p className="text-red-100/80 text-lg leading-relaxed mb-8 max-w-xl">
              Giải pháp vận chuyển nội thành siêu tốc độ. Cam kết giao nhận đúng
              hẹn từng phút, "cứu nguy" cho các đơn hàng gấp của bạn.
            </p>
            <Link
              to="/customer/create-order"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-700/40 hover:-translate-y-1 transition-all"
            >
              Đặt xe Hỏa Tốc <FaArrowRight />
            </Link>
          </div>

          {/* Phải: stats tốc độ */}
          <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
            {[
              { num: "60'", label: "Giao Trong", sub: "Nội thành tối thiểu", color: "from-red-400/25 to-red-600/15" },
              { num: "24/7", label: "Hoạt Động", sub: "Không nghỉ lễ", color: "from-orange-400/25 to-orange-600/15" },
              { num: "100%", label: "Đền Bù", sub: "Nếu giao trễ", color: "from-rose-400/25 to-rose-600/15" },
              { num: "VIP", label: "Ưu Tiên", sub: "Xử lý hàng đầu", color: "from-red-500/25 to-orange-500/15" },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.color} backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-lg`}
                data-aos="zoom-in"
                data-aos-delay={i * 100}
              >
                <div className="text-3xl font-extrabold text-white mb-1">{s.num}</div>
                <div className="text-sm font-bold text-white/90">{s.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Khối nội dung */}
      <section className="py-12 -mt-16 relative z-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Tốc độ số 1",
              desc: "Giao hàng chỉ từ 60 phút trong nội thành.",
              icon: <FaRocket />,
              color: "text-red-500",
            },
            {
              title: "Ưu tiên xử lý",
              desc: "Đơn hàng được gắn nhãn VIP, không chờ ghép chuyến.",
              icon: <FaStar />,
              color: "text-yellow-500",
            },
            {
              title: "Đền bù 100%",
              desc: "Bồi thường ngay lập tức nếu giao trễ cam kết.",
              icon: <FaShieldAlt />,
              color: "text-blue-500",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex items-start gap-4 hover:-translate-y-1 transition-transform"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className={`text-4xl ${item.color} mt-1`}>{item.icon}</div>
              <div>
                <h3 className="text-xl font-extrabold text-[#113e48] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#113e48] mb-4">
            LỰA CHỌN GÓI CƯỚC
          </h2>
          <p className="text-gray-500">
            Linh hoạt theo nhu cầu thời gian và ngân sách của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {servicePackages.map((pkg, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 border 
                ${
                  pkg.recommeded
                    ? "shadow-2xl scale-105 border-red-200 z-10"
                    : "shadow-lg border-gray-100 hover:shadow-xl"
                }`}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              {pkg.recommeded && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  KHUYÊN DÙNG
                </div>
              )}

              <div
                className={`p-6 bg-gradient-to-br ${pkg.color} text-white text-center`}
              >
                <div className="text-4xl mb-4 opacity-90 inline-block">
                  {pkg.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="opacity-90 text-sm h-10">{pkg.desc}</p>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <span className="text-3xl font-extrabold text-[#113e48]">
                    {pkg.price}
                  </span>
                  <span className="text-gray-400 text-sm"> / đơn</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-gray-600"
                    >
                      <FaCheckCircle className="text-green-500 shrink-0" />{" "}
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/customer/create-order"
                  className={`block w-full py-3 rounded-xl font-bold text-center transition-all 
                    ${
                      pkg.recommeded
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30"
                        : "bg-gray-100 text-[#113e48] hover:bg-gray-200"
                    }`}
                >
                  Chọn gói này
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right" className="relative overflow-hidden rounded-3xl shadow-2xl group cursor-pointer">
            <img
              src="/assets/img/services_express1.png"
              alt="Driver"
              className="w-full object-contain bg-white transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-[#113e48]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply z-10"></div>
            <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-20"></div>
          </div>
          <div data-aos="fade-left">
            <span className="text-red-600 font-bold uppercase tracking-wider text-sm">
              Cam kết vàng
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#113e48] mt-2 mb-6">
              "Trễ 1 phút - Đền 100%"
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Chúng tôi hiểu rằng thời gian là tiền bạc. Với dịch vụ Hỏa tốc,
              SpeedyShip áp dụng chính sách đền bù mạnh mẽ nhất thị trường:
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-[#113e48]">
                    Cam kết thời gian thực
                  </h4>
                  <p className="text-sm text-gray-500">
                    Thời gian giao hàng được tính toán chính xác bởi AI dựa trên
                    tình hình giao thông.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-[#113e48]">
                    Bảo hiểm hàng hóa
                  </h4>
                  <p className="text-sm text-gray-500">
                    Miễn phí bảo hiểm cho đơn hàng giá trị dưới 3.000.000đ.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-[#113e48]">
                    Tài xế chuyên nghiệp
                  </h4>
                  <p className="text-sm text-gray-500">
                    Đội ngũ tài xế "Hỏa tốc" được đào tạo riêng, thông thạo
                    đường phố.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Gửi hàng gấp? Có SpeedyShip!
          </h2>
          <p className="text-lg text-red-100 mb-10">
            Đừng để khách hàng phải chờ đợi. Trải nghiệm tốc độ giao hàng vượt
            trội ngay hôm nay.
          </p>
          <Link
            to="/customer/create-order"
            className="inline-block px-10 py-4 bg-white text-red-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Tạo đơn Hỏa tốc ngay
          </Link>
        </div>
      </section>
    </div>
  );
}