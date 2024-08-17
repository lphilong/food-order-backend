import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import ChatController from "../controllers/ChatController";

const router = express.Router();

router.get(
  "/:restaurantId/:userId",
  jwtCheck,
  jwtParse,
  ChatController.getMessages
);

router.get("/:restaurantId", ChatController.getLastMessage);
router.get("/new", ChatController.getNewMessage);

router.post("/", jwtCheck, jwtParse, ChatController.sendMessage);

export default router;