import express from "express";
import multer from "multer";
import RestaurantController from "../controllers/RestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestaurantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  RestaurantController.getRestaurantOrders
);

router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  RestaurantController.updateOrderStatus
);

router.get("/", RestaurantController.getAllRestaurants);
router.get(
  "/user",
  jwtCheck,
  jwtParse,
  RestaurantController.getRestaurantsByUser
);
router.delete(
  "/:id",
  jwtCheck,
  jwtParse,
  RestaurantController.deleteRestaurant
);
router.post(
  "/",
  upload.single("imageFile"),
  validateRestaurantRequest,
  jwtCheck,
  jwtParse,
  RestaurantController.createRestaurant
);

router.put(
  "/:id",
  upload.single("imageFile"),
  validateRestaurantRequest,
  jwtCheck,
  jwtParse,
  RestaurantController.updateRestaurant
);

export default router;
