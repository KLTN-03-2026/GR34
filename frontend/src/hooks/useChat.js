import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";

export function useChat() {
  return useContext(ChatContext);
}
