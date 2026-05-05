import React, { useEffect } from "react";
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
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
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
      <section className="relative h-[500px] flex items-center overflow-hidden">
        {/* Phần giao diện */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1557166983-5939644443a0?auto=format&fit=crop&w=1920&q=80"
            alt="Fast Delivery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#113e48] via-[#113e48]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white w-full">
          <div className="max-w-2xl" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider mb-6 animate-pulse">
              <FaBolt /> Dịch vụ Premium
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Giao Hàng Hỏa Tốc <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
                Nhanh Như Chớp
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Giải pháp vận chuyển nội thành siêu tốc độ. Cam kết giao nhận đúng
              hẹn từng phút, "cứu nguy" cho các đơn hàng gấp của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/customer/create-order"
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2"
              >
                Đặt xe Hỏa Tốc <FaArrowRight />
              </Link>
            </div>
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
          <div data-aos="fade-right">
            <img
              src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=800&q=80"
              alt="Driver"
              className="rounded-3xl shadow-2xl w-full object-cover h-[500px]"
            />
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