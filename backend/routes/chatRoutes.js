import express from "express";
import {
  startChat,
  getChats,
  getClosedChats,
  getMessages,
  endChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChats);
router.get("/closed", getClosedChats);
router.post("/start", startChat);
router.get("/:chatId/messages", getMessages);
router.put("/:chatId/end", endChat);

export default router;
