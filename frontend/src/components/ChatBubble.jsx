import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPaperAirplane,
  HiChevronDown,
  HiChevronUp,
  HiX,
  HiSupport,
  HiPhone,
  HiLightBulb,
} from "react-icons/hi";
import {
  Bot,
  User,
  CircleCheck,
  CircleX,
  Shield,
  MessageCircle,
} from "lucide-react";

const SPEEDY_INFO = {
  hotline: "1900 888 999",
  workingHours: "7:00 - 22:00",
};

export default function ChatBubble({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Xin chào! Cảm ơn bạn đã liên hệ SpeedyShip. Bạn đang kết nối với bộ phận hỗ trợ khách hàng.",
      time: new Date(),
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
      alert("⚠ Vui lòng đăng nhập để chat với hỗ trợ viên!");
      onClose();
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        reconnectionAttempts: 5,
      });
    }

    const socket = socketRef.current;

    const onChatStarted = (id) => {
      setChatId(id);
      setReady(true);
      socket.emit("joinChat", id);

      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].content.includes("kết nối")) {
          return prev;
        }
        return [
          ...prev,
          {
            role: "system",
            content: "Đã kết nối với nhân viên hỗ trợ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
            time: new Date(),
          },
        ];
      });
    };

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.content === msg.content &&
            m.role === msg.role &&
            (Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 2000 || !m.created_at)
        );
        if (exists) return prev;
        return [...prev, { ...msg, time: new Date() }];
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
      console.log("Connection error:", err);
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
    };
  }, [userId, role, onClose]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const tempMsg = {
      role: "customer",
      content: input.trim(),
      created_at: new Date().toISOString(),
      time: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    if (socketRef.current) {
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

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-sans z-[9999] relative origin-bottom-right
        ${
          isMobile && !collapsed
            ? "fixed inset-0 w-full h-[100dvh] rounded-none border-0"
            : "w-[90vw] sm:w-[420px] rounded-2xl"
        }
      `}
      style={{
        height: collapsed ? "auto" : isMobile ? "100dvh" : "620px",
      }}
    >
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-0 right-0 mx-auto w-max z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs shadow-lg backdrop-blur-sm"
          >
            <CircleCheck className="text-sm" />
            <span>Cuộc trò chuyện đã kết thúc</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        layout="position"
        className={`bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none shrink-0 z-10 ${
          isMobile && !collapsed ? "pt-safe" : ""
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <HiSupport className="text-xl text-white" />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-emerald-600 rounded-full ${
                ready ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight flex items-center gap-2">
              <MessageCircle className="text-white/80" />
              HỖ TRỢ TRỰC TUYẾN
            </h3>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-emerald-100 flex items-center gap-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ready ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"
                    }`}
                  ></span>
                  {ready ? "Đang trực tuyến" : "Đang kết nối..."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {collapsed ? (
            <div className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <HiChevronUp className="text-lg" />
            </div>
          ) : (
            <div className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <HiChevronDown className="text-lg" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              endChat();
            }}
            className="p-2 rounded-lg hover:bg-red-500/50 transition-colors"
            title="Kết thúc chat"
          >
            <HiX className="text-lg" />
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Info Bar */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 border-b border-emerald-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${SPEEDY_INFO.hotline}`}
                    className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 transition-colors"
                  >
                    <HiPhone className="text-sm" />
                    <span className="font-semibold">{SPEEDY_INFO.hotline}</span>
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{SPEEDY_INFO.workingHours}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <Shield className="text-emerald-500" />
                  <span>Cuộc trò chuyện được mã hóa</span>
                </div>
              </div>

              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex w-full mb-4 ${
                      m.role === "customer"
                        ? "justify-end"
                        : m.role === "system"
                        ? "justify-center"
                        : "justify-start"
                    }`}
                  >
                    {m.role !== "customer" && m.role !== "system" && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-md">
                        <HiSupport className="text-base" />
                      </div>
                    )}

                    {m.role === "system" ? (
                      <div className="max-w-[90%] text-center">
                        <span className="text-[10px] text-gray-500 bg-white px-4 py-2 rounded-full inline-block border border-gray-100 shadow-sm">
                          {m.content}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col max-w-[85%]">
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            m.role === "customer"
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                        <span
                          className={`text-[10px] text-gray-400 mt-1 ${
                            m.role === "customer" ? "text-right" : "text-left"
                          }`}
                        >
                          {m.time ? formatTime(m.time) : ""}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 relative z-20 shrink-0 pb-safe">
              <div
                className={`relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border-2 border-transparent transition-all duration-300 ${
                  ready
                    ? "focus-within:border-emerald-400 focus-within:bg-white"
                    : "opacity-70 cursor-not-allowed"
                }`}
              >
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 disabled:cursor-not-allowed"
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
                  className={`ml-2 w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all ${
                    ready && input.trim()
                      ? "bg-gradient-to-br from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <HiPaperAirplane className="text-sm" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ready ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
                    }`}
                  ></span>
                  {ready ? "Kết nối ổn định" : "Đang kết nối server..."}
                </p>
                <span className="text-gray-200">•</span>
                <p className="text-[10px] text-gray-400">
                  SpeedyShip Support
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
