import { createContext, useState, useContext } from "react";


export const ChatContext = createContext(null);


// Hook quản lý chat
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }) {

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");

  const value = {
    isOpen,
    activeTab,
    setActiveTab,


    openAIChat: () => {
      setActiveTab("ai");
      setIsOpen(true);
    },


    openSupportChat: () => {
      setActiveTab("support");
      setIsOpen(true);
    },


    closeChat: () => setIsOpen(false),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
