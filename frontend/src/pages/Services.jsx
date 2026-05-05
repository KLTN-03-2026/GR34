import React, { useEffect } from "react";
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
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
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
      {/* Khối nội dung */}
      <section className="relative py-24 bg-[#113e48] text-white overflow-hidden">
        {/* Phần giao diện */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span
            className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 uppercase tracking-wider backdrop-blur-md"
            data-aos="fade-down"
          >
            Hệ sinh thái Logistics
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            data-aos="fade-up"
          >
            Giải Pháp Vận Chuyển <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Toàn Diện & Hiệu Quả
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            SpeedyShip cung cấp đa dạng các dịch vụ từ vận chuyển, kho bãi đến
            bảo hiểm hàng hóa, giúp doanh nghiệp tối ưu hóa chuỗi cung ứng.
          </p>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
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