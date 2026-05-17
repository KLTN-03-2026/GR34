import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";

// Tiện ích quản lý chat
export function useChat() {
  return useContext(ChatContext);
}
