import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faExpand,
  faTimes,
  faPaperPlane,
  faUserTie,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// Bong bóng chat nổi
export default function ChatBubble({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [chatId, setChatId] = useState(null);


  const [showToast, setShowToast] = useState(false);


  const [isMobile, setIsMobile] = useState(false);


  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Xin chào! 👋 Cảm ơn bạn đã liên hệ SpeedyShip. Chúng tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);

  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const messagesEndRef = useRef(null);


  const socketRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, collapsed]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    if (!userId || role !== "customer") {
      alert("⚠ Vui lòng đăng nhập để chat!");
      onClose();
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });
    }

    const socket = socketRef.current;

    const onChatStarted = (id) => {
      setChatId(id);
      setReady(true);
      socket.emit("joinChat", id);

      setMessages((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].content.includes("kết nối")
        ) {
          return prev;
        }
        return [
          ...prev,
          { role: "system", content: "Đã kết nối với nhân viên hỗ trợ." },
        ];
      });
    };

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.content === msg.content &&
            m.role === msg.role &&
            (Math.abs(new Date(m.created_at) - new Date(msg.created_at)) <
              2000 ||
              !m.created_at),
        );
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    const onChatEnded = () => {

      setShowToast(true);

      setReady(false);

      setCollapsed(false);


      setTimeout(() => {
        onClose();
      }, 4000);
    };

    const onConnectError = (err) => {
    };

    socket.on("connect", () => {
      socket.emit("startChat", userId);
    });

    socket.on("chatStarted", onChatStarted);
    socket.on("newMessage", onNewMessage);
    socket.on("chatEnded", onChatEnded);
    socket.on("connect_error", onConnectError);

    if (socket.connected) {
      socket.emit("startChat", userId);
    }

    return () => {
      socket.off("connect");
      socket.off("chatStarted", onChatStarted);
      socket.off("newMessage", onNewMessage);
      socket.off("chatEnded", onChatEnded);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, role, onClose]);


  const sendMessage = () => {
    if (!input.trim()) return;

    const tempMsg = {
      role: "customer",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    if (socketRef.current && chatId) {
      socketRef.current.emit("sendMessage", {
        chatId,
        senderId: userId,
        role: "customer",
        content: input.trim(),
      });
    }
    setInput("");
  };

  const endChat = () => {
    if (socketRef.current && chatId) {
      socketRef.current.emit("endChat", userId);
    }
    onClose();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-200 font-sans z-[9999] relative origin-bottom-right
        ${
          isMobile && !collapsed
            ? "fixed inset-0 w-full h-[100dvh] rounded-none border-0"
            : "w-[90vw] sm:w-[400px] rounded-t-xl"
        }
      `}
      style={{
        height: collapsed ? "auto" : isMobile ? "100dvh" : "600px",
      }}
    >
      {}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-0 right-0 mx-auto w-max z-50 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-full text-xs shadow-lg backdrop-blur-sm"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-400" />
            <span>Cuộc trò chuyện đã kết thúc</span>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <motion.div
        layout="position"
        className={`bg-gradient-to-r from-orange-600 to-blue-500 text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none shrink-0 z-10 ${
          isMobile && !collapsed ? "pt-safe" : ""
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 flex items-center justify-center relative shrink-0">
            <div
              className={`absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 border-2 border-blue-600 rounded-full ${
                ready ? "bg-green-400" : "bg-yellow-400"
              }`}
            ></div>
            <FontAwesomeIcon
              icon={faUserTie}
              className="text-sm md:text-base"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base leading-tight">
              HỖ TRỢ TRỰC TUYẾN
            </h3>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] md:text-[11px] text-blue-100 opacity-90"
                >
                  {ready ? "Đang trực tuyến" : "Đang kết nối..."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-3 text-white/80 shrink-0">
          <FontAwesomeIcon
            icon={collapsed ? faExpand : faMinus}
            className="hover:text-white transition-colors text-sm md:text-base"
            title={collapsed ? "Mở rộng" : "Thu nhỏ"}
          />
          <FontAwesomeIcon
            icon={faTimes}
            onClick={(e) => {
              e.stopPropagation();
              endChat();
            }}
            className="hover:text-red-200 transition-colors text-lg md:text-base ml-1"
            title="Kết thúc chat"
          />
        </div>
      </motion.div>

      {}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="text-center mb-4 md:mb-6">
                <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-semibold">
                  Cuộc trò chuyện được bảo mật
                </p>
              </div>

              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex w-full mb-3 md:mb-4 ${
                      m.role === "customer"
                        ? "justify-end"
                        : m.role === "system"
                          ? "justify-center"
                          : "justify-start"
                    }`}
                  >
                    {m.role !== "customer" && m.role !== "system" && (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-[10px] md:text-xs border border-blue-200">
                        <FontAwesomeIcon icon={faUserTie} />
                      </div>
                    )}

                    {m.role === "system" ? (
                      <div className="max-w-[85%] text-center">
                        <span className="text-[9px] md:text-[10px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block border border-gray-200">
                          {m.content}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`p-2.5 md:p-3 rounded-2xl text-[13px] md:text-sm max-w-[85%] md:max-w-[75%] leading-relaxed shadow-sm ${
                          m.role === "customer"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                        }`}
                      >
                        {m.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-2 md:p-3 bg-white border-t border-gray-100 relative z-20 shrink-0 pb-safe">
              <div
                className={`relative flex items-center bg-gray-100 rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-transparent transition-all duration-300 ${
                  ready
                    ? "focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500"
                    : "opacity-70 cursor-not-allowed"
                }`}
              >
                <input
                  className="flex-1 bg-transparent border-none outline-none text-[13px] md:text-sm text-gray-700 placeholder-gray-400 disabled:cursor-not-allowed w-full"
                  placeholder={ready ? "Nhập tin nhắn..." : "Đang kết nối..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={!ready}
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={!ready || !input.trim()}
                  className={`ml-2 w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${
                    ready && input.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text-[10px] md:text-xs pr-[2px]"
                  />
                </button>
              </div>
              <div className="text-center mt-1.5 md:mt-2">
                <p className="text-[9px] md:text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ready ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                    }`}
                  ></span>
                  {ready ? "Kết nối ổn định" : "Đang kết nối server..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
