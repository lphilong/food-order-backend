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

router.get(
  "/restaurant/:restaurantId/with-user-info",
  jwtCheck,
  jwtParse,
  ChatController.getLastMessagesWithUserInfo
);

export default router;
