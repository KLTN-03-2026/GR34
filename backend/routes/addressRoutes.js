import express from "express";
import * as addressController from "../controllers/addressController.js";

const router = express.Router();


router.get("/:customer_id", addressController.getAddresses);


router.post("/", addressController.createAddress);


router.put("/:id", addressController.updateAddress);


router.delete("/:id", addressController.deleteAddress);

export default router;
