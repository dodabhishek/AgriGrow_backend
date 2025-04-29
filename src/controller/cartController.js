import User from "../models/user.model.js";

// Add product to cart
export const addToCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingProduct = user.cart.find((item) => item.productId.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    res.status(500).json({ message: "Failed to add product to cart" });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const updateCartProduct = async (req, res) => {
    const { userId, productId, quantity } = req.body;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const productInCart = user.cart.find((item) => item.productId.toString() === productId);
  
      if (!productInCart) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
  
      // Update the quantity if provided
      if (quantity !== undefined) {
        if (quantity <= 0) {
          // Remove the product if quantity is 0 or less
          user.cart = user.cart.filter((item) => item.productId.toString() !== productId);
        } else {
          productInCart.quantity = quantity;
        }
      }
  
      await user.save();
  
      res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
    } catch (error) {
      console.error("Error updating cart product:", error.message);
      res.status(500).json({ message: "Failed to update cart product" });
    }
  };