import { Server } from "socket.io";
import { createServer } from "http";
import Message from "./models/message";

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

    socket.on("joinRoom", ({ userId, restaurantId }) => {
      const roomName = `${userId}_${restaurantId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    });

    socket.on("sendMessage", async (data) => {
      const { userId, restaurantId, content, senderId } = data;
      const roomName = `${userId}_${restaurantId}`;
      try {
        const message = new Message({
          user: userId,
          restaurant: restaurantId,
          content,
          senderId: senderId,
        });
        await message.save();
        io.to(roomName).emit("newMessage", message);
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
