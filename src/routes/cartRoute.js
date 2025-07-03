import express from "express";
import { addToCart, getCart, updateCartProduct } from "../controller/cartController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/", protectRoute, getCart);
router.put("/update", protectRoute, updateCartProduct);

export default router;
