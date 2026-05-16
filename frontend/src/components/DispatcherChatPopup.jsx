import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiSupport, HiExternalLink } from "react-icons/hi";
import { MessageCircle } from "lucide-react";
import { socket } from "../lib/socket";
import { useDispatcherChatState, initDispatcherSocket } from "../hooks/useDispatcherChat";

const FLOATING_KEY = "dispatcher_chat_floating_seen";

export default function DispatcherChatPopup() {
  const navigate = useNavigate();
  const { state, clearAlert } = useDispatcherChatState();
  const [showDot, setShowDot] = useState(false);
  const [prevUnread, setPrevUnread] = useState(0);

  // Init singleton socket listener once
  useEffect(() => {
    initDispatcherSocket();
  }, []);

  // Khi có alert mới → hiện nút nổi
  useEffect(() => {
    if (state.unreadCount > 0) {
      setShowDot(true);
    }
  }, [state.unreadCount]);

  // Hide button khi đã seen (sau 3s)
  useEffect(() => {
    const seen = sessionStorage.getItem(FLOATING_KEY);
    if (seen) setShowDot(false);
  }, []);

  const handleOpen = () => {
    // Clear alert
    clearAlert();
    setShowDot(false);
    sessionStorage.setItem(FLOATING_KEY, "1");
    // Navigate to chat tab
    navigate("/dispatcher/chat");
  };

  if (!showDot || state.unreadCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
    >
      {/* Badge chờ */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="bg-white shadow-xl rounded-xl px-3 py-2 border border-gray-100 text-xs text-gray-600 whitespace-nowrap"
        >
          💬 Khách hàng cần hỗ trợ
        </motion.div>
      </AnimatePresence>

      {/* Nút chính */}
      <motion.button
        onClick={handleOpen}
        className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
        title="Mở chat hỗ trợ khách hàng"
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <HiSupport className="text-white w-6 h-6" />
          {state.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {state.unreadCount > 9 ? "9+" : state.unreadCount}
            </span>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}
