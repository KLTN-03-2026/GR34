import express from "express";
import {
  getAllPayments,
  createPayment,
  createMomoPayment,
  createWalletDepositMomo,
  momoIPN,
  updatePaymentStatus,
  deletePayment,
  payShipmentByWallet,
} from "../controllers/paymentController.js";

const router = express.Router();


router.get("/", getAllPayments);


router.post("/", createPayment);


router.put("/:id", updatePaymentStatus);


router.delete("/:id", deletePayment);




router.post("/momo", createMomoPayment);


router.post("/momo-deposit", createWalletDepositMomo);


router.post("/momo/callback", momoIPN);


router.post("/wallet-pay", payShipmentByWallet);

export default router;
