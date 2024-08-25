import { Request, Response } from "express";
import Message from "../models/message";
import mongoose from "mongoose";

//get all messages
const getMessages = async (req: Request, res: Response) => {
  try {
    const { restaurantId, userId } = req.params;
    const { limit = "20", before = null } = req.query as {
      limit?: string;
      before?: string | null;
    };

    // Convert 'limit' to number
    const limitNumber = Number(limit);

    // Convert 'before' to a Date if it's a string
    const beforeDate = before ? new Date(before) : null;

    // Define the query object with appropriate types
    const query: any = {
      restaurant: restaurantId,
      user: userId,
    };

    // If 'before' is provided, add the 'createdAt' filter
    if (beforeDate) {
      query.createdAt = { $lt: beforeDate };
    }

    // Fetch messages with the query
    const messages = await Message.find(query)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .populate("restaurant")
      .populate("user");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Error getting messages" });
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
