import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import ChatController from "../controllers/ChatController";

const router = express.Router();

router.get("/:restaurantId", jwtCheck, jwtParse, ChatController.getMessages);

router.get("/last/:restaurantId", ChatController.getLastMessage);

router.post("/", jwtCheck, jwtParse, ChatController.sendMessage);

export default router;
