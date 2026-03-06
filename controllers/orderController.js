const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");

/* ===============================
   PLACE ORDER
=============================== */
exports.placeOrder = async (req, res) => {
  try {
    const { name, address, payment, couponCode } = req.body;

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

    // Coupon Logic
    let discountAmount = 0;
    let finalAmount = totalAmount + 5; // Default delivery fee is 5

    if (couponCode) {
      const Coupon = require("../models/coupon");
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      
      if (coupon) {
        const now = new Date();
        if (now <= new Date(coupon.expiryDate) && 
            coupon.usedCount < coupon.usageLimit && 
            totalAmount >= coupon.minOrderAmount) {
          
          if (coupon.discountType === "percentage") {
            discountAmount = (totalAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }

          if (discountAmount > totalAmount) discountAmount = totalAmount;
          
          // Increment usedCount
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    finalAmount = (totalAmount - discountAmount) + 5;

    // Create order
    const newOrder = new Order({
      user: req.user.id,
      items: cart.items,
      name,
      address,
      payment,
      totalAmount,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode.toUpperCase() : null,
      finalAmount,
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

/* ===============================
   ADMIN: GET ALL ORDERS
=============================== */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

/* ===============================
   ADMIN: UPDATE ORDER STATUS
=============================== */
exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};

/* ===============================
   ADMIN: GET ORDER STATS
=============================== */
exports.getOrderStatsAdmin = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const totalUsers = await User.countDocuments();

    res.json({
      totalOrders,
      totalRevenue,
      totalUsers
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};