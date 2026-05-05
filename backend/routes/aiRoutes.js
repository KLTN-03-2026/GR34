import express from "express";
import { askBot, getFaqSuggestions } from "../controllers/aiController.js";

const router = express.Router();
router.post("/ask", askBot);
router.get("/faq-suggestions", getFaqSuggestions);

export default router;
