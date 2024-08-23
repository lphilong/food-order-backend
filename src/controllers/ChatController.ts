import { Request, Response } from "express";
import Message from "../models/message";
import mongoose from "mongoose";

const getMessages = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { userId } = req.params;

    const messages = await Message.find({
      restaurant: restaurantId,
      user: userId,
    })
      .populate("restaurant")
      .populate("user");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error getting message" });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  const { userId, restaurantId, content, senderId } = req.body;
  try {
    const message = new Message({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      user: new mongoose.Types.ObjectId(userId),
      content,
      senderId,
    });
    console.log(message);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};
export default {
  getMessages,
  sendMessage,
};
