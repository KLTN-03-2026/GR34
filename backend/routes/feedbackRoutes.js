import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  deleteFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();


router.post("/", createFeedback);


router.get("/", getAllFeedbacks);


router.delete("/:id", deleteFeedback);

export default router;
