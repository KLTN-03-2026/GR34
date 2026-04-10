import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCube,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

// --- 1. KHAI BÁO BỘ ICON SVG ---
const ServiceIcons = {
  Transport: () => (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M56 40H8C6.9 40 6 39.1 6 38V14C6 12.9 6.9 12 8 12H44V36H56V40Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 12L58 26V40H44V12Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="46" r="6" stroke="#f97316" strokeWidth="2.5" />
      <circle cx="48" cy="46" r="6" stroke="#f97316" strokeWidth="2.5" />
      <path
        d="M20 24H36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 30H32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Warehouse: () => (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 56H60"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8 56V24L32 8L56 24V56"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="20"
        y="32"
        width="24"
        height="24"
        stroke="#f97316"
        strokeWidth="2.5"
      />
      <path
        d="M20 32L32 40L44 32"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M32 56V40" stroke="#f97316" strokeWidth="2" />
    </svg>
  ),
  SupplyChain: () => (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.3"
      />
      <path
        d="M32 8V56"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      <path
        d="M8 32H56"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      <circle cx="32" cy="16" r="5" fill="#f97316" />
      <circle cx="16" cy="40" r="5" fill="currentColor" />
      <circle cx="48" cy="40" r="5" fill="currentColor" />
      <path
        d="M32 16L16 40H48L32 16Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Insurance: () => (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 4L10 14V30C10 44.5 32 58 32 58C32 58 54 44.5 54 30V14L32 4Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 32L30 38L40 26"
        stroke="#f97316"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Customs: () => (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8H40L54 22V56H14V8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 8V22H54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 24H36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 34H44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="38" cy="46" r="9" stroke="#f97316" strokeWidth="2.5" />
      <path d="M35 48L42 42" stroke="#f97316" strokeWidth="2" />
    </svg>
  ),
};

// --- 2. HỌA TIẾT TRANG TRÍ ---
const PlusPatternSVG = ({ className }) => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 400 400"
    className={className}
  >
    <defs>
      <pattern
        id="plus-pattern"
        x="0"
        y="0"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <rect x="11" y="8" width="2" height="8" fill="currentColor" />
        <rect x="8" y="11" width="8" height="2" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#plus-pattern)" />
  </svg>
);

const RadarPatternSVG = ({ className }) => (
  <svg
    viewBox="0 0 558 558"
    width="558"
    height="558"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="279"
      cy="279"
      r="278"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="8 8"
    />
    <circle
      cx="279"
      cy="279"
      r="213.659"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="8 8"
    />
    <circle
      cx="279"
      cy="279"
      r="148.317"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="8 8"
    />
    <circle
      cx="279"
      cy="279"
      r="82.9756"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);

// --- 3. DỮ LIỆU DATA ---
const servicesData = [
  {
    id: "01",
    title: "Vận chuyển hàng hóa",
    desc: "Cam kết đúng giờ, an toàn và tối ưu chi phí cho mọi doanh nghiệp",
    icon: <ServiceIcons.Transport />,
  },
  {
    id: "02",
    title: "Lưu trữ kho bãi",
    desc: "Hệ thống kho bãi rộng rãi, lưu trữ hàng hóa thông minh và cẩn trọng.",
    icon: <ServiceIcons.Warehouse />,
  },
  {
    id: "03",
    title: "Giao hàng hỏa tốc - Nhanh như chớp",
    desc: "Giải pháp vận chuyển nội thành siêu tốc độ. Cam kết giao nhận đúng hẹn từng phút.",
    icon: <ServiceIcons.SupplyChain />,
  },
  {
    id: "04",
    title: "Bảo hiểm hàng hóa",
    desc: "Bảo vệ 100% giá trị hàng hóa trước mọi rủi ro trong quá trình vận chuyển.",
    icon: <ServiceIcons.Insurance />,
  },
  {
    id: "05",
    title: "Chính sách bảo mật",
    desc: "Cam kết của SpeedyShip về việc bảo vệ dữ liệu và quyền riêng tư của khách hàng.",
    icon: <ServiceIcons.Customs />,
  },
];

// --- 4. COMPONENT CHÍNH ---
export default function ServicesCarouselSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* SVG TRANG TRÍ NỀN */}
      <div className="hidden lg:block absolute top-0 left-0 w-64 h-96 -translate-x-16 -translate-y-16 opacity-[0.04] text-[#113e48] z-0 pointer-events-none">
        <PlusPatternSVG />
      </div>
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-[0.05] text-orange-500 z-0 pointer-events-none">
        <RadarPatternSVG className="w-[300px] h-[300px] md:w-[500px] md:h-[500px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 mb-4 border border-orange-200">
            <FontAwesomeIcon icon={faCube} className="text-xl" />
            <span className="font-bold text-[20px] uppercase tracking-wider">
              Dịch Vụ Chất Lượng
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 uppercase leading-tight">
            <span className="text-[#113e48]">Các Dịch Vụ Chính </span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative px-4 md:px-10">
          <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 text-[#113e48] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-md flex items-center justify-center -ml-2 md:-ml-12"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>

          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 text-[#113e48] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-md flex items-center justify-center -mr-2 md:-mr-12"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            className="!py-6 !px-2"
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          >
            {servicesData.map((s) => (
              <SwiperSlide key={s.id} className="h-auto">
                <div className="group h-full min-h-[340px] flex flex-col p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:border-[#113e48] relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  {/* Background Slide Effect (Nền xanh trượt lên) */}
                  <div className="absolute inset-0 bg-[#113e48] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></div>

                  {/* === HIỆU ỨNG LƯỚT SÁNG (SHINE EFFECT) ĐÃ CẬP NHẬT THEO NÚT BẤM === */}
                  {/* Thay đổi: skew-x-[45deg], bg-white/20, duration-700 */}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-1"></div>

                  {/* Nội dung Card */}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-white/10 flex items-center justify-center transition-colors duration-300 border border-gray-50 group-hover:border-transparent">
                        <div className="w-8 h-8 text-[#113e48] group-hover:text-white transition-colors duration-300">
                          {s.icon}
                        </div>
                      </div>
                      <span className="text-4xl font-black text-slate-100 group-hover:text-white/10 transition-colors">
                        {s.id}
                      </span>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-[#113e48] group-hover:text-white mb-2 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {s.title}
                      </h3>
                      <p className="text-slate-600 group-hover:text-gray-300 text-base leading-relaxed transition-colors line-clamp-3">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-white/20">
                      <a
                        href="/services"
                        className="inline-flex items-center text-[#113e48] group-hover:text-orange-500 font-bold text-xs uppercase tracking-wide transition-colors"
                      >
                        Xem chi tiết
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="ml-2 transform group-hover:translate-x-1 transition-transform"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
