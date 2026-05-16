import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaUser, FaPaperPlane, FaChevronRight } from "react-icons/fa";

// Danh sách câu hỏi gợi ý
const FAQ_LIST = [
  {
    q: "Thời gian giao hàng mất bao lâu?",
    a: "SpeedyShip cung cấp nhiều gói dịch vụ:\n• Hỏa tốc: 2–4 giờ nội thành\n• Nhanh: 1 ngày (nội tỉnh) hoặc 1–2 ngày (liên tỉnh)\n• Tiêu chuẩn: 2–5 ngày toàn quốc\nThời gian thực tế phụ thuộc tuyến đường và điều kiện giao thông.",
  },
  {
    q: "Phí vận chuyển được tính như thế nào?",
    a: "Cước phí được tính dựa trên:\n• Trọng lượng thực tế hoặc kích thước kiện hàng (lấy giá trị lớn hơn)\n• Khoảng cách từ điểm lấy đến điểm giao\n• Loại dịch vụ lựa chọn\nBạn có thể tham khảo bảng giá tại trang Dịch vụ hoặc nhắn chúng tôi để báo giá chính xác.",
  },
  {
    q: "Làm thế nào để tra cứu đơn hàng?",
    a: "Rất đơn giản! Bạn có thể:\n1. Truy cập trang Tra Cứu trên website\n2. Nhập mã vận đơn và 4 số cuối SĐT người nhận\n3. Xem vị trí thực tế trên bản đồ GPS\nHoặc liên hệ hotline 1900 888 999 để được hỗ trợ nhanh nhất.",
  },
  {
    q: "SpeedyShip có hỗ trợ giao hàng COD không?",
    a: "Có! SpeedyShip hỗ trợ thu hộ tiền mặt (COD) toàn quốc. Tiền COD sẽ được chuyển về tài khoản của bạn trong vòng 24–48 giờ sau khi đơn giao thành công. Phí COD rất cạnh tranh, chỉ từ 1% giá trị đơn hàng.",
  },
  {
    q: "Hàng hóa có được bảo hiểm không?",
    a: "SpeedyShip cung cấp dịch vụ bảo hiểm hàng hóa 100% giá trị khai báo. Trong trường hợp hàng bị mất, hư hỏng do lỗi vận chuyển, chúng tôi sẽ bồi thường đầy đủ theo chính sách bồi thường. Khuyến nghị khai báo đúng giá trị hàng.",
  },
  {
    q: "Làm thế nào để đăng ký làm tài xế?",
    a: "Để gia nhập đội ngũ SpeedyShip:\n1. Truy cập trang Tuyển Dụng\n2. Điền đầy đủ thông tin cá nhân và phương tiện\n3. Nộp hồ sơ online\nChúng tôi sẽ liên hệ phỏng vấn trong 24–48 giờ. Thu nhập từ 10–18 triệu/tháng!",
  },
  {
    q: "Giờ làm việc và hotline hỗ trợ?",
    a: "Đội ngũ SpeedyShip hỗ trợ bạn:\n• Hotline: 1900 888 999 (miễn phí)\n• Giờ hành chính: T2–T7, 8:00–18:00\n• Chat online: 24/7 qua website\n• Email: support@speedyship.com\nPhản hồi trong vòng 1 giờ làm việc!",
  },
];


// Hiệu ứng gõ chữ từng ký tự
function TypingText({ text, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-line">
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-gray-500 animate-pulse ml-0.5 align-middle" />}
    </span>
  );
}

