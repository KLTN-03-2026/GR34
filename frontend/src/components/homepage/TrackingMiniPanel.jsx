import React, { useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faComments,
  faCircleNotch,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

export default function TrackingMiniPanel({
  trackingCode,
  setTrackingCode,
  shipment,
  loading,
  error,
  handleTrack,
  getStatusDisplay,
}) {
  const { openSupportChat } = useChat();


  const slogans = [
    "Cập nhật trạng thái Real-time ⚡",
    "An tâm trên mọi nẻo đường 🛣️",
    "Giao nhận siêu tốc, đúng hẹn 🚀",
    "Tra cứu hành trình 24/7 🕒",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3,
      }}
      className="
        w-[360px]
        bg-[#113e48]/90 backdrop-blur-xl
        border border-white/20
        rounded-2xl
        p-6 space-y-4
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        relative overflow-hidden
      "
    >
      {/* Phần giao diện */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-[50px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      {/* Phần giao diện */}
      <div className="relative z-10 text-center space-y-1 mb-2">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="text-orange-500"
          />
          Tra cứu đơn hàng
        </h2>

        {/* Phần giao diện */}
        <div className="h-6 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-medium text-blue-200/80 uppercase tracking-wider"
            >
              {slogans[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <input
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Nhập mã vận đơn (VD: SP123456)..."
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400
                      focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-inner text-sm"
        />

        {/* Nút hành động */}
        <button
          onClick={handleTrack}
          disabled={loading}
          className="
            relative overflow-hidden group 
            w-full py-3 rounded-xl 
            font-bold uppercase tracking-wide text-sm
            bg-orange-500 text-white 
            hover:bg-orange-600 
            transition-all duration-300 
            shadow-lg hover:shadow-orange-500/40
            transform hover:-translate-y-0.5
          "
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} spin /> Đang tìm kiếm...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTruckFast} /> Xem hành trình
              </>
            )}
          </span>
          <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-0"></div>
        </button>
      </div>

      {/* Phần giao diện */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <p className="bg-red-500/20 border border-red-500/30 text-red-100 px-3 py-2 text-xs rounded-lg flex items-center gap-2">
              ⚠️ {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phần giao diện */}
      <AnimatePresence>
        {shipment && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/10 border border-white/20 rounded-xl p-4 text-white text-sm space-y-2 shadow-inner mt-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-300 text-xs">
                Mã đơn:
              </span>
              <span className="font-mono text-orange-400 font-bold bg-black/20 px-2 py-0.5 rounded tracking-wider text-xs">
                {shipment.tracking_code}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-300 text-xs">
                Trạng thái:
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-[4px] text-[10px] uppercase shadow-sm ${
                  getStatusDisplay(shipment.status).color
                }`}
              >
                {getStatusDisplay(shipment.status).text}
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Người nhận:</span>
                <span className="font-medium text-right text-white/90">
                  {shipment.receiver_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SĐT:</span>
                <span className="font-medium text-right text-white/90">
                  {shipment.receiver_phone}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-400 whitespace-nowrap">
                  Địa chỉ:
                </span>
                <span className="font-medium text-right leading-relaxed text-white/80 line-clamp-2">
                  {shipment.delivery_address}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phần giao diện */}
      <div className="flex justify-between items-center border-t border-white/10 pt-4 text-[11px] text-gray-400 relative z-10">
        <span>Gặp khó khăn?</span>
        <button
          onClick={openSupportChat}
          className="relative overflow-hidden group px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 hover:bg-[#0d2e36] hover:border-orange-500/50 text-white transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <FontAwesomeIcon
              icon={faComments}
              className="text-orange-500 text-xs"
            />
            CSKH 24/7
          </span>
          <div className="absolute top-0 -left-[100%] w-full h-full bg-white/10 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
        </button>
      </div>
    </motion.div>
  );
}