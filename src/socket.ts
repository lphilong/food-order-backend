import { Server } from "socket.io";
import { createServer } from "http";
import Message from "./models/message";
import mongoose from "mongoose";

const setupSocket = (app: any) => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  const logActivity = (activity: string) => {
    console.log(`[${new Date().toISOString()}] ${activity}`);
  };
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("joinRoom", async ({ restaurantId, userId }) => {
      const roomName = `${restaurantId}_${userId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    });

    //show typing
    socket.on("userTyping", ({ restaurantId, userId }) => {
      const roomName = `${restaurantId}_${userId}`;
      socket.to(roomName).emit("typing", { userId });
    });

    //send message
    socket.on(
      "sendMessage",
      async ({ userId, restaurantId, content, senderId }) => {
        const roomName = `${restaurantId}_${userId}`;
        try {
          const message = new Message({
            restaurant: new mongoose.Types.ObjectId(restaurantId),
            user: new mongoose.Types.ObjectId(userId),
            content,
            senderId,
          });
          await message.save();

          io.to(roomName).emit("newMessage", message);
          io.to(roomName).emit("messageSent", { messageId: message._id });
          console.log(`Message sent in room ${roomName}: ${content}`);
        } catch (error) {
          console.error("Error saving message:", error);
          io.to(roomName).emit("sendMessageError", {
            error: "Failed to send message",
            content,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      logActivity("A user disconnected");
    });
  });

  return server;
};

export default setupSocket;
