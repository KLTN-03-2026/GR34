import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";

// Sidebar tiện ích
export default function UtilitySidebar() {
  const navigate = useNavigate();
  const { openSupportChat, openAIChat } = useChat();

  const [expanded, setExpanded] = useState(false);

  const items = [
    {
      icon: "💰",
      text: "Ước tính cước phí",
      action: () => navigate("/pricing"),
    },
    {
      icon: "🔍",
      text: "Theo dõi vận đơn",
      action: () => navigate("/tracking"),
    },
    {
      icon: "📦",
      text: "Ứng tuyển giao hàng",
      action: () => navigate("/driver/apply"),
    },
    {
      icon: "💬",
      text: "Chat hỗ trợ",
      action: () => openSupportChat(),
    },
    {
      icon: "🤖",
      text: "Chat AI",
      action: () => openAIChat(),
    },
  ];

  return (
    <div className="fixed top-1/3 right-0 z-[9999]">
      {/* Render điều kiện */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="bg-blue-400 text-white px-5 py-3 rounded-l-xl 
                     flex items-center gap-2 font-semibold shadow-lg hover:bg-blue-700"
        >
          📌 Tiện ích
        </button>
      )}

      {/* Render điều kiện */}
      {expanded && (
        <div
          className="bg-blue-600 text-white rounded-l-2xl shadow-2xl w-[220px]
                      flex flex-col overflow-hidden animate-slide-left"
        >
          {/* Phần giao diện */}
          <div className="flex justify-between items-center px-4 py-3 bg-blue-700">
            <span className="font-semibold">Tiện ích</span>
            <button
              onClick={() => setExpanded(false)}
              className="px-2 py-1 hover:bg-blue-800 rounded"
            >
              ✖
            </button>
          </div>

          <div className="flex flex-col py-1">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="flex items-center gap-3 px-4 py-3 text-sm
                           hover:bg-blue-700 transition-all"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}