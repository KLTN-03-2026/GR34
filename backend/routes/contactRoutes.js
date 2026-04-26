import express from "express";
import {
  createContact,
  getAllContacts,
  assignDispatcher,
  updateContactStatus,
  getContactsByDispatcher,
} from "../controllers/contactController.js";

const router = express.Router();


router.post("/", createContact);


router.get("/", getAllContacts);


router.patch("/:id/assign", assignDispatcher);


router.get("/dispatcher/:dispatcher_id", getContactsByDispatcher);


router.patch("/:id/status", updateContactStatus);

export default router;
