import express from "express";
import {
  getWebhook,
  handleMessage,
  send,
} from "../controllers/message.controller.js";

const router = express.Router();

let initWebRoutes = (app) => {
  router.post("/webhook", handleMessage);
  router.get("/webhook", getWebhook);
  router.post("/send", send);

  return app.use("/", router);
};

export default initWebRoutes;
