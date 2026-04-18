import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faHeadset,
  faXmark,
  faCommentDots,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

export default function FloatingActions({ onOpenChatBubble, onOpenChatTop }) {
  const [open, setOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  // Ẩn bubble sau 5 giây
  useEffect(() => {
    if (!showNotice) return;
    const t = setTimeout(() => setShowNotice(false), 5000);
    return () => clearTimeout(t);
  }, [showNotice]);

  // Khi đóng menu → bubble hiện lại
  useEffect(() => {
    if (!open) {
      setTimeout(() => setShowNotice(true), 500);
    } else {
      setShowNotice(false);
    }
  }, [open]);

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.5 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: custom * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: { opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } },
  };

  return (
    //  UPDATE: Đẩy vị trí ra xa góc hơn (bottom-10 right-10) để hợp với nút to
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-5">
      {/* 🔔 Bubble thông báo (Tooltip) - UPDATE: To hơn */}
      <AnimatePresence>
        {!open && showNotice && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="
              mr-2 mb-2 cursor-pointer
              bg-white text-[#113e48] 
              px-6 py-4 rounded-2xl rounded-br-none
              shadow-[0_15px_40px_rgba(0,0,0,0.2)] 
              border border-gray-100
              flex items-center gap-4
              max-w-[320px]
            "
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 animate-bounce text-lg">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div className="text-base leading-snug">
              <span className="font-bold block text-orange-600 text-lg">
                Cần hỗ trợ?
              </span>
              <span className="text-gray-500">Chúng tôi ở đây giúp bạn!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CÁC NÚT CON --- */}
      <AnimatePresence>
        {open && (
          <>
            {/* Nút Chat AI - UPDATE: To hơn (w-16 h-16) */}
            <motion.div
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-4 mr-2"
            >
              <span className="bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md">
                Trợ lý AI
              </span>
              <button
                onClick={() => {
                  onOpenChatTop();
                  setOpen(false);
                }}
                className="
                  w-16 h-16 rounded-full 
                  bg-orange-500 text-white 
                  shadow-xl shadow-orange-500/40
                  hover:bg-orange-600 hover:scale-110
                  flex items-center justify-center
                  transition-all duration-300
                  border-[3px] border-white
                "
              >
                <FontAwesomeIcon icon={faRobot} className="text-2xl" />
              </button>
            </motion.div>

            {/* Nút Chat Realtime - UPDATE: To hơn (w-16 h-16) */}
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-4 mr-2"
            >
              <span className="bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-md">
                Tư vấn viên
              </span>
              <button
                onClick={() => {
                  onOpenChatBubble();
                  setOpen(false);
                }}
                className="
                  w-16 h-16 rounded-full 
                  bg-blue-600 text-white 
                  shadow-xl shadow-blue-600/40
                  hover:bg-blue-700 hover:scale-110
                  flex items-center justify-center
                  transition-all duration-300
                  border-[3px] border-white
                "
              >
                <FontAwesomeIcon icon={faHeadset} className="text-2xl" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- NÚT MENU CHÍNH - UPDATE: To nhất (w-20 h-20) --- */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative overflow-hidden group
          w-20 h-20 rounded-full 
          shadow-[0_20px_50px_rgba(17,62,72,0.5)]
          flex items-center justify-center
          transition-colors duration-300
          border-[4px] border-white
          ${
            open
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#113e48] hover:bg-[#0d2e36]"
          }
        `}
      >
        {/* Icon xoay - UPDATE: Text to hơn (text-3xl) */}
        <motion.div
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl text-white"
        >
          <FontAwesomeIcon icon={open ? faXmark : faCommentDots} />
        </motion.div>

        {/* Vòng Pulse */}
        {!open && (
          <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-[ping_2s_infinite] opacity-50 pointer-events-none"></span>
        )}

        {/* Hiệu ứng Shine */}
        {!open && (
          <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
        )}
      </motion.button>
    </div>
  );
}
