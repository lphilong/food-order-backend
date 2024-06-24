import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: ObjectId,
  auth0ID: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
});

const User = mongoose.model("USER", userSchema);
export default User;
