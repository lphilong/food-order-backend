import { Request, Response } from "express";
import Message from "../models/message";
import mongoose from "mongoose";

const getMessages = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  try {
    const messages = await Message.find({
      restaurant: restaurantId,
    }).populate("restaurant");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error getting message" });
  }
};

const getLastMessage = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  try {
    const lastMessages = await Message.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$user", lastMessage: { $first: "$$ROOT" } } },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);
    res.status(200).json(lastMessages);
  } catch (error) {
    res.status(500).json({ message: "Error getting message" });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  const { restaurantId, content, senderId } = req.body;
  try {
    const message = new Message({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      content,
      senderId,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};
export default {
  getMessages,
  getLastMessage,
  sendMessage,
};
