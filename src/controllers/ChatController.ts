import { Request, Response } from "express";
import Message from "../models/message";
import mongoose from "mongoose";

//get all messages
const getMessages = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { userId } = req.params;

    const messages = await Message.find({
      restaurant: restaurantId,
      user: userId,
    })
      .limit(20)
      .populate("restaurant")
      .sort({ createdAt: -1 })
      .populate("user");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error getting message" });
  }
};

//get message isn't read
const getUnreadMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.find({ read: false })
      .sort({ createdAt: -1 })
      .populate("restaurant");
    res.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//get last message with user info
const getLastMessagesWithUserInfo = async (req: Request, res: Response) => {
  const restaurantId = req.params.restaurantId;

  try {
    const lastMessages = await Message.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { user: "$user" },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
    ]);
    res.json(lastMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//send message
const sendMessage = async (req: Request, res: Response) => {
  const { userId, restaurantId, content, senderId } = req.body;
  try {
    const message = new Message({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      user: new mongoose.Types.ObjectId(userId),
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
  sendMessage,
  getLastMessagesWithUserInfo,
  getUnreadMessage,
};
