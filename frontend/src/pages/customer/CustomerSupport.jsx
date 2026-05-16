import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { useChat } from "../../context/ChatContext";
import {
  Headphones, ChevronDown, Loader2, MessageCircle, CircleHelp,
  PackageSearch, Wallet, UserCircle2,
} from "lucide-react";
import { FaRobot } from "react-icons/fa";

const FAQ_CATEGORY_ORDER = ["general", "order", "payment", "account"];

const FAQ_CATEGORY_META = {
  general:  { label: "Câu hỏi chung",   icon: CircleHelp,   color: "from-blue-500 to-cyan-500"   },
  order:    { label: "Đơn hàng",        icon: PackageSearch, color: "from-orange-500 to-red-500"   },
  payment:  { label: "Thanh toán",      icon: Wallet,       color: "from-purple-500 to-pink-500"  },
  account:  { label: "Tài khoản",      icon: UserCircle2,  color: "from-green-500 to-emerald-500" },
};

const DEFAULT_QUESTIONS_BY_CATEGORY = {
  general: [
    "SpeedyShip hoạt động ở khu vực nào?",
    "Làm sao liên hệ tổng đài SpeedyShip?",
    "Khung giờ hỗ trợ khách hàng của SpeedyShip?",
    "Tôi có thể chat với nhân viên hỗ trợ ở đâu?",
  ],
  order: [
    "Cách tạo đơn hàng nhanh trên SpeedyShip?",
    "Tôi muốn tra cứu vận đơn thì làm thế nào?",
    "Tôi có thể đổi địa chỉ nhận sau khi tạo đơn không?",
    "Đơn giao thất bại thì xử lý như thế nào?",
  ],
  payment: [
    "Phí vận chuyển nội thành và liên tỉnh bao nhiêu?",
    "Có hỗ trợ thu hộ COD không?",
    "Tôi nạp/rút tiền ví SpeedyShip như thế nào?",
    "Các phương thức thanh toán được hỗ trợ là gì?",
  ],
  account: [
    "Quên mật khẩu thì làm sao lấy lại?",
    "Tôi muốn cập nhật số điện thoại tài khoản ở đâu?",
    "Tài khoản bị khóa thì xử lý thế nào?",
    "Làm sao đổi thông tin hồ sơ cá nhân?",
  ],
};

const inferCategory = (question = "") => {
  const q = question.toLowerCase();
  if (/(đơn|vận đơn|tra cứu|giao|nhận|pickup|delivery)/.test(q)) return "order";
  if (/(thanh toán|ví|cod|phí|giá|tiền|nạp|rút)/.test(q))    return "payment";
  if (/(tài khoản|đăng nhập|mật khẩu|profile|hồ sơ|khóa)/.test(q)) return "account";
  return "general";
};

// Parse markdown answer into styled React nodes (no external lib needed)
function parseAnswer(text = "") {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Heading: ## Tiêu đề or ### Tiêu đề
    if (/^#{1,3}\s+(.+)$/.test(line)) {
      elements.push({ type: "heading", text: line.replace(/^#{1,3}\s+/, "") });
      i++;
      continue;
    }

    // Bold heading: **Tiêu đề**
    if (/^\*\*(.+)\*\*$/.test(line)) {
      elements.push({ type: "heading", text: line.replace(/^\*\*(.+)\*\*$/, "$1") });
      i++;
      continue;
    }

    // Table row: | col1 | col2 | ...
    if (/^\|/.test(line)) {
      const cells = line.split("|").map(c => c.trim()).filter(c => c !== "");
      // Skip separator row like |---|---|
      if (cells.length > 0 && !cells.every(c => /^-+$/.test(c))) {
        elements.push({ type: "table-row", cells });
      }
      i++;
      continue;
    }

    // Bullet list — supports -, *, •, and emoji-prefixed items
    const isBullet = /^[-*•]\s/.test(line) || /^[\u{1F300}-\u{1F9FF}]\s/u.test(line);
    if (isBullet) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const isBullet = /^[-*•]\s/.test(l) || /^[\u{1F300}-\u{1F9FF}]\s/u.test(l);
        if (!isBullet) break;
        let item = l.replace(/^[-*•]\s+/, "").replace(/^[\u{1F300}-\u{1F9FF}]\s+/u, "");
        item = parseInline(item);
        items.push(item);
        i++;
      }
      elements.push({ type: "list", items });
      continue;
    }

    // Ordered list: 1. or 1)
    if (/^\d+[.)]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i].trim())) {
        let item = lines[i].trim().replace(/^\d+[.)]\s+/, "");
        item = parseInline(item);
        items.push(item);
        i++;
      }
      elements.push({ type: "ordered-list", items });
      continue;
    }

    // Divider
    if (/^---+$/.test(line) || /^===+$/.test(line)) {
      elements.push({ type: "divider" });
      i++;
      continue;
    }

    // Regular paragraph
    if (line) {
      elements.push({ type: "paragraph", text: parseInline(line) });
    }
    i++;
  }

  return elements;
}

