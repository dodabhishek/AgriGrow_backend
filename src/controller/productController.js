import Product from "../models/product.model.js";
import productCloudinary from "../lib/productCloudinary.js"; // Import Cloudinary configuration

export const getAllProducts = async (req, res) => {
  try {
    // Fetch all products without any filters
    const products = await Product.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if the user is an admin
    if (authUser.role === "admin") {
      // Admin can only see their own products
      const products = await Product.find({ user: userId });
      return res.status(200).json({ success: true, products });
    }

    // Regular user can see all products
    const products = await Product.find();
    return res.status(200).json({ success: true, products });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const createProduct = async (req, res) => {
  console.log("Create product route hit");
  console.log("Request body:", req.body);

  try {
    const { name, description, price, user, image } = req.body;

    // Check if all required fields are provided
    if (!name || !description || !price || !user) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let imageUrl = null;

    // Upload image to Cloudinary if the image is provided
    if (image) {
      const uploadResponse = await productCloudinary.uploader.upload(image, {
        folder: "products", // Specify the folder in Cloudinary
      });
      console.log("Upload response:", uploadResponse);
      imageUrl = uploadResponse.secure_url; // Use the secure URL from Cloudinary
    }

    // Create the product in the database
    const product = await Product.create({
      name,
      description,
      price,
      imageUrl, // Only set imageUrl if the image was uploaded
      user,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  console.log("Update product route hit");
  const { name, description, price, imageUrl } = req.body;
  const { id } = req.params;

  try {
    // Check if the product exists
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optionally, check if the logged-in user is the owner of the product
    if (String(product.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    // Update the product details
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.imageUrl = imageUrl || product.imageUrl;

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("Delete product route hit");
  const { id } = req.params;

  try {
    // Check if the product exists
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optionally, check if the logged-in user is the owner of the product
    if (String(product.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    // Delete the product using findByIdAndDelete instead of remove()
    await Product.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
