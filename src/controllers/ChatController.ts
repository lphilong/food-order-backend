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

    const limitNumber = parseInt(limit, 10);
    if (isNaN(limitNumber)) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }

    const beforeDate = before ? new Date(before) : null;

    const query: any = {
      restaurant: restaurantId,
      user: userId,
    };

    if (beforeDate && !isNaN(beforeDate.getTime())) {
      query.createdAt = { $lt: beforeDate };
    }

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

export default {
  getMessages,
  getLastMessagesWithUserInfo,
};
