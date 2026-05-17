import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Bell, Phone, User, Clock, MessageCircle, Search } from "lucide-react";
import API from "../../services/api";
import toast from "../../lib/toast";
import { socket } from "../../lib/socket";
import { useDispatcherChatState } from "../../hooks/useDispatcherChat";

const LAST_CHAT_KEY = "dispatcher_last_chat_id";

export default function DispatcherChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState("active"); // "active" | "all"
  const [toastMsg, setToastMsg] = useState(null);
  const [onlineCustomers, setOnlineCustomers] = useState({});

  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  const toastTimer = useRef(null);
  const fetchingIds = useRef(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    // Lưu chat đang chọn vào localStorage
    if (selectedChat) {
      localStorage.setItem(LAST_CHAT_KEY, String(selectedChat.id));
    }
  }, [selectedChat]);

  // --- Tải các chat đang hoạt động từ DB (gộp thay vì thay thế để giữ trạng thái socket) ---
  const fetchChats = async () => {
    try {
      const res = await API.get("/chats");
      const dbChats = res.data || [];

      setChats((prev) => {
        const merged = [...prev];
        dbChats.forEach((dbChat) => {
          const idx = merged.findIndex((c) => c.id === dbChat.id);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...dbChat };
          } else {
            merged.push(dbChat);
          }
        });
        // Sắp xếp: chat đang hoạt động trước, sau đó theo last_message_at
        return merged.sort(
          (a, b) =>
            (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1) ||
            new Date(b.last_message_at || b.started_at) - new Date(a.last_message_at || a.started_at)
        );
      });
    } catch (err) {
      console.error("[DispatcherChat] fetchChats error:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  // --- Tải tin nhắn của một chat từ DB ---
  const fetchMessages = async (chatId) => {
    if (fetchingIds.current.has(chatId)) return;
    fetchingIds.current.add(chatId);

    setLoadingMessages(true);
    try {
      const res = await API.get(`/chats/${chatId}/messages`);
      const dbMessages = res.data || [];

      setMessages((prev) => {
        // Nếu đang xem chat này → merge DB messages với realtime messages
        if (selectedChatRef.current?.id === chatId) {
          const merged = [...prev];
          dbMessages.forEach((dbMsg) => {
            if (!merged.some((m) => m.id === dbMsg.id)) {
              merged.push(dbMsg);
            }
          });
          return merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        // Nếu không xem chat này → chỉ set nếu empty (lần đầu load)
        if (prev.length === 0) return dbMessages;
        return prev;
      });
    } catch (err) {
      console.error("[DispatcherChat] fetchMessages error:", err);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
      fetchingIds.current.delete(chatId);
    }
  };

  // --- Tự động chọn chat cuối cùng từ localStorage ---
  const autoSelectLastChat = (chats) => {
    const lastId = localStorage.getItem(LAST_CHAT_KEY);
    if (lastId) {
      const found = chats.find((c) => String(c.id) === String(lastId));
      if (found) {
        setSelectedChat(found);
        selectedChatRef.current = found;
        fetchMessages(found.id);
        socket.emit("joinChat", found.id);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    fetchChats().then(() => {
      // tự động chọn sẽ được gọi sau khi chats tải xong
    });
  }, []);

  // Sau khi chats tải xong → tự động chọn chat cuối cùng
  useEffect(() => {
    if (!initialized.current && !loadingChats && chats.length > 0) {
      initialized.current = true;
      const selected = autoSelectLastChat(chats);
      if (!selected && chats.length > 0) {
        // Nếu không tìm được chat cuối cùng → chọn chat mới nhất
        const sorted = [...chats].sort(
          (a, b) => new Date(b.last_message_at || b.started_at) - new Date(a.last_message_at || a.started_at)
        );
        if (sorted[0]) {
          setSelectedChat(sorted[0]);
          selectedChatRef.current = sorted[0];
          fetchMessages(sorted[0].id);
          socket.emit("joinChat", sorted[0].id);
        }
      }
    }
  }, [loadingChats, chats]);

  // --- Các sự kiện socket thời gian thực ---
  useEffect(() => {
    // KHÔNG gọi socket.connect/disconnect — đã có singleton ở lib/socket.js

    const onNewChat = ({ chatId, customerId }) => {
      const newChat = {
        id: chatId,
        customer_id: customerId,
        status: "active",
        customer_name: null,
        customer_phone: null,
        last_message: null,
        last_message_at: new Date().toISOString(),
      };

      setChats((prev) => {
        if (prev.some((c) => c.id === chatId)) return prev;
        return [newChat, ...prev];
      });

      // Tự động chọn và tải tin nhắn nếu chưa có chat nào được chọn
      if (!selectedChatRef.current) {
        selectedChatRef.current = newChat;
        setSelectedChat(newChat);
        localStorage.setItem(LAST_CHAT_KEY, String(chatId));
        fetchMessages(chatId);
        socket.emit("joinChat", chatId);
      }
    };

    const onWelcomeMessage = (msg) => {
      const chatId = msg.chatId;

      setChats((prev) => {
        if (prev.some((c) => c.id === chatId)) {
          return prev.map((c) =>
            c.id === chatId
              ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
              : c
          );
        }
        return [
          { id: chatId, customer_id: null, status: "active", customer_name: null, last_message: msg.content, last_message_at: msg.created_at },
          ...prev,
        ];
      });

      // Thêm tin nhắn vào cuối danh sách (fetch merge đã loại trùng theo id)
      setMessages((prev) => {
        if (selectedChatRef.current?.id !== chatId) return prev;
        const exists = prev.some((m) => m.id === msg.id || (m.content === msg.content && m.created_at === msg.created_at));
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    const onNewMessage = (msg) => {
      const chatId = msg.chatId;
      const isOwnMessage = msg.role === "dispatcher";

      // Thêm mới hoặc cập nhật chat trong danh sách
      setChats((prev) => {
        const chatExists = prev.some((c) => c.id === chatId);
        const updated = prev.map((c) =>
          c.id === chatId
            ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
            : c
        );
        if (!chatExists) {
          return [
            { id: chatId, customer_id: null, status: "active", customer_name: null, last_message: msg.content, last_message_at: msg.created_at },
            ...updated,
          ];
        }
        return updated.sort((a, b) => new Date(b.last_message_at || b.started_at) - new Date(a.last_message_at || a.started_at));
      });

      // Nếu chưa chọn chat nào → tự động chọn chat này
      if (!selectedChatRef.current) {
        const newChat = { id: chatId, customer_id: msg.senderId, status: "active", customer_name: null };
        selectedChatRef.current = newChat;
        setSelectedChat(newChat);
        localStorage.setItem(LAST_CHAT_KEY, String(chatId));
        fetchMessages(chatId);
        socket.emit("joinChat", chatId);
        return;
      }

      // Nếu đang xem đúng chat → thêm tin nhắn vào cuối (fetch merge đã loại trùng)
      if (selectedChatRef.current?.id === chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id || (m.content === msg.content && m.created_at === msg.created_at));
          if (exists) return prev;
          return [...prev, msg];
        });
        return;
      }

      // Đang xem chat khác → toast thôi
      if (!isOwnMessage) {
        showToast(`Tin nhắn mới từ #${chatId}: "${msg.content?.slice(0, 50)}"`);
      }
    };

    const onChatEnded = ({ chatId }) => {
      // Cập nhật status thay vì xóa — để tab "Tất cả" vẫn thấy lịch sử
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, status: "closed", last_message_at: new Date().toISOString() } : c
        )
      );
      // Nếu đang xem chat này → cập nhật selectedChat để vô hiệu hóa ô nhập
      if (selectedChatRef.current?.id === chatId) {
        const updated = { ...selectedChatRef.current, status: "closed" };
        selectedChatRef.current = updated;
        setSelectedChat(updated);
      }
      showToast(`Cuộc trò chuyện #${chatId} đã kết thúc.`);
    };

    socket.on("newChat", onNewChat);
    socket.on("welcomeMessage", onWelcomeMessage);
    socket.on("newMessage", onNewMessage);
    socket.on("customerMessage", onNewMessage);
    socket.on("chatEnded", onChatEnded);

    return () => {
      socket.off("newChat", onNewChat);
      socket.off("welcomeMessage", onWelcomeMessage);
      socket.off("newMessage", onNewMessage);
      socket.off("customerMessage", onNewMessage);
      socket.off("chatEnded", onChatEnded);
    };
  }, []);

  // --- Tự động cuộn khi có tin nhắn mới ---
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Chọn một chat ---
  const selectChat = (chat) => {
    if (selectedChatRef.current?.id === chat.id) return; // đã đang xem
    selectedChatRef.current = chat;
    setSelectedChat(chat);
    // Không xóa messages — fetchMerge sẽ xử lý việc gộp nếu cần
    fetchMessages(chat.id);
    socket.emit("joinChat", chat.id);
  };

  // --- Gửi tin nhắn ---
  const sendMessage = () => {
    if (!selectedChat || !input.trim()) return;
    if (selectedChat.status === "closed") return;

    const msg = {
      chatId: selectedChat.id,
      senderId: 0,
      role: "dispatcher",
      content: input.trim(),
    };
    socket.emit("sendMessage", msg);
    setInput("");
  };

  // --- Hàm hỗ trợ hiển thị toast ---
  const showToast = (text) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(text);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3500);
  };

  // --- Định dạng thời gian ---
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return formatTime(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + " " + formatTime(dateStr);
  };

  // --- Nhóm tin nhắn theo ngày ---
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((m) => {
      const dateKey = new Date(m.created_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  };

  // --- Lọc chat theo từ khóa tìm kiếm và tab ---
  const filteredChats = chats.filter((c) => {
    if (tabFilter === "active" && c.status !== "active") return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(c.id).includes(q) ||
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_phone?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex h-[85vh] bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 font-sans">

      {/* ====== SIDEBAR: Danh sách chat ====== */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              Hội thoại
            </h3>
            <button
              onClick={fetchChats}
              title="Làm mới"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              ↻ Làm mới
            </button>
          </div>

          {/* Tab filter */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTabFilter("active")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                tabFilter === "active"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đang chat ({chats.filter((c) => c.status === "active").length})
            </button>
            <button
              onClick={() => setTabFilter("all")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                tabFilter === "all"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tất cả ({chats.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Tìm khách, mã chat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))
          ) : filteredChats.length === 0 ? (
            <div className="text-center mt-10 text-gray-400 text-xs space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto opacity-30" />
              <p>Chưa có hội thoại nào</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              const lastMsg = chat.last_message || "Bắt đầu chat...";
              const time = formatDate(chat.last_message_at || chat.started_at);
              const customerName = chat.customer_name || `Khách #${chat.customer_id}`;
              const customerPhone = chat.customer_phone;
              const isActive = chat.status === "active";

              return (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}`}>
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-bold text-sm truncate max-w-[130px] ${isSelected ? "text-white" : "text-gray-800"}`}>
                        {customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isActive && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isSelected ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-500"}`}>
                          Đã đóng
                        </span>
                      )}
                      {isActive && (
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-green-300" : "bg-green-500"} animate-pulse`} />
                      )}
                      {time && (
                        <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                          {time}
                        </span>
                      )}
                    </div>
                  </div>

                  {customerPhone && (
                    <div className={`flex items-center gap-1 text-[10px] mb-1 ${isSelected ? "text-blue-200" : "text-gray-400"}`}>
                      <Phone size={10} />
                      {customerPhone}
                    </div>
                  )}

                  <p className={`text-xs truncate leading-snug ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                    {lastMsg}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ====== MAIN: Khung chat ====== */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Phần đầu */}
            <div className="h-16 border-b flex items-center px-6 justify-between bg-white shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {(selectedChat.customer_name || `#${selectedChat.id}`).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">
                    {selectedChat.customer_name || `Khách #${selectedChat.customer_id}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-500">Chat #{selectedChat.id}</span>
                  </div>
                </div>
              </div>
              {selectedChat.customer_phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Phone size={12} />
                  {selectedChat.customer_phone}
                </div>
              )}
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              {selectedChat.status === "closed" && (
                <div className="mb-4 flex items-center gap-2 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium">
                  <span>🔒 Cuộc trò chuyện này đã kết thúc</span>
                </div>
              )}
              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      <div className={`h-12 ${i % 2 === 0 ? "bg-blue-100" : "bg-white"} border border-gray-200 rounded-2xl w-48 animate-pulse`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <MessageCircle className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(messageGroups).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                          {new Date(dateKey).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-3">
                        {msgs.map((m, i) => {
                          const isDispatcher = m.role === "dispatcher";
                          return (
                            <div key={m.id || i} className={`flex ${isDispatcher ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[72%] flex flex-col ${isDispatcher ? "items-end" : "items-start"}`}>
                                <div
                                  className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                    isDispatcher
                                      ? "bg-blue-600 text-white rounded-br-none"
                                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                                  }`}
                                >
                                  {m.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                  {formatTime(m.created_at)}
                                  {isDispatcher && m.sender_id === 0 && (
                                    <span className="ml-1 text-blue-400">✓</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Ô nhập */}
            <div className="p-4 bg-white border-t shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={selectedChat?.status === "closed" ? "Cuộc trò chuyện đã kết thúc" : "Nhập tin nhắn hỗ trợ..."}
                  disabled={selectedChat?.status === "closed"}
                  className="flex-1 px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || selectedChat?.status === "closed"}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-full font-medium transition shadow-sm text-sm disabled:cursor-not-allowed"
                >
                  Gửi
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 bg-gray-50">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-500">Chưa chọn cuộc trò chuyện</p>
              <p className="text-xs text-gray-400 mt-1">Chọn một hội thoại từ danh sách bên trái</p>
            </div>
          </div>
        )}
      </div>

      {/* Thông báo toast */}
      {toastMsg && (
        <div className="absolute top-4 right-4 bg-gray-800/90 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 max-w-xs backdrop-blur-sm">
          <Bell className="w-5 h-5 text-yellow-400 shrink-0" />
          <span className="text-sm font-medium leading-snug">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
