import React from "react";
import { FaStar, FaQuoteLeft, FaBoxOpen } from "react-icons/fa";

const testimonialsData = [
  {
    id: 1,
    title: "Dịch vụ chất lượng",
    content:
      "Tôi rất hài lòng với dịch vụ của bạn! Nhân viên hỗ trợ rất nhiệt tình và thân thiện. Họ đã giải đáp mọi thắc mắc của tôi một cách chi tiết và dễ hiểu.",
    name: "Lê Hảo",
    role: "Khách hàng",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    id: 2,
    title: "Chất lượng cao",
    content:
      "Giao hàng siêu nhanh, đúng hẹn. Từ lúc dùng SpeedyShip, tỷ lệ hoàn hàng của shop mình giảm hẳn. Chắc chắn sẽ ủng hộ lâu dài!",
    name: "Nguyễn Sâm",
    role: "Khách hàng",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    id: 3,
    title: "Uy tín tuyệt đối",
    content:
      "Ứng dụng dễ dùng, đặt đơn nhanh chóng. Tài xế lịch sự, gọi điện trước khi giao. Giá cả lại rất hợp lý so với các bên khác.",
    name: "Bạch Ngân",
    role: "Khách hàng",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
];

const RatingStars = ({ rating }) => (
  <div className="flex gap-1 text-yellow-400 mb-3 text-sm">
    {" "}
    {}
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "opacity-100" : "text-gray-300"}
      />
    ))}
  </div>
);

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {}
        <div className="mb-12" data-aos="fade-up">
          {}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4 shadow-sm border border-orange-200">
            <FaBoxOpen /> <span>Phản hồi</span>
          </div>

          {}
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] mb-4 uppercase tracking-tight">
            ĐÁNH GIÁ TỪ KHÁCH HÀNG
          </h2>

          {}
          <p className="text-gray-500 max-w-2xl text-lg">
            Những chia sẻ chân thực từ khách hàng đã sử dụng dịch vụ SpeedyShip
            là minh chứng rõ nhất cho chất lượng và cam kết của chúng tôi.
          </p>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonialsData.map((item, i) => (
            <div
              key={item.id}
              className="bg-gray-50 p-8 rounded-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              {}
              <div className="flex items-start gap-4 mb-4">
                {}
                <FaQuoteLeft className="text-4xl text-gray-200 shrink-0 group-hover:text-orange-200 transition-colors" />

                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <RatingStars rating={item.rating} />
                </div>
              </div>

              {}
              <p className="text-gray-600 text-sm leading-relaxed mb-8 min-h-[80px]">
                "{item.content}"
              </p>

              {}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
