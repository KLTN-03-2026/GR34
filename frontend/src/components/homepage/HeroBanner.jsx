import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TrackingMiniPanel from "./TrackingMiniPanel";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faRobot } from "@fortawesome/free-solid-svg-icons";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { useChat } from "../../hooks/useChat.js";

export default function HeroBanner() {
  const navigate = useNavigate();
  const { openAIChat } = useChat();


  const [trackingCode, setTrackingCode] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swiperRef, setSwiperRef] = useState(null);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Chờ xử lý", color: "text-yellow-600 font-semibold" };
      case "assigned":
        return { text: "Đã phân công", color: "text-orange-600 font-semibold" };
      case "picking":
        return { text: "Đang lấy hàng", color: "text-blue-600 font-semibold" };
      case "delivering":
        return { text: "Đang giao hàng", color: "text-blue-600 font-semibold" };
      case "completed":
        return { text: "Hoàn tất", color: "text-green-600 font-semibold" };
      case "canceled":
        return { text: "Đã hủy", color: "text-red-600 font-semibold" };
      default:
        return { text: "Không xác định", color: "text-gray-500 font-medium" };
    }
  };


  useEffect(() => {
    if (swiperRef && swiperRef.autoplay) {
      if (shipment || loading || trackingCode.length > 0) {
        swiperRef.autoplay.stop();
      } else {
        swiperRef.autoplay.start();
      }
    }
  }, [shipment, loading, swiperRef, trackingCode]);

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/shipments/code/${trackingCode.trim()}`
      );
      setShipment(res.data);
    } catch (err) {
      setError("Không tìm thấy đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = () => {
    const role = localStorage.getItem("role");
    if (!role || role !== "customer") return navigate("/login");
    return navigate("/customer/create");
  };

  return (

    <section className="relative h-[750px] md:min-h-[80vh]">
      <Swiper
        centeredSlides
        loop
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        onSwiper={setSwiperRef}
        pagination={{ clickable: true }}
        navigation
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-full"
      >
        {/* Phần giao diện */}
        <SwiperSlide>
          <section className="relative w-full h-full md:aspect-[21/9] bg-black overflow-hidden">
            {/* Hình ảnh minh họa */}
            <img
              src="/assets/banners/banner1.png"
              className="absolute inset-0 w-full h-full object-cover object-center"
              alt="Banner"
            />

            {/* Phần giao diện */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60" />

            {/* Phần giao diện */}

            <div className="absolute top-0 left-0 w-full z-30 flex flex-col items-center pt-24 md:pt-14 px-4 text-center">
              <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-blue-300 font-bold mb-3 drop-shadow-md">
                SpeedyShip Logistics
              </p>

              <h1 className="text-3xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                Giao Nhanh, <span className="text-blue-400">Đúng Hẹn</span>
                <span className="hidden md:inline">,</span>{" "}
                <br className="md:hidden" />
                Trực Tuyến.
              </h1>

              {/* Phần giao diện */}
              <p className="text-gray-100 text-sm md:text-lg max-w-xl mt-3 drop-shadow-md font-medium">
                Tạo đơn trong giây lát — Cập nhật trạng thái từng Km.
              </p>

              {/* Phần giao diện */}
              <div className="flex flex-row gap-4 mt-6">
                <button
                  onClick={handleCreateShipment}
                  className="px-6 py-2.5 rounded-full bg-[#ff5a00] text-white font-bold text-sm uppercase shadow-lg hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faRocket} /> Tạo đơn
                </button>
                <button
                  onClick={openAIChat}
                  className="px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-sm uppercase shadow-lg hover:bg-white hover:text-[#113e48] transition-all flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faRobot} /> Hỏi AI
                </button>
              </div>
            </div>

            {/* Phần giao diện */}

            <div className="absolute bottom-[10%] w-full flex justify-center z-40 px-4">
              {/* Phần giao diện */}
              <div className="w-full max-w-[350px]">
                <TrackingMiniPanel
                  trackingCode={trackingCode}
                  setTrackingCode={setTrackingCode}
                  shipment={shipment}
                  loading={loading}
                  error={error}
                  handleTrack={handleTrack}
                  getStatusDisplay={getStatusDisplay}
                />
              </div>
            </div>
          </section>
        </SwiperSlide>

        {/* Phần giao diện */}
        <SwiperSlide>
          <section className="relative w-full h-full md:aspect-[21/9] bg-black overflow-hidden flex items-center justify-center md:block">
            <img
              src="/assets/banners/banner2.png"
              alt="SpeedyShip quốc tế"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />

            {/* Phần giao diện */}
            <div
              className="
              relative md:absolute md:right-[1%] md:bottom-[50%] md:right-2 md:-translate-y-1/2
              w-[90%] md:w-[420px]
              bg-gradient-to-b from-white/65 via-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              p-6 md:p-8 z-30 space-y-4 md:space-y-6 text-white text-center md:text-left
            "
            >
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                Mua sắm thả ga <br />{" "}
                <span className="text-blue-400">SpeedyShip giao tận nhà</span>
              </h1>
              <p className="text-white font-extrabold text-base md:text-lg leading-relaxed">
                Giao trọn niềm tin — Nhận ngàn uy tín
              </p>
            </div>
          </section>
        </SwiperSlide>

        {/* Phần giao diện */}
        <SwiperSlide>
          <section className="relative w-full h-full md:aspect-[21/9] overflow-hidden flex items-center justify-center md:block">
            <img
              src="/assets/banners/banner3.png"
              className="absolute inset-0 w-full h-full object-cover"
              alt="SpeedyShip Nội Địa"
            />

            <div
              className="
              relative md:absolute md:left-[5%] md:bottom-[10%]
              w-[90%] md:w-[480px]
              rounded-3xl p-6 md:p-8 space-y-4 md:space-y-6 text-white z-30
              bg-gradient-to-b from-white/60 via-white/20 to-white/5 backdrop-blur-2xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              text-center md:text-left
            "
            >
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                Giao Nhanh Từng Chặng <br />
                <span className="text-blue-600 font-extrabold leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                  Theo Dõi Từng Km.
                </span>
              </h2>
              <p className="text-sm md:text-base font-extrabold text-white leading-tight">
                Ship nội thành & liên tỉnh — cập nhật trạng thái từng chặng — hỗ
                trợ 24/7.
              </p>
            </div>
          </section>
        </SwiperSlide>

        {/* Phần giao diện */}
        <SwiperSlide>
          <section className="relative w-full h-full md:aspect-[21/9] overflow-hidden flex items-center justify-center md:block">
            <img
              src="/assets/banners/banner4.png"
              alt="SpeedyShip Nội Tỉnh"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />

            <div
              className="
              relative md:absolute md:top-[18%] md:right-[28%] md:-translate-y-1/2
              w-[90%] md:w-[300px]
              bg-gradient-to-b from-white/65 via-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              p-6 z-30 space-y-2 text-white text-center md:text-left
            "
            >
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                Ship Hàng Thả Ga, Giá Chỉ Từ 15k!
              </h1>
              <p className="text-white text-base md:text-lg font-extrabold leading-tight">
                Giá rẻ bất ngờ — Chốt đơn ngay chờ chi
              </p>
            </div>
          </section>
        </SwiperSlide>

        {/* Phần giao diện */}
        <SwiperSlide>
          <section className="relative w-full h-full md:aspect-[21/9] bg-black overflow-hidden flex items-center justify-center md:block">
            <img
              src="/assets/banners/banner5.png"
              alt="Dịch vụ hoàn cước SpeedyShip"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div
              className="
              relative md:absolute md:right-[1%] md:top-[13%] md:left-[25%] md:-translate-y-1/2
              w-[90%] md:w-[340px]
              bg-gradient-to-b from-white/65 via-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              p-6 z-30 space-y-4 text-white text-center md:text-left
            "
            >
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-blue-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                Gửi Trọn Niềm Tin!
              </h1>
              <p className="text-gray-700 text-base md:text-lg font-extrabold leading-tight">
                Bảo đảm quyền lợi khách hàng.
              </p>
            </div>
          </section>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}