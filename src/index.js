import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/productRoute.js'; // Correct import
import cartRoutes from './routes/cartRoute.js'; // Import cart routes
import cors from 'cors';
import dotenv from 'dotenv';
import { app, server } from './lib/socket.js'; // Correct import
import messageRoutes from './routes/message.route.js'; // Correct import

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,  
}));

app.use(cookieParser());
// Increase payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API routes for login/signup
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products/', productRoutes); // Use product routes for product creation
app.use('/api/cart', cartRoutes); // Use cart routes for cart-related operations
app.unsubscribe("/api/messages", messageRoutes); // Unsubscribe from cart routes

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});