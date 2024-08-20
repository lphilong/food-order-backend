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

    socket.on("joinRoom", ({ restaurantId }) => {
      const roomName = `${restaurantId}`;
      socket.join(roomName);
      console.log(`User joined room ${roomName}`);
    });

    socket.on("sendMessage", async ({ restaurantId, content, senderId }) => {
      const roomName = `${restaurantId}`;
      try {
        const message = new Message({
          restaurant: new mongoose.Types.ObjectId(restaurantId), // Use 'new'
          content,
          senderId,
        });
        await message.save();
        io.to(roomName).emit("newMessage", message);
        console.log(`Message sent in room ${roomName}: ${content}`);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      logActivity("A user disconnected");
    });
  });

  return server;
};

export default setupSocket;
