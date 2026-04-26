import express from "express";
import {
  getDriverNotifications,
  getDispatcherNotifications,
  getCustomerNotifications,
  markNotificationRead,
  markAllCustomerRead,
} from "../controllers/notificationController.js";

const router = express.Router();


router.get("/driver/:id", getDriverNotifications);


router.get("/dispatcher/:id", getDispatcherNotifications);


router.get("/customer/:id", getCustomerNotifications);


router.put("/:id/read", markNotificationRead);


router.put("/customer/:id/read-all", markAllCustomerRead);

export default router;
