import { useState, useEffect, useRef } from "react";
import {
  HiPaperAirplane,
  HiSparkles,
  HiChevronDown,
  HiChevronUp,
  HiX,
  HiPhone,
} from "react-icons/hi";
import {
  Bot,
  Package,
  Truck,
  Clock,
  Shield,
  MapPin,
  Lightbulb,
} from "lucide-react";
import { IoMail } from "react-icons/io5";
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_QUESTIONS = [
  { icon: Package, text: "Tra cứu đơn hàng ", color: "from-blue-500 to-cyan-500" },
  { icon: HiSparkles, text: "Dịch vụ vận chuyển của SpeedyShip", color: "from-purple-500 to-pink-500" },
  { icon: Shield, text: "Chính sách bảo hiểm hàng hóa", color: "from-green-500 to-emerald-500" },
  { icon: Lightbulb, text: "Hướng dẫn tạo đơn hàng mới", color: "from-orange-500 to-amber-500" },
  { icon: Truck, text: "Báo cáo sự cố giao hàng", color: "from-red-500 to-pink-500" },
  { icon: Clock, text: "Thời gian giao hàng dự kiến", color: "from-teal-500 to-cyan-500" },
];

const SPEEDY_INFO = {
  name: "SpeedyShip",
  tagline: "Vận chuyển nhanh chóng - An tâm trọn vẹn",
  hotline: "1900 888 999",
  email: "support@speedyship.vn",
  website: "https://speedyship.vn",
  address: "55 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
  workingHours: "7:00 - 22:00",
  socials: {
    facebook: "https://facebook.com/speedyship.vn",
    zalo: "https://zalo.me/speedyship",
  },
};

