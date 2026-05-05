import { useEffect, useState, useRef, useLayoutEffect } from "react";
import io from "socket.io-client";


const socket = io("http://localhost:5000", {
  autoConnect: false,
});

// Chat nội bộ điều phối viên
export default function DispatcherChat() {

  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);


  const [allMessages, setAllMessages] = useState({});

  const [input, setInput] = useState("");
  const [toast, setToast] = useState(null);


  const messagesEndRef = useRef(null);

  const selectedChatRef = useRef(selectedChat);


  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);


  useEffect(() => {

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
      }
    } else {
      socket.connect();
      socket.emit("joinDispatcher");
    }

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    localStorage.setItem(
      "dispatcherChatData",
      JSON.stringify({ activeChats, selectedChat, allMessages })
    );
  }, [activeChats, selectedChat, allMessages]);


  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedChat]);


  useEffect(() => {

    const addMessageToChat = (chatId, msg) => {
      setAllMessages((prev) => {
        const currentMsgs = prev[chatId] || [];


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
      setActiveChats((prev) => {
        if (prev.includes(chatId)) return prev;
        return [chatId, ...prev];
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


    const handleNewMessage = (msg) => {
      addMessageToChat(msg.chatId, msg);
    };


    const handleCustomerNotification = (msg) => {
      const { chatId, content } = msg;


      setActiveChats((prev) => {
        const filtered = prev.filter((id) => id !== chatId);
        return [chatId, ...filtered];
      });


      if (selectedChatRef.current !== chatId) {
        showToast(`Tin nhắn mới từ #${chatId}: "${content}"`);


        addMessageToChat(chatId, msg);
      }


    };

    const onChatEnded = ({ chatId }) => {
      showToast(`Cuộc trò chuyện #${chatId} đã kết thúc.`);
      setActiveChats((prev) => prev.filter((id) => id !== chatId));


      setAllMessages((prev) => {
        const newState = { ...prev };
        delete newState[chatId];
        return newState;
      });

      if (selectedChatRef.current === chatId) {
        setSelectedChat(null);
      }
    };


    socket.on("newChat", onNewChat);
    socket.on("welcomeMessage", onWelcomeMessage);


    socket.on("newMessage", handleNewMessage);
    socket.on("customerMessage", handleCustomerNotification);

    socket.on("chatEnded", onChatEnded);


    return () => {
      socket.off("newChat", onNewChat);
      socket.off("welcomeMessage", onWelcomeMessage);
      socket.off("newMessage", handleNewMessage);
      socket.off("customerMessage", handleCustomerNotification);
      socket.off("chatEnded", onChatEnded);
    };
  }, []);


  const sendMessage = () => {
    if (!selectedChat || !input.trim()) return;
    const msg = {
      chatId: selectedChat,
      senderId: 0,
      role: "dispatcher",
      content: input.trim(),

    };

    socket.emit("sendMessage", msg);



    setInput("");
  };


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


  const currentMessages = selectedChat ? allMessages[selectedChat] || [] : [];

  return (
    <div className="relative flex h-[85vh] bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      {}
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

      {}
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
              {}
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
