import express from "express";

import {
  getWallet,
  getTransactions,
  depositMoney,
} from "../controllers/walletController.js";

const router = express.Router();


router.get("/:user_id", getWallet);


router.get("/transactions/:wallet_id", getTransactions);


router.post("/deposit", depositMoney);

export default router;
