import { useEffect, useState, useRef, useLayoutEffect } from "react";
import io from "socket.io-client";

// Khởi tạo socket bên ngoài để tránh connect lại khi re-render
const socket = io("http://localhost:5000", {
  autoConnect: false, // Kiểm soát kết nối thủ công
});

export default function DispatcherChat() {
  // 🗃️ State quản lý dữ liệu
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // 💡 QUAN TRỌNG: Lưu message theo dạng Dictionary { chatId: [messages] }
  const [allMessages, setAllMessages] = useState({});

  const [input, setInput] = useState("");
  const [toast, setToast] = useState(null);

  // Ref dùng để scroll xuống cuối
  const messagesEndRef = useRef(null);
  // Ref để truy cập state mới nhất trong socket listeners
  const selectedChatRef = useRef(selectedChat);

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // ========================
  // 🧠 Load & Save LocalStorage
  // ========================
  useEffect(() => {
    // Load dữ liệu khi mount
    const saved = localStorage.getItem("dispatcherChatData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveChats(parsed.activeChats || []);
        setSelectedChat(parsed.selectedChat || null);
        setAllMessages(parsed.allMessages || {});

        socket.connect();
        if (parsed.selectedChat) {
          socket.emit("joinChat", parsed.selectedChat);
        } else {
          socket.emit("joinDispatcher");
        }
      } catch (e) {
        console.error("Lỗi parse LocalStorage", e);
      }
    } else {
      socket.connect();
      socket.emit("joinDispatcher");
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Save dữ liệu mỗi khi state quan trọng thay đổi
  useEffect(() => {
    localStorage.setItem(
      "dispatcherChatData",
      JSON.stringify({ activeChats, selectedChat, allMessages })
    );
  }, [activeChats, selectedChat, allMessages]);

  // ========================
  // 📜 Auto Scroll xuống cuối
  // ========================
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedChat]);

  // ========================
  // ⚡ Xử lý Socket Events (ĐÃ SỬA LỖI DOUBLE MESSAGE)
  // ========================
  useEffect(() => {
    // Helper để thêm tin nhắn vào đúng chat ID
    const addMessageToChat = (chatId, msg) => {
      setAllMessages((prev) => {
        const currentMsgs = prev[chatId] || [];

        // 🛡️ Logic chống trùng lặp (Optional): Kiểm tra nếu tin nhắn vừa đến đã tồn tại
        // (Dựa vào timestamp hoặc nội dung nếu không có ID unique)
        const isDuplicate = currentMsgs.some(
          (m) => m.content === msg.content && m.created_at === msg.created_at
        );
        if (isDuplicate) return prev;

        return {
          ...prev,
          [chatId]: [...currentMsgs, msg],
        };
      });
    };

    const onNewChat = ({ chatId, customerId }) => {
      console.log("🆕 Khách hàng mới:", chatId);
      setActiveChats((prev) => {
        if (prev.includes(chatId)) return prev;
        return [chatId, ...prev]; // Đưa lên đầu danh sách
      });
      showToast(`Khách hàng #${customerId} bắt đầu chat #${chatId}`);
    };

    const onWelcomeMessage = (msg) => {
      const { chatId } = msg;
      if (!selectedChatRef.current) {
        setSelectedChat(chatId);
      }
      addMessageToChat(chatId, msg);
    };

    // 🟢 HÀM 1: CHỈ XỬ LÝ VIỆC HIỂN THỊ TIN NHẮN VÀO KHUNG CHAT
    // Lắng nghe sự kiện 'newMessage'
    const handleNewMessage = (msg) => {
      addMessageToChat(msg.chatId, msg);
    };

    // 🟠 HÀM 2: XỬ LÝ THÔNG BÁO TỪ DISPATCHER ROOM
    const handleCustomerNotification = (msg) => {
      const { chatId, content } = msg;

      // 1. Cập nhật Sidebar (Đưa chat lên đầu danh sách)
      setActiveChats((prev) => {
        const filtered = prev.filter((id) => id !== chatId);
        return [chatId, ...filtered];
      });

      // 2. Logic quan trọng:
      // Nếu Dispatcher ĐANG KHÔNG xem chat này -> Thì phải lưu tin nhắn vào State
      // (Vì lúc này Dispatcher chưa join room nên không nhận được sự kiện 'newMessage')
      if (selectedChatRef.current !== chatId) {
        showToast(`Tin nhắn mới từ #${chatId}: "${content}"`);

        // 🔥 THÊM DÒNG NÀY ĐỂ LƯU TIN NHẮN ĐẦU TIÊN
        addMessageToChat(chatId, msg);
      }

      // Ngược lại: Nếu đang xem chat (selectedChatRef.current === chatId)
      // thì sự kiện 'newMessage' đã lo việc lưu rồi, ta không làm gì cả để tránh double.
    };

    const onChatEnded = ({ chatId }) => {
      showToast(`Cuộc trò chuyện #${chatId} đã kết thúc.`);
      setActiveChats((prev) => prev.filter((id) => id !== chatId));

      // Xóa tin nhắn của chat đã đóng (Tùy chọn)
      setAllMessages((prev) => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });

      if (selectedChatRef.current === chatId) {
        setSelectedChat(null);
      }
    };

    // Đăng ký sự kiện
    socket.on("newChat", onNewChat);
    socket.on("welcomeMessage", onWelcomeMessage);

    // 👇 TÁCH RIÊNG 2 SỰ KIỆN NÀY ĐỂ TRÁNH LẶP
    socket.on("newMessage", handleNewMessage); // Vẽ Chat
    socket.on("customerMessage", handleCustomerNotification); // Báo Toast

    socket.on("chatEnded", onChatEnded);

    // Cleanup
    return () => {
      socket.off("newChat", onNewChat);
      socket.off("welcomeMessage", onWelcomeMessage);
      socket.off("newMessage", handleNewMessage);
      socket.off("customerMessage", handleCustomerNotification);
      socket.off("chatEnded", onChatEnded);
    };
  }, []);

  // ========================
  // ✉️ Gửi tin nhắn
  // ========================
  const sendMessage = () => {
    if (!selectedChat || !input.trim()) return;
    const msg = {
      chatId: selectedChat,
      senderId: 0,
      role: "dispatcher",
      content: input.trim(),
      // timestamp: new Date().toISOString(), // Server sẽ tạo timestamp
    };

    socket.emit("sendMessage", msg);

    // Lưu ý: Không cần setAllMessages ở đây vì server sẽ emit lại 'newMessage'
    // và hàm handleNewMessage sẽ bắt sự kiện đó để vẽ lên UI.

    setInput("");
  };

  // ========================
  // 🔁 Chọn chat
  // ========================
  const selectChat = (id) => {
    setSelectedChat(id);
    socket.emit("joinChat", id);
  };

  const clearHistory = () => {
    localStorage.removeItem("dispatcherChatData");
    setActiveChats([]);
    setSelectedChat(null);
    setAllMessages({});
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  // Lấy tin nhắn của chat đang chọn
  const currentMessages = selectedChat ? allMessages[selectedChat] || [] : [];

  return (
    <div className="relative flex h-[85vh] bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      {/* Sidebar List Chat */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h3 className="font-bold text-gray-700">
            💬 Hàng chờ ({activeChats.length})
          </h3>
          <button
            onClick={clearHistory}
            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition"
          >
            Clear Data
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {activeChats.length === 0 ? (
            <div className="text-center mt-10 text-gray-400 text-sm">
              Chưa có kết nối nào
            </div>
          ) : (
            activeChats.map((id) => {
              const chatMsgs = allMessages[id] || [];
              const lastMsg =
                chatMsgs.length > 0
                  ? chatMsgs[chatMsgs.length - 1].content
                  : "Bắt đầu chat...";

              return (
                <div
                  key={id}
                  onClick={() => selectChat(id)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${
                    selectedChat === id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">Khách #{id}</span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      selectedChat === id ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {lastMsg}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="h-16 border-b flex items-center px-6 justify-between bg-white shadow-sm z-10">
          {selectedChat ? (
            <div>
              <h2 className="font-bold text-gray-800">Chat #{selectedChat}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-500">Đang hoạt động</span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 font-medium">
              Chọn một hội thoại để bắt đầu
            </span>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {selectedChat ? (
            currentMessages.length > 0 ? (
              <div className="space-y-4">
                {currentMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === "dispatcher" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                        m.role === "dispatcher"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <p>Chưa có tin nhắn nào</p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              {/* Icon Placeholder */}
              <p>Xin chào, Dispatcher!</p>
            </div>
          )}
        </div>

        {selectedChat && (
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn hỗ trợ..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-medium transition shadow-sm"
              >
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
          <span>🔔</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
