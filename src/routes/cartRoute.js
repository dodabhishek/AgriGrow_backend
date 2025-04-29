import express from "express";
import { addToCart, getCart, updateCartProduct } from "../controller/cartController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route to add a product to the cart
router.post("/", protectRoute, addToCart);

// Route to get the user's cart
router.get("/", protectRoute, getCart);

// Route to update a product in the cart
router.put("/update", protectRoute, updateCartProduct);

export default router;