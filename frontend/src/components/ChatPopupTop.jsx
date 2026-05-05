import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaMinus,
  FaExpand,
  FaPaperPlane,
  FaRobot,
} from "react-icons/fa";
import API from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faLightbulb } from "@fortawesome/free-solid-svg-icons";


const SUGGESTED_QUESTIONS = [
  "Tra cứu đơn hàng SPxxxx",
  "Bảng giá vận chuyển nội thành?",
  "Chính sách bảo hiểm hàng hóa?",
  "Làm sao để tạo đơn hàng mới?",
];

// Popup chat nhanh phía trên
export default function ChatPopupTop({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Xin chào! 👋 Tôi là trợ lý AI của SpeedyShip. Tôi có thể giúp bạn tra cứu đơn hàng hoặc tư vấn dịch vụ ngay lập tức.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showSuggestions]);

  const handleSend = async (text) => {
    if (!text.trim()) return;


    setShowSuggestions(false);


    const userMsg = { from: "user", text: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {

      const res = await API.post("/ai/ask", { message: text });

      const botMsg = { from: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Xin lỗi, tôi đang gặp sự cố kết nối tới máy chủ AI. Vui lòng thử lại sau!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div

      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        width: 400,
        height: collapsed ? 50 : 600,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-t-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 font-sans"
    >
      {/* Phần giao diện */}
      <div
        className="bg-gradient-to-r from-[#113e48] to-blue-500 text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center relative">
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#113e48] rounded-full"></div>
            <FaRobot />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight"> SPEEDY AI</h3>
            {!collapsed && (
              <p className="text-[11px] text-gray-300 opacity-80">
                Luôn sẵn sàng hỗ trợ
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/70">
          {collapsed ? (
            <FaExpand className="hover:text-white transition-colors text-base" />
          ) : (
            <FaMinus className="hover:text-white transition-colors text-base" />
          )}
          <FaTimes
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="hover:text-red-400 transition-colors ml-1 text-base"
          />
        </div>
      </div>

      {/* Render điều kiện */}
      {!collapsed && (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="text-center text-[10px] text-gray-400 mb-4 uppercase tracking-wider font-semibold">
              Hôm nay
            </div>

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full mb-4 ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.from === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-[#113e48] text-white flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-xs">
                    <FaRobot />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "bg-orange-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  {m.from === "bot" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 font-semibold hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            {...props}
                            className="list-disc ml-4 my-2 space-y-1"
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li {...props} className="marker:text-orange-500" />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            {...props}
                            className="font-bold text-[#113e48]"
                          />
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {showSuggestions && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex flex-col gap-2 items-center w-full px-4"
                >
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="text-yellow-500"
                    />
                    Gợi ý cho bạn:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleSend(q)}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "#f0f9ff",
                          borderColor: "#3b82f6",
                        }}
                        className="text-center text-xs text-[#113e48] bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm hover:text-blue-600 transition-all"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full mb-4 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-[#113e48] text-white flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                  <FaRobot />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    spin
                    className="text-gray-400"
                  />
                  <span className="text-xs text-gray-400 ml-1">
                    AI đang trả lời...
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Phần giao diện */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:bg-white focus-within:ring-1 focus-within:ring-orange-500 transition-all">
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className={`ml-2 w-8 h-8 shrink-0 flex items-center justify-center rounded-full transition-all ${
                  input.trim()
                    ? "bg-[#113e48] text-white hover:bg-orange-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isTyping ? (
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                ) : (
                  <FaPaperPlane className="text-xs" />
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400">
                Powered by SpeedyShip AI
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}