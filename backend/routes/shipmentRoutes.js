import express from "express";
import {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  assignShipment,
  getShipmentByCode,
  getShipmentByCodePublic,
  assignShipmentsBulk,
} from "../controllers/shipmentController.js";


import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();




router.get("/", verifyToken, getAllShipments);


router.get("/:id", verifyToken, getShipmentById);
router.post("/", verifyToken, createShipment);
router.put("/:id", verifyToken, updateShipment);
router.delete("/:id", verifyToken, deleteShipment);


router.post("/assign", verifyToken, assignShipment);
router.post("/assign-bulk", verifyToken, assignShipmentsBulk);


router.get("/track/:code", getShipmentByCode);
router.get("/code/:code", getShipmentByCodePublic);

export default router;
