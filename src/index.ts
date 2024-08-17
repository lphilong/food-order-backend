import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import UserRoute from "./routes/UserRoute";
import RestaurantRoute from "./routes/RestaurantRoute";
import SearchRoute from "./routes/SearchRoute";
import OrderRoute from "./routes/OrderRoute";
import ChatRoute from "./routes/ChatRoute";
import setupSocket from "./socket"; // Import the socket setup function

// Database connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"))
  .catch((error) => console.error("Database connection error:", error));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const PORT = parseInt(process.env.PORT as string);
app.use(cors());

app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/my/user", UserRoute);
app.use("/api/my/restaurant", RestaurantRoute);
app.use("/api/restaurant", SearchRoute);
app.use("/api/order", OrderRoute);
app.use("/api/chat", ChatRoute);

const server = setupSocket(app); // Set up Socket.IO with the app

server
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server startup error:", err);
  });
