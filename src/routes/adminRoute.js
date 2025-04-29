import express from "express";
import { adminSignup } from "../controller/adminController.js";

const router = express.Router();

// Admin signup route
router.post("/signup", adminSignup);

export default router;