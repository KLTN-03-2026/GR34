import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShippingFast,
  FaShieldAlt,
  FaHandshake,
  FaGlobeAsia,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";

import AOS from "aos";
import "aos/dist/aos.css";

export default function About() {
  // useEffect(() => { AOS.init({ duration: 1000 }); }, []);

  return (
    <div className="bg-white font-sans overflow-hidden">
      {/* 1. HERO SECTION: Nền xanh đậm + Ảnh mờ */}
      <section className="relative py-32 bg-[#113e48] text-white overflow-hidden">
        {/* Họa tiết trang trí nền */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 40L40 0H20L0 20M40 40V20L20 40"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Nội dung chính */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span
            className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 tracking-widest uppercase backdrop-blur-sm"
            data-aos="fade-down"
          >
            Hành trình của SpeedyShip
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            data-aos="fade-up"
          >
            Kiến tạo tương lai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Logistics Việt Nam
            </span>
          </h1>
          <p
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            SpeedyShip không chỉ là giao hàng. Chúng tôi kết nối cơ hội, rút
            ngắn khoảng cách và mang lại sự thịnh vượng cho doanh nghiệp Việt
            bằng công nghệ vận chuyển tiên tiến.
          </p>
        </div>
      </section>

      {/* 2. STATS SECTION: Box nổi đè lên Hero */}
      <section className="py-12 -mt-20 relative z-20 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl shadow-[#113e48]/15 border border-gray-100 p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              {
                num: "5M+",
                label: "Đơn hàng hoàn tất",
                icon: <FaShippingFast />,
              },
              {
                num: "63",
                label: "Tỉnh thành phủ sóng",
                icon: <FaGlobeAsia />,
              },
              { num: "10k+", label: "Đối tác tin cậy", icon: <FaHandshake /> },
              { num: "99.9%", label: "Tỷ lệ đúng hẹn", icon: <FaChartLine /> },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center group pl-4"
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
              >
                <div className="text-4xl text-gray-200 mb-3 group-hover:text-orange-500 transition-all duration-300 group-hover:scale-110">
                  {stat.icon}
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#113e48] mb-1">
                  {stat.num}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION: Layout Zig-Zag hiện đại */}
      <section className="py-24 max-w-7xl mx-auto px-6 space-y-32">
        {/* Block 1: Sứ mệnh */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative" data-aos="fade-right">
            {/* Hình ảnh trang trí */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-100 rounded-full z-0 mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full z-0 mix-blend-multiply filter blur-xl opacity-70"></div>

            <img
              src="/assets/img/about1.png"
              alt="Mission"
              className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[450px]"
            />
            {/* Quote Box nhỏ */}
            {/* <div className="absolute bottom-8 -right-8 bg-white p-6 rounded-xl shadow-2xl z-20 max-w-xs hidden md:block border border-gray-50">
              <p className="text-sm font-bold text-[#113e48] italic">
                "Khách hàng là trọng tâm của mọi chuyến đi."
              </p>
              <div className="flex gap-1 text-orange-400 mt-3 text-xs">
                ⭐⭐⭐⭐⭐
              </div>
            </div> */}
          </div>

          <div data-aos="fade-left">
            <h3 className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-3">
              Sứ mệnh cốt lõi
            </h3>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] mb-6 leading-tight">
              Đơn giản hóa vận chuyển <br /> cho mọi người
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Sứ mệnh của SpeedyShip là xóa bỏ rào cản logistics cho các doanh
              nghiệp vừa và nhỏ (SMEs). Chúng tôi cung cấp giải pháp công nghệ
              giúp bạn quản lý đơn hàng dễ dàng, chi phí minh bạch và tối ưu lợi
              nhuận.
            </p>
            <ul className="space-y-4">
              {[
                "Hệ thống theo dõi Real-time 24/7",
                "Đội ngũ tài xế chuyên nghiệp, tận tâm",
                "Bảo hiểm hàng hóa 100% giá trị",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[#113e48] font-medium"
                >
                  <FaCheckCircle className="text-green-500 text-xl shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Block 2: Tầm nhìn */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1" data-aos="fade-right">
            <h3 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">
              Tầm nhìn 2030
            </h3>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] mb-6 leading-tight">
              Số hóa nền logistics <br /> Việt Nam
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Chúng tôi khao khát trở thành "Kỳ lân" công nghệ logistics, áp
              dụng AI và Big Data để giải quyết bài toán giao vận tại các đô thị
              lớn và vùng sâu vùng xa, đưa hàng hóa Việt Nam vươn tầm thế giới.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-[#113e48] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 group"
            >
              Khám phá dịch vụ{" "}
              <FaChartLine className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="order-1 md:order-2 relative" data-aos="fade-left">
            <div className="absolute inset-0 bg-[#113e48] rounded-2xl transform rotate-3 scale-[0.98] opacity-10 z-0"></div>
            <img
              src="/assets/img/about2.png"
              alt="Vision"
              className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES: Thẻ Card Style Mới */}
      <section className="bg-slate-50 py-24 relative overflow-hidden">
        {/* Background Pattern mờ */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-50 to-transparent opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h3 className="text-orange-600 font-bold uppercase mb-3 tracking-wider">
              Giá trị cốt lõi
            </h3>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48]">
              Điều gì làm nên SpeedyShip?
            </h2>
            <p className="text-gray-500 mt-6 text-lg">
              Văn hóa doanh nghiệp là kim chỉ nam cho mọi hành động, giúp chúng
              tôi phục vụ khách hàng tốt hơn mỗi ngày.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: "Tốc độ (Speed)",
                d: "Thời gian là vàng. Chúng tôi tối ưu từng giây trong quy trình vận hành để hàng hóa đến tay khách sớm nhất.",
                icon: <FaShippingFast />,
                theme: "blue", // Xanh dương
              },
              {
                t: "Minh bạch (Transparency)",
                d: "Không phí ẩn, không mập mờ. Mọi hành trình đơn hàng đều được cập nhật công khai trên hệ thống.",
                icon: <FaShieldAlt />,
                theme: "green", // Xanh lá
              },
              {
                t: "Con người (People)",
                d: "Tài xế và nhân viên là tài sản quý giá nhất. Chúng tôi xây dựng môi trường làm việc hạnh phúc để phục vụ tận tâm.",
                icon: <FaUsers />,
                theme: "orange", // Cam
              },
            ].map((v, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                {/* Icon Box */}
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 transition-all duration-300 
                  ${
                    v.theme === "blue"
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    v.theme === "green"
                      ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                      : ""
                  }
                  ${
                    v.theme === "orange"
                      ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                      : ""
                  }
                  `}
                >
                  {v.icon}
                </div>

                <h4 className="font-bold text-[#113e48] text-xl mb-3">{v.t}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA BOTTOM: Đã bỏ phần Team */}
      <section className="py-24 bg-[#113e48] text-white text-center px-6 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="pattern-cta"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="currentColor" />
            </pattern>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-cta)"
            />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10" data-aos="zoom-in">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
            Sẵn sàng vận chuyển <br /> cùng SpeedyShip?
          </h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Đăng ký ngay hôm nay để trải nghiệm dịch vụ giao hàng siêu tốc và
            nhận ưu đãi dành cho khách hàng mới.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1"
            >
              Đăng ký miễn phí
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white/20 hover:bg-white hover:text-[#113e48] text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