const MARKDOWN_COMPONENTS = {
  a: ({ node, ...props }) => (
    <a {...props} className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1" target="_blank" rel="noreferrer" />
  ),
  p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
  ul: ({ node, ...props }) => <ul {...props} className="list-none ml-0 my-2 space-y-1" />,
  li: ({ node, ...props }) => (
    <li {...props} className="flex items-start gap-2">
      <span className="text-orange-500 mt-0.5">•</span>
      <span>{props.children}</span>
    </li>
  ),
  strong: ({ node, ...props }) => <strong {...props} className="font-bold text-[#113e48]" />,
  h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold text-[#113e48] mt-2 mb-1" />,
  h2: ({ node, ...props }) => <h2 {...props} className="text-base font-bold text-[#113e48] mt-2 mb-1" />,
  h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-bold text-[#113e48] mt-1 mb-1" />,
  hr: () => <hr className="my-3 border-gray-200" />,
};

function BotMessageContent({ text, showCursor, isNew }) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:text-[#113e48] prose-a:text-blue-600 prose-strong:text-[#113e48] [&>*]:last:mb-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {text}
        </ReactMarkdown>
      </motion.div>
      {showCursor && (
        <span className="inline-block w-0.5 h-3.5 bg-[#113e48] ml-0.5 animate-pulse align-middle -mt-3" />
      )}
    </div>
  );
}

export default function ChatPopupTop({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `Chào bạn! \n\nTôi là **SpeedyAI** - trợ lý ảo của SpeedyShip. Tôi có thể giúp bạn:\n\n**Tra cứu đơn hàng** với mã vận đơn\n**Tư vấn giá cước** và khuyến mãi\n**Hướng dẫn sử dụng** dịch vụ\n**Giải đáp thắc mắc** về chính sách\n\nBạn cần hỗ trợ gì hôm nay?`,
      time: new Date(),
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showSuggestions]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setShowSuggestions(false);
    const userMsg = { from: "user", text: text, time: new Date(), id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await API.post("/ai/ask", { message: text });
      const fullText = res.data.reply;
      const botId = Date.now() + 1;

      setMessages((prev) => [...prev, { from: "bot", text: "", time: new Date(), id: botId, isNew: true }]);
      setIsTyping(false);

      // Hiệu ứng fade-in cho toàn bộ câu trả lời thay vì gõ từng chữ
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, text: fullText, isNew: false } : m))
        );
      }, 600);

    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Xin lỗi bạn, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline **${SPEEDY_INFO.hotline}** để được hỗ trợ trực tiếp.`,
          time: new Date(),
          id: Date.now(),
        },
      ]);
    }
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    setShowSuggestions(false);
    setTimeout(() => handleSend(text), 50);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: 420,
        height: collapsed ? 60 : 650,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-sans"
    >
      {/* Phần đầu */}
      <div
        className="bg-gradient-to-r from-[#113e48] via-blue-600 to-cyan-500 text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Bot className="text-xl text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#113e48] rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight flex items-center gap-2">
              <HiSparkles className="text-yellow-300 animate-pulse" />
              SpeedyAI
            </h3>
            {!collapsed && (
              <p className="text-[11px] text-blue-100 opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                Trực tuyến • Luôn sẵn sàng
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-red-500/50 transition-colors"
          >
            <HiX className="text-lg" />
          </button>
        </div>
      </div>

      {/* Nội dung */}
      {!collapsed && (
        <>
          {/* Thanh thông tin nhanh */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 border-b border-blue-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <a
                  href={`tel:${SPEEDY_INFO.hotline}`}
                  className="flex items-center gap-1.5 text-[#113e48] hover:text-orange-500 transition-colors"
                >
                  <HiPhone className="text-sm" />
                  <span className="font-semibold">{SPEEDY_INFO.hotline}</span>
                </a>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{SPEEDY_INFO.workingHours}</span>
              </div>
            </div>
          </div>

            {/* Danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
            <AnimatePresence mode="wait">
              {messages.map((m, i) => (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex w-full mb-4 ${
                    m.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.from === "bot" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#113e48] to-blue-600 text-white flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-md">
                      <Bot className="text-base" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        m.from === "user"
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {m.from === "bot" ? (
                        <BotMessageContent
                          text={m.text}
                          showCursor={false}
                          isNew={m.isNew}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-gray-400 mt-1 ${
                        m.from === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(m.time)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && !isTyping && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-2">
                      <HiSparkles className="text-orange-500" />
                      <span className="font-medium">Gợi ý câu hỏi</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTED_QUESTIONS.map((q, idx) => {
                      const Icon = q.icon;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleSuggestionClick(q.text)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`text-left text-xs p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${q.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                            >
                              <Icon className="text-white text-xs" />
                            </div>
                          </div>
                          <span className="text-gray-700 group-hover:text-[#113e48] transition-colors line-clamp-2">
                            {q.text}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Thẻ thông tin SpeedyShip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-gradient-to-br from-[#113e48] to-blue-600 rounded-xl text-white"
                  >
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Truck className="text-orange-400" />
                      SpeedyShip - Vận chuyển nhanh chóng
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-blue-100">
                        <HiPhone className="text-xs text-orange-400" />
                        <span>{SPEEDY_INFO.hotline}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-100">
                        <IoMail className="text-xs text-orange-400" />
                        <span className="truncate">{SPEEDY_INFO.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-100 col-span-2">
                        <MapPin className="text-xs text-orange-400" />
                        <span className="truncate">{SPEEDY_INFO.address}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chỉ báo đang nhập */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full mb-4 justify-start"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#113e48] to-blue-600 text-white flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                  <Bot className="text-base" />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                  <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    SpeedyAI đang trả lời
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 bg-orange-400 rounded-full inline-block"
                        />
                      ))}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border-2 border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all shadow-sm">
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                placeholder={input.startsWith("Tra cứu đơn hàng") ? "Nhập mã đơn hàng SPxxxx..." : "Nhập câu hỏi của bạn..."}
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className={`ml-2 w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? "bg-gradient-to-br from-[#113e48] to-blue-600 text-white hover:shadow-lg hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isTyping ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <HiSparkles className="text-sm" />
                  </motion.div>
                ) : (
                  <HiPaperAirplane className="text-sm" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Shield className="text-emerald-500" />
                Tin nhắn được bảo mật
              </p>
              <span className="text-gray-200">•</span>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Bot className="text-blue-500" />
                Powered by SpeedyAI
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
