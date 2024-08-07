import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find();

    if (restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found" });
    }
    res.json(restaurants);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

//get restaurants by user
const getRestaurantsByUser = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({ user: req.userId }).populate(
      "user"
    );
    if (restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: "No restaurants found for this user" });
    }
    res.json(restaurants);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

//delete restaurant
const deleteRestaurant = async (req: Request, res: Response) => {
  const { id: restaurantId } = req.params;

  try {
    const deletedRestaurant = await Restaurant.findOneAndDelete({
      _id: restaurantId,
    });

    if (!deletedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //Delete image from cloudinary
    const { imagePublicId } = deletedRestaurant;
    if (imagePublicId) {
      await cloudinary.v2.uploader.destroy(imagePublicId);
    }

    // Delete associated orders
    await Order.deleteMany({ restaurant: restaurantId });

    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ message: "Error deleting restaurant" });
  }
};

//create restaurant
const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { file, body, userId } = req;
    const { imageUrl, publicId } = await uploadImage(
      file as Express.Multer.File
    );

    const restaurant = new Restaurant({
      ...body,
      imageUrl,
      imagePublicId: publicId,
      user: new mongoose.Types.ObjectId(userId),
      lastUpdated: new Date(),
    });

    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//update restaurant
const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId, body, file } = req;
    const { id: restaurantId } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      user: userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update restaurant fields
    Object.assign(restaurant, {
      restaurantName: body.restaurantName,
      city: body.city,
      country: body.country,
      deliveryPrice: body.deliveryPrice,
      estimatedDeliveryTime: body.estimatedDeliveryTime,
      cuisines: body.cuisines,
      menuItems: body.menuItems,
      lastUpdated: new Date(),
    });

    // Update image if a new file is provided
    if (file) {
      const { imageUrl, publicId } = await uploadImage(
        file as Express.Multer.File
      );
      restaurant.imageUrl = imageUrl;
      restaurant.imagePublicId = publicId;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
//get orders
const getRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({ user: req.userId });
    if (!restaurants) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

//update order status
const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return {
    imageUrl: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
  };
};

export default {
  updateOrderStatus,
  getRestaurantOrders,
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByUser,
};