function parseInline(text) {
  // Split by **...** bold patterns
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ bold: false, text: text.slice(last, match.index) });
    parts.push({ bold: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ bold: false, text: text.slice(last) });
  return parts.length === 0 ? [{ bold: false, text }] : parts;
}

// Render inline text with bold support
function InlineText({ parts }) {
  return (
    <>
      {parts.map((part, idx) =>
        part.bold
          ? <strong key={idx} style={{ fontWeight: 700, color: "#113e48" }}>{part.text}</strong>
          : <span key={idx}>{part.text}</span>
      )}
    </>
  );
}

// Render answer elements
function AnswerView({ elements }) {
  if (!elements || elements.length === 0) return null;

  // Group table rows into tables
  const normalized = [];
  let i = 0;
  while (i < elements.length) {
    const el = elements[i];
    if (el.type === "table-row") {
      const rows = [];
      while (i < elements.length && elements[i].type === "table-row") {
        rows.push(elements[i].cells);
        i++;
      }
      normalized.push({ type: "table", rows });
      continue;
    }
    normalized.push(el);
    i++;
  }

  return (
    <div>
      {normalized.map((el, idx) => {
        if (el.type === "heading") {
          return (
            <p key={idx} style={{ fontSize: "1rem", fontWeight: 700, color: "#113e48", margin: "10px 0 4px" }}>
              <InlineText parts={parseInline(el.text)} />
            </p>
          );
        }
        if (el.type === "table") {
          const [header, ...body] = el.rows;
          return (
            <table key={idx} style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0", fontSize: "0.875rem" }}>
              {header && (
                <thead>
                  <tr>
                    {header.map((cell, ci) => (
                      <th key={ci} style={{ backgroundColor: "#f3f4f6", padding: "7px 12px", border: "1px solid #e5e7eb", textAlign: "left", fontWeight: 700, color: "#113e48" }}>
                        <InlineText parts={parseInline(cell)} />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", color: "#374151" }}>
                        <InlineText parts={parseInline(cell)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        if (el.type === "list") {
          return (
            <ul key={idx} style={{ margin: "6px 0", paddingLeft: 0, listStyle: "none" }}>
              {el.items.map((item, i2) => (
                <li key={i2} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px", color: "#374151", lineHeight: "1.7", fontSize: "0.9375rem" }}>
                  <span style={{ color: "#f97316", marginTop: "3px", flexShrink: 0 }}>•</span>
                  <span><InlineText parts={Array.isArray(item) ? item : parseInline(item)} /></span>
                </li>
              ))}
            </ul>
          );
        }
        if (el.type === "ordered-list") {
          return (
            <ol key={idx} style={{ margin: "6px 0", paddingLeft: "1.5rem", listStyle: "decimal" }}>
              {el.items.map((item, i2) => (
                <li key={i2} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px", color: "#374151", lineHeight: "1.7", fontSize: "0.9375rem" }}>
                  <span><InlineText parts={Array.isArray(item) ? item : parseInline(item)} /></span>
                </li>
              ))}
            </ol>
          );
        }
        if (el.type === "divider") {
          return <hr key={idx} style={{ margin: "10px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />;
        }
        if (el.type === "paragraph") {
          return (
            <p key={idx} style={{ margin: "4px 0", color: "#374151", lineHeight: "1.7", fontSize: "0.9375rem" }}>
              <InlineText parts={el.text} />
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function CustomerSupport() {
  const { openAIChat } = useChat();
  const [activeFaqTab, setActiveFaqTab] = useState("general");
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [questionsByCategory, setQuestionsByCategory] = useState(DEFAULT_QUESTIONS_BY_CATEGORY);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [answerByQuestion, setAnswerByQuestion] = useState({});
  const [loadingAnswerQuestion, setLoadingAnswerQuestion] = useState("");

  useEffect(() => {
    setLoadingFaq(true);
    API.get("/ai/faq-suggestions")
      .then((res) => {
        const list = Array.isArray(res.data?.suggestions) ? res.data.suggestions : [];
        if (list.length === 0) return;
        const next = {
          general: [...DEFAULT_QUESTIONS_BY_CATEGORY.general],
          order: [...DEFAULT_QUESTIONS_BY_CATEGORY.order],
          payment: [...DEFAULT_QUESTIONS_BY_CATEGORY.payment],
          account: [...DEFAULT_QUESTIONS_BY_CATEGORY.account],
        };
        list.forEach((q) => {
          const category = inferCategory(q);
          if (!next[category].includes(q)) next[category].push(q);
        });
        setQuestionsByCategory(next);
      })
      .finally(() => setLoadingFaq(false));
  }, []);

  const faqQuestions = useMemo(
    () => questionsByCategory[activeFaqTab] || [],
    [activeFaqTab, questionsByCategory],
  );

  const handleToggleQuestion = async (question) => {
    if (expandedQuestion === question) {
      setExpandedQuestion(null);
      return;
    }
    setExpandedQuestion(question);
    if (answerByQuestion[question]) return;
    setLoadingAnswerQuestion(question);
    try {
      const res = await API.post("/ai/ask", { message: question });
      setAnswerByQuestion((prev) => ({
        ...prev,
        [question]: res.data?.reply || "Hiện chưa có câu trả lời phù hợp cho câu hỏi này.",
      }));
    } catch {
      setAnswerByQuestion((prev) => ({
        ...prev,
        [question]: "Đang bận, bạn vui lòng thử lại sau vài giây.",
      }));
    } finally {
      setLoadingAnswerQuestion("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#113e48] via-blue-700 to-cyan-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaRobot className="text-white text-lg" />
            </div>
            Trung tâm hỗ trợ tự động
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Chọn nhóm chủ đề bên dưới, nhấn vào câu hỏi để xem câu trả lời ngay.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15">
          <Headphones size={120} />
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            {FAQ_CATEGORY_ORDER.map((tab) => {
              const isActive   = tab === activeFaqTab;
              const TabIcon    = FAQ_CATEGORY_META[tab].icon;
              const tabColor   = FAQ_CATEGORY_META[tab].color;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveFaqTab(tab); setExpandedQuestion(null); }}
                  className={`w-full text-left px-5 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${tabColor} text-white shadow-lg`
                      : "text-gray-600 border border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TabIcon size={15} />
                    {FAQ_CATEGORY_META[tab].label}
                  </span>
                </button>
              );
            })}

            {/* Need help card */}
            <div className="mt-6 rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-4">
              <p className="text-sm font-bold text-[#113e48] mb-1">Bạn vẫn cần trợ giúp?</p>
              <p className="text-xs text-gray-600 mb-3">
                Chat trực tiếp để hỏi theo ngữ cảnh đơn hàng cụ thể của bạn.
              </p>
              <button
                onClick={openAIChat}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle size={14} />
                Trò chuyện ngay
              </button>
            </div>
          </aside>

          {/* FAQ list */}
          <section className="space-y-3">
            {loadingFaq && (
              <div className="text-sm text-gray-500 py-5 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Đang tải câu hỏi FAQ...
              </div>
            )}

            {!loadingFaq &&
              faqQuestions.map((q) => {
                const isOpen         = expandedQuestion === q;
                const answer         = answerByQuestion[q];
                const isLoadingThis  = loadingAnswerQuestion === q;

                return (
                  <motion.div
                    key={q}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-xl overflow-hidden transition-colors ${
                      isOpen ? "border-orange-200" : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleQuestion(q)}
                      className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors ${
                        isOpen ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 mr-4">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                          isOpen
                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {isOpen
                            ? <FaRobot size={12} />
                            : <CircleHelp size={14} />
                          }
                        </div>
                        <span className={`text-base font-medium leading-relaxed ${isOpen ? "text-[#113e48]" : "text-gray-700"}`}>
                          {q}
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-all duration-300 shrink-0 ${isOpen ? "rotate-180 text-orange-500" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ maxHeight: 0, opacity: 0 }}
                          animate={{ maxHeight: 2000, opacity: 1 }}
                          exit={{ maxHeight: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="px-5 py-4 bg-gradient-to-b from-orange-50/40 to-white border-t border-orange-100">
                            {/* Loading state */}
                            {isLoadingThis && (
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#113e48] to-blue-600 flex items-center justify-center">
                                    <FaRobot className="text-white text-xs" />
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white animate-pulse" />
                                </div>
                                <div className="flex gap-1">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ y: [0, -4, 0] }}
                                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                      className="w-2 h-2 bg-blue-400 rounded-full"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">SpeedyShip đang trả lời...</span>
                              </div>
                            )}

                            {/* Answer */}
                            {!isLoadingThis && answer && (
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#113e48] to-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                  <FaRobot size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <AnswerView elements={parseAnswer(answer)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
          </section>
        </div>
      </div>
    </div>
  );
}
