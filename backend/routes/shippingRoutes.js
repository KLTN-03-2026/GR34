import express from "express";
import shippingController from "../controllers/shippingController.js";

const router = express.Router();

router.post("/calculate-fee", shippingController.calculateFee);

export default router;
