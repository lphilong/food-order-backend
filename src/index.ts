import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import UserRoute from "./routes/UserRoute";
import { v2 as cloudinary } from "cloudinary";
import RestaurantRoute from "./routes/RestaurantRoute";
import SearchRoute from "./routes/SearchRoute";
import OrderRoute from "./routes/OrderRoute";
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server started on ${PORT}`);
});
