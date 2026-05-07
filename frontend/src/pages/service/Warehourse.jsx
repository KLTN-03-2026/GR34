import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaNetworkWired,
  FaRobot,
  FaSatelliteDish,
  FaShieldAlt,
  FaArrowRight,
  FaWarehouse,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaBoxes,
  FaBarcode,
  FaLayerGroup,
  FaSortAmountDown,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Warehouse() {
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

  return (
    <div className="font-sans bg-slate-50 text-slate-700">
      {/* Khối nội dung */}
      {/* Mini-bar - luôn tồn tại trong DOM, ẩn/hiện qua CSS transform */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#0f3460]/95 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{
          opacity: 0,
          transform: "translateY(-110%)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Tên dịch vụ */}
          <span className="text-cyan-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            ↑ Kho Vận Thông Minh ↑
          </span>
          {/* 4 stat pills */}
          <div className="flex items-center gap-3">
            {[
              { num: "36+", label: "Hub" },
              { num: "2M+", label: "Đơn/Ngày" },
              { num: "100%", label: "Tự Động" },
              { num: "24/7", label: "Vận Hành" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-cyan-400/20 backdrop-blur-sm border border-cyan-200/20 rounded-full px-3 py-1"
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
          src="/assets/img/services_warehousebanner.png"
          alt="Warehouse Operation"
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
            "linear-gradient(135deg, #0f3460 0%, #16213e 40%, #0d1b2a 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Trái: tiêu đề + nút */}
          <div data-aos="fade-right">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs uppercase tracking-widest mb-6">
              <FaNetworkWired
                className="animate-spin"
                style={{ animationDuration: "4s" }}
              />{" "}
              Hệ thống Mega Hubs
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
              Trung Tâm Khai Thác & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                Lưu Trữ Thông Minh
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">
              Hạ tầng kho vận 50.000m² được quy hoạch khoa học, đảm bảo hàng hóa
              được sắp xếp ngăn nắp, an toàn và dễ dàng truy xuất.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:-translate-y-1 transition-all"
            >
              Liên hệ hợp tác <FaArrowRight />
            </Link>
          </div>

          {/* Phải: stats cards */}
          <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
            {[
              {
                num: "36+",
                label: "Hub Khai Thác",
                sub: "Toàn quốc",
                color: "from-cyan-400/25 to-cyan-600/15",
              },
              {
                num: "2M+",
                label: "Đơn/Ngày",
                sub: "Năng lực xử lý",
                color: "from-teal-400/25 to-teal-600/15",
              },
              {
                num: "100%",
                label: "Tự Động Hóa",
                sub: "Công nghệ hiện đại",
                color: "from-sky-400/25 to-sky-600/15",
              },
              {
                num: "24/7",
                label: "Vận Hành",
                sub: "Không ngừng nghỉ",
                color: "from-cyan-500/25 to-teal-700/15",
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
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { num: "36+", label: "Hub Khai Thác" },
              { num: "2M+", label: "Đơn/Ngày" },
              { num: "100%", label: "Tự Động Hóa" },
              { num: "24/7", label: "Vận Hành" },
            ].map((stat, i) => (
              <div key={i} className="py-8 text-center group">
                <div className="text-3xl font-extrabold text-[#113e48] group-hover:text-orange-600 transition-colors">
                  {stat.num}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#113e48] mb-3">
            CÔNG NGHỆ VẬN HÀNH
          </h2>
          <p className="text-gray-500">
            Sự kết hợp hoàn hảo giữa con người và máy móc
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FaRobot />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              Matrix Sorting
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Hệ thống băng chuyền ma trận tự động phân loại hàng hóa theo mã
              bưu chính, loại bỏ 99% sai sót thủ công.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 text-xl mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FaSatelliteDish />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              Real-time Tracking
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mỗi kiện hàng được gắn "Digital ID", cho phép định vị chính xác vị
              trí trong kho theo thời gian thực (Real-time).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 text-xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FaShieldAlt />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              AI Security
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Camera AI giám sát quy trình xử lý hàng, tự động phát hiện và cảnh
              báo các hành vi quăng quật hàng hóa.
            </p>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-10 px-6 max-w-7xl mx-auto space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative" data-aos="fade-right">
            <div className="relative overflow-hidden rounded-2xl shadow-xl group cursor-pointer">
              <img
                src="/assets/img/services_warehouse1.png"
                alt="Mega Hub"
                className="w-full object-contain bg-white transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#113e48]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply z-10"></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-20"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 hidden md:block z-30">
              <div className="text-sm font-bold text-gray-500">
                Tốc độ xử lý
              </div>
              <div className="text-2xl font-extrabold text-[#113e48]">
                25.000 kiện/giờ
              </div>
            </div>
          </div>

          <div data-aos="fade-left">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">
              Quy mô hạ tầng
            </span>
            <h2 className="text-3xl font-extrabold text-[#113e48] mt-2 mb-4">
              Hệ thống Mega Hubs <br /> Chuẩn Quốc Tế
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Không chỉ là nhà kho, đây là những trung tâm điều phối thông minh.
              Được đặt tại các cửa ngõ giao thương huyết mạch, giúp luân chuyển
              hàng hóa liên tục.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Tổng diện tích khai thác: <strong>50.000m²</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Kết nối trực tiếp <strong>63/63 tỉnh thành</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Vận hành liên tục <strong>24/7/365</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-white mt-20 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#113e48] mb-4 uppercase tracking-wider">
              QUY CHUẨN LƯU TRỮ & SẮP XẾP
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Hàng hóa không bao giờ bị "để lung tung". Mọi kiện hàng đều có
              "địa chỉ" riêng và được sắp xếp theo quy tắc khoa học để tối ưu
              thời gian lấy hàng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="0"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaLayerGroup />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Phân khu chuyên biệt
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kho được chia thành các khu vực riêng: Hàng cồng kềnh, hàng dễ
                vỡ, hàng giá trị cao và hàng tiêu chuẩn. Giúp bảo vệ an toàn tối
                đa cho từng loại hàng.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaMapMarkedAlt />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Định vị Bin Location
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Mỗi ô kệ đều có mã địa chỉ (Ví dụ: A-01-05). Hệ thống sẽ chỉ
                định chính xác vị trí đặt hàng ngay khi hàng vừa nhập kho.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaBarcode />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Quản lý mã vạch
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                100% kiện hàng được dán mã vận đơn. Nhân viên sử dụng máy quét
                PDA để kiểm soát hàng vào/ra, loại bỏ hoàn toàn việc ghi chép
                thủ công.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaSortAmountDown />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Quy tắc FIFO
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Áp dụng quy tắc "First In - First Out" (Nhập trước xuất trước)
                để đảm bảo hàng hóa không bị lưu kho quá lâu, đặc biệt là hàng
                thực phẩm/mỹ phẩm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-[#113e48] text-center mt-20">
        <div className="max-w-3xl mx-auto px-6 text-white">
          <FaWarehouse className="text-5xl mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-extrabold mb-4">
            An tâm gửi trọn niềm tin
          </h2>
          <p className="text-blue-100 mb-8">
            Hàng hóa của bạn được chăm sóc bởi quy trình chuyên nghiệp nhất.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/customer/create-order"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              Tạo đơn hàng ngay <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
