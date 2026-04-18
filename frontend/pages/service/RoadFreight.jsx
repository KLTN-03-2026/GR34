import React, { useEffect } from "react";
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
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  // Dữ liệu các loại xe
  const fleetData = [
    {
      name: "Xe Tải Nhẹ (500kg - 1.5 Tấn)",
      desc: "Linh hoạt trong nội thành, phù hợp chuyển nhà, giao hàng TMĐT, hàng tiêu dùng nhỏ lẻ.",
      img: "https://images.unsplash.com/photo-1605218427368-35b0d00a88df?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Xe Tải Trung (2.5 Tấn - 8 Tấn)",
      desc: "Chuyên tuyến liên tỉnh cự ly ngắn và trung bình. Phù hợp nông sản, vật liệu xây dựng.",
      img: "https://images.unsplash.com/photo-1586191582119-2925c6ec6b79?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Xe Container / Đầu Kéo",
      desc: "Vận chuyển hàng khối lượng lớn, hàng xuất nhập khẩu, nguyên chuyến Bắc - Nam.",
      img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-slate-700">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1920&q=80"
            alt="Road Freight"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#113e48]/80 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <div className="max-w-3xl" data-aos="fade-up">
            <span className="inline-block py-1.5 px-4 rounded-full bg-orange-500/20 border border-orange-500 text-orange-400 font-bold mb-6 uppercase tracking-wider backdrop-blur-sm">
              <FaTruckMoving className="inline mr-2" /> Dịch vụ chủ lực
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Vận Chuyển Đường Bộ <br />
              <span className="text-orange-500">Toàn Quốc 24/7</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Mạng lưới phủ sóng 63 tỉnh thành với đội xe hơn 1.000 chiếc. Cam
              kết đúng giờ, an toàn và tối ưu chi phí cho mọi doanh nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/customer/create"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
              >
                Đặt xe ngay <FaArrowRight />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-[#113e48] text-white font-bold rounded-full transition-all flex items-center justify-center"
              >
                Nhận báo giá
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & INTRO */}
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
            <img
              src="https://images.unsplash.com/photo-1595152452543-e5cca283f58c?auto=format&fit=crop&w=800&q=80"
              alt="Warehouse"
              className="rounded-2xl shadow-2xl relative z-10 w-full object-cover h-[500px]"
            />
            {/* Float Card */}
            <div className="absolute bottom-10 left-[-20px] z-20 bg-white p-6 rounded-xl shadow-xl border-l-4 border-orange-500 hidden md:block">
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

      {/* 3. ĐỘI XE (FLEET) */}
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

      {/* 4. BẢNG GIÁ THAM KHẢO */}
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

      {/* 5. CTA FOOTER */}
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
              to="/customer/create"
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
