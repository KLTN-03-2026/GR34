import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaTruckMoving,
  FaMapMarkedAlt,
  FaBoxOpen,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function RoadFreight() {
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

  const fleetData = [
    {
      name: "Xe Tải Nhẹ (500kg - 1.5 Tấn)",
      desc: "Linh hoạt trong nội thành, phù hợp chuyển nhà, giao hàng TMĐT, hàng tiêu dùng nhỏ lẻ.",
      img: "/assets/img/services_car1.png",
    },
    {
      name: "Xe Tải Trung (2.5 Tấn - 8 Tấn)",
      desc: "Chuyên tuyến liên tỉnh cự ly ngắn và trung bình. Phù hợp nông sản, vật liệu xây dựng.",
      img: "/assets/img/services_car2.png",
    },
    {
      name: "Xe Container / Đầu Kéo",
      desc: "Vận chuyển hàng khối lượng lớn, hàng xuất nhập khẩu, nguyên chuyến Bắc - Nam.",
      img: "/assets/img/services_car3.png",
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-slate-700">
      {/* Khối nội dung */}
      {/* Mini-bar - luôn tồn tại trong DOM, ẩn/hiện qua CSS transform */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#0f2027]/95 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{
          opacity: 0,
          transform: "translateY(-110%)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Tên dịch vụ */}
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            ↑ Vận Chuyển Đường Bộ 24/7 ↑
          </span>
          {/* 4 stat pills */}
          <div className="flex items-center gap-3">
            {[
              { num: "63", label: "Tỉnh thành" },
              { num: "1000+", label: "Đầu xe" },
              { num: "99.8%", label: "Đúng hẹn" },
              { num: "24/7", label: "Hỗ trợ" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-orange-400/20 backdrop-blur-sm border border-orange-200/20 rounded-full px-3 py-1"
              >
                <span className="text-white font-extrabold text-sm leading-none">
                  {s.num}
                </span>
                <span className="text-white/70 text-xs hidden sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh - zoom-out mườ́t khi cuộn */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src="/assets/img/services_roadbanner.png"
          alt="Road Freight"
          className="w-full block object-contain"
          style={{
            transformOrigin: "top center",
            willChange: "transform, opacity",
          }}
        />
      </section>

      {/* Tiêu đề trang - section đẹp bên dưới ảnh */}
      <section
        className="relative overflow-hidden py-16 px-6"
        style={{
          background:
            "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Trái: tiêu đề + nút */}
          <div data-aos="fade-right">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-500/20 border border-orange-400/50 text-orange-300 font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
              <FaTruckMoving className="animate-pulse" /> Dịch vụ chủ lực
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
              Vận Chuyển Đường Bộ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                Toàn Quốc 24/7
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              Mạng lưới phủ sóng 63 tỉnh thành với đội xe hơn 1.000 chiếc. Cam
              kết đúng giờ, an toàn và tối ưu chi phí cho mọi doanh nghiệp.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/customer/create"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Đặt xe ngay <FaArrowRight />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-[#113e48] text-white font-bold rounded-full transition-all flex items-center gap-2"
              >
                Nhận báo giá
              </Link>
            </div>
          </div>

          {/* Phải: stats nổi bật */}
          <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
            {[
              {
                num: "63",
                label: "Tỉnh thành",
                sub: "Phủ khắp cả nước",
                color: "from-orange-400/25 to-orange-600/15",
              },
              {
                num: "1000+",
                label: "Đầu xe",
                sub: "Đa dạng tải trọng",
                color: "from-amber-400/25 to-amber-600/15",
              },
              {
                num: "99.8%",
                label: "Đúng hẹn",
                sub: "Tỷ lệ cam kết",
                color: "from-yellow-400/25 to-orange-500/15",
              },
              {
                num: "24/7",
                label: "Hỗ trợ",
                sub: "Luôn sẵn sàng",
                color: "from-orange-500/25 to-red-500/15",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.color} backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-lg`}
                data-aos="zoom-in"
                data-aos-delay={i * 100}
              >
                <div className="text-3xl font-extrabold text-white mb-1">
                  {s.num}
                </div>
                <div className="text-sm font-bold text-white/90">{s.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div data-aos="fade-right">
            <h3 className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-3">
              Tại sao chọn SpeedyShip?
            </h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#113e48] mb-6">
              Giải pháp vận tải đường bộ linh hoạt nhất Việt Nam
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Chúng tôi hiểu rằng mỗi đơn hàng là một lời hứa. Với hệ thống GPS
              theo dõi thời gian thực và đội ngũ tài xế giàu kinh nghiệm,
              SpeedyShip đảm bảo hàng hóa của bạn luôn đi đúng lộ trình.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                <FaMapMarkedAlt className="text-4xl text-blue-600 mb-3" />
                <h4 className="font-bold text-xl text-[#113e48]">
                  63 Tỉnh thành
                </h4>
                <p className="text-sm text-gray-500">Mạng lưới phủ kín</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                <FaTruckMoving className="text-4xl text-orange-500 mb-3" />
                <h4 className="font-bold text-xl text-[#113e48]">
                  1000+ Đầu xe
                </h4>
                <p className="text-sm text-gray-500">Đa dạng tải trọng</p>
              </div>
            </div>
          </div>

          <div className="relative" data-aos="fade-left">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-transparent rounded-2xl transform translate-x-4 translate-y-4 opacity-10"></div>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl z-10 group cursor-pointer">
              <img
                src="/assets/img/services_road1.png"
                alt="Road Freight"
                className="w-full object-contain bg-white transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#113e48]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply z-10"></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-20"></div>
            </div>
            {/* Phần giao diện */}
            <div className="absolute top-10 right-[-20px] z-30 bg-white p-6 rounded-xl shadow-xl border-l-4 border-orange-500 hidden md:block">
              <p className="font-bold text-[#113e48] text-lg">
                Tỷ lệ giao đúng hẹn
              </p>
              <p className="text-4xl font-extrabold text-orange-500 mt-1">
                99.8%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] mb-4">
              ĐỘI XE HÙNG HẬU
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đáp ứng mọi nhu cầu từ hàng lẻ đến nguyên chuyến, từ nội thành đến
              liên tỉnh.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fleetData.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#113e48]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white font-bold flex items-center gap-2">
                      <FaCheckCircle className="text-orange-500" /> Sẵn sàng
                      phục vụ
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#113e48] mb-3">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{item.desc}</p>
                  <Link
                    to="/contact"
                    className="text-orange-600 font-bold hover:gap-2 transition-all flex items-center gap-1"
                  >
                    Liên hệ thuê xe <FaArrowRight className="text-sm" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#113e48]">
            BẢNG GIÁ THAM KHẢO
          </h2>
          <p className="text-gray-500 mt-2">
            Áp dụng cho dịch vụ vận chuyển đường bộ liên tỉnh (VNĐ)
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#113e48] text-white">
              <tr>
                <th className="p-4 font-bold">Khối lượng</th>
                <th className="p-4 font-bold">Nội tỉnh (&lt; 50km)</th>
                <th className="p-4 font-bold">Liên tỉnh (&lt; 300km)</th>
                <th className="p-4 font-bold">Bắc - Nam</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm md:text-base">
              <tr className="hover:bg-blue-50">
                <td className="p-4 font-bold text-slate-700">Dưới 100kg</td>
                <td className="p-4">150.000đ</td>
                <td className="p-4">350.000đ</td>
                <td className="p-4">900.000đ</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-4 font-bold text-slate-700">100kg - 500kg</td>
                <td className="p-4">400.000đ</td>
                <td className="p-4">850.000đ</td>
                <td className="p-4">1.500.000đ</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-4 font-bold text-slate-700">500kg - 1 Tấn</td>
                <td className="p-4">700.000đ</td>
                <td className="p-4">1.500.000đ</td>
                <td className="p-4">2.800.000đ</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-4 font-bold text-slate-700">Trên 1 Tấn</td>
                <td className="p-4 text-orange-600 font-bold" colSpan={3}>
                  Liên hệ báo giá chi tiết
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic text-center">
          * Giá trên chưa bao gồm VAT và các phụ phí bốc xếp. Vui lòng liên hệ
          để có giá chính xác nhất tại thời điểm gửi hàng.
        </p>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-orange-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <FaBoxOpen className="text-6xl mx-auto mb-6 opacity-90 animate-bounce" />
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Bạn đã sẵn sàng vận chuyển?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Tạo đơn ngay trên hệ thống hoặc liên hệ với chúng tôi để được tư vấn
            giải pháp tối ưu nhất.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/customer/create-order"
              className="px-10 py-4 bg-white text-orange-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all"
            >
              Tạo đơn hàng ngay
            </Link>
            <Link
              to="/contact"
              className="px-10 py-4 bg-orange-600 border border-orange-400 text-white font-bold rounded-full hover:bg-orange-700 transition-all"
            >
              Gọi tư vấn miễn phí
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