export default function FAQSection() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Xin chào! Tôi là trợ lý SpeedyShip. Hãy chọn câu hỏi bên dưới hoặc gõ thắc mắc của bạn — tôi sẽ hỗ trợ ngay!",
      id: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const chatContainerRef = useRef(null);
  const msgId = useRef(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Chỉ scroll bên trong chat container, không cuộn cả trang
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const addUserMsg = (text) => {
    setMessages((prev) => [...prev, { role: "user", text, id: msgId.current++ }]);
  };

  const addAIMsg = (text) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text, id: msgId.current++, animate: true }]);
      setTyping(false);
    }, 1500);
  };

  const handleFAQ = (item) => {
    if (typing) return;
    addUserMsg(item.q);
    addAIMsg(item.a);
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q || typing) return;
    setInput("");
    addUserMsg(q);

    // Tìm câu trả lời khớp
    const match = FAQ_LIST.find((f) =>
      f.q.toLowerCase().includes(q.toLowerCase()) ||
      q.toLowerCase().includes(f.q.toLowerCase().split(" ").slice(0, 3).join(" "))
    );
    if (match) {
      addAIMsg(match.a);
    } else {
      addAIMsg(
        "Cảm ơn bạn đã liên hệ! Câu hỏi này hơi phức tạp — mình sẽ chuyển cho nhân viên hỗ trợ xử lý ngay.\n\nBạn có thể:\n• Gọi hotline: 1900 888 999\n• Gửi email: support@speedyship.com\n• Hoặc để lại tin nhắn qua form liên hệ bên cạnh."
      );
    }
  };

  const displayedFAQs = showMore ? FAQ_LIST : FAQ_LIST.slice(0, 4);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Tiêu đề */}
        <div className="text-center mb-14" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-[#113e48]/10 text-[#113e48] px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider mb-4 border border-[#113e48]/20">
            <FaRobot className="text-orange-500" />
            <span>Trợ lý FAQ - trả lời tự động</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] mb-4">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Trợ lý SpeedyShip sẵn sàng giải đáp mọi thắc mắc của bạn ngay lập tức
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Cột trái: Câu hỏi gợi ý */}
          <div data-aos="fade-right">
            <h3 className="text-lg font-bold text-[#113e48] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full inline-block" />
              Câu hỏi phổ biến
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {displayedFAQs.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleFAQ(item)}
                    disabled={typing}
                    className="w-full text-left flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 rounded-2xl px-5 py-4 transition-all duration-300 group disabled:opacity-50"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <FaChevronRight className="text-orange-500 text-xs group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#113e48] transition-colors leading-snug">
                      {item.q}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {!showMore && FAQ_LIST.length > 4 && (
                <button
                  onClick={() => setShowMore(true)}
                  className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2 transition-colors"
                >
                  + Xem thêm {FAQ_LIST.length - 4} câu hỏi khác
                </button>
              )}
            </div>
          </div>

          {/* Cột phải: Chat window */}
          <div data-aos="fade-left">
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#113e48]/10 border border-gray-100 overflow-hidden flex flex-col" style={{ height: "520px" }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#113e48] to-[#1a5c6e] px-5 py-4 flex items-center gap-3 shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                    <FaRobot />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#113e48]" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Trợ lý SpeedyShip FAQ</p>
                  <p className="text-white/60 text-xs">Trực tuyến • Phản hồi ngay</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="text-center mb-2">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    Cuộc trò chuyện được bảo mật
                  </span>
                </div>

                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-[#113e48] text-white flex items-center justify-center text-xs shrink-0 mt-1">
                          <FaRobot />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === "user"
                            ? "bg-[#113e48] text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                        }`}
                      >
                        {msg.role === "ai" && msg.animate ? (
                          <TypingText text={msg.text} />
                        ) : (
                          <span className="whitespace-pre-line">{msg.text}</span>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs shrink-0 mt-1">
                          <FaUser />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#113e48] text-white flex items-center justify-center text-xs shrink-0">
                      <FaRobot />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                        SpeedyShip AI đang trả lời
                        <span className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Input box */}
              <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={typing}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || typing}
                    className="w-8 h-8 rounded-full bg-[#113e48] hover:bg-orange-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <FaPaperPlane className="text-xs pr-[1px]" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Trợ lý AI đang trực tuyến
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
