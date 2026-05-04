import { Link } from "react-router-dom";
import ChatBubble from "../ChatBubble.jsx";
import { useState } from "react";
import { FaRocket, FaComments, FaArrowRight } from "react-icons/fa";

export default function FinalCTA({ onChat }) {
  const [showChatSupport, setShowChatSupport] = useState(false);


  const handleChatClick = () => {
    if (onChat) {

      onChat();
    } else {

      setShowChatSupport(true);
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-[#113e48]">
      {}
      {}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        {}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="grid-cta"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 40L40 0H20L0 20M40 40V20L20 40"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-white"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-cta)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
          {}
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sẵn sàng bứt phá doanh thu <br />
              <span className="text-orange-400">cùng SpeedyShip?</span>
            </h3>
            <p className="text-lg text-blue-100/90 font-medium leading-relaxed">
              Tạo đơn hàng loạt chỉ trong 30 giây. Hệ thống quản lý thông minh,
              giao hàng siêu tốc và đối soát COD minh bạch mỗi ngày.
            </p>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            {}
            <Link
              to="/customer/create-order"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all transform hover:-translate-y-1"
            >
              <FaRocket className="group-hover:animate-pulse" />
              <span>Tạo đơn ngay</span>
              <FaArrowRight className="text-sm opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>

            {}
            <button
              type="button"
              onClick={handleChatClick}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full border-2 border-white/20 hover:border-white hover:bg-white hover:text-[#113e48] text-white font-bold text-lg transition-all backdrop-blur-sm"
            >
              <FaComments />
              <span>Chat tư vấn</span>
            </button>
          </div>
        </div>
      </div>

      {}
      {showChatSupport && !onChat && (
        <ChatBubble onClose={() => setShowChatSupport(false)} />
      )}
    </section>
  );
}
