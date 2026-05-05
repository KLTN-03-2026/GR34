import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";

// Hook quản lý chat
export function useChat() {
  return useContext(ChatContext);
}
