import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../hooks/useChat";

import FloatingActions from "./FloatingActions";
import ChatPopupTop from "./ChatPopupTop";
import ChatBubble from "./ChatBubble";

export default function ChatLayout() {

  const { isOpen, activeTab, closeChat } = useChat();


  const [activeChats, setActiveChats] = useState([]);


  const handleOpenChat = (type) => {
    const isAlreadyOpen = activeChats.find((chat) => chat === type);
    if (!isAlreadyOpen) {
      setActiveChats((prev) => [...prev, type]);
    }
  };


  const handleCloseChat = (type) => {
    setActiveChats((prev) => prev.filter((chat) => chat !== type));


    closeChat();
  };


  useEffect(() => {
    if (isOpen) {
      if (activeTab === "ai") {
        handleOpenChat("bot");
      } else if (activeTab === "support") {
        handleOpenChat("support");
      }
    }
  }, [isOpen, activeTab]);

  return (
    <div className="relative z-[9999]">
      <div className="fixed bottom-0 right-32 flex items-end gap-4 z-[9990] pointer-events-none px-4">
        <AnimatePresence mode="popLayout">
          {activeChats.map((type) => (
            <motion.div
              key={type}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.9,
                transition: { duration: 0.2 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              {type === "bot" && (
                <div className="mb-4">
                  <ChatPopupTop onClose={() => handleCloseChat("bot")} />
                </div>
              )}

              {type === "support" && (
                <div className="mb-4">
                  <ChatBubble onClose={() => handleCloseChat("support")} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Phần giao diện */}

      <FloatingActions
        onOpenChatTop={() => handleOpenChat("bot")}
        onOpenChatBubble={() => handleOpenChat("support")}
      />
    </div>
  );
}