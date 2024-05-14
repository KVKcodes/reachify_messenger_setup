import express from "express";
import {
  getWebhook,
  handleMessage,
  send,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/webhook", handleMessage);
router.get("/webhook", getWebhook);
router.post("/send", send);

module.exports = router;
