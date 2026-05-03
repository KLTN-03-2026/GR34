import express from "express";
import {
  startChat,
  getMessages,
  endChat,
} from "../controllers/chatController.js";

const router = express.Router();


router.post("/start", startChat);


router.get("/:chatId/messages", getMessages);


router.put("/:chatId/end", endChat);

export default router;
