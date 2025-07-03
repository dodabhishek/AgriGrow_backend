import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../lib/utils.js';

// Admin signup controller
export const adminSignup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, email } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin user
        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            email,
            role: 'admin', // Set role as admin
            gender: 'unspecified'
        });

        if (newUser) {
            // Generate JWT token
            generateTokenAndSetCookie(newUser._id, res);
            
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            });
        } else {
            res.status(400).json({ error: "Invalid admin data" });
        }

    } catch (error) {
        console.log("Error in admin signup controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.status(200).json(users);
    } catch (error) {
        console.log("Error in get all users controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in get user by id controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!['user', 'moderator'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: "Cannot modify admin role" });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: "User role updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.log("Error in update user role controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: "Cannot delete admin user" });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log("Error in delete user controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const newUsersToday = await User.countDocuments({
            role: { $ne: 'admin' },
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        });

        res.status(200).json({
            totalUsers,
            newUsersToday
        });
    } catch (error) {
        console.log("Error in get dashboard stats controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}; 