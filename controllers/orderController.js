const Order = require("../models/order");
const Cart = require("../models/cart");

/* ===============================
   PLACE ORDER
=============================== */
exports.placeOrder = async (req, res) => {
  try {
    const { name, address, payment } = req.body;

    if (!name || !address || !payment) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create order
    const newOrder = new Order({
      user: req.user.id,
      items: cart.items,
      name,
      address,
      payment,
      totalAmount,
    });

    await newOrder.save();

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      message: "Server error while placing order",
    });
  }
};