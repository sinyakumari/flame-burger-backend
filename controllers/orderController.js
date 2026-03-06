const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const MenuItem = require("../models/menuItems");

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

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let discountAmount = 0;
    let finalAmount = totalAmount + 5;

    if (couponCode) {
      const Coupon = require("../models/coupon");
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (coupon) {
        const now = new Date();

        if (
          now <= new Date(coupon.expiryDate) &&
          coupon.usedCount < coupon.usageLimit &&
          totalAmount >= coupon.minOrderAmount
        ) {
          if (coupon.discountType === "percentage") {
            discountAmount = (totalAmount * coupon.discountValue) / 100;

            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }

          if (discountAmount > totalAmount) discountAmount = totalAmount;

          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    finalAmount = totalAmount - discountAmount + 5;

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

    const validStatuses = ["Pending", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

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
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};

/* ===============================
   ADMIN: GET DASHBOARD STATS
=============================== */
exports.getOrderStatsAdmin = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalMenuItems = await MenuItem.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const ordersData = { Pending: 0, Completed: 0, Cancelled: 0 };

    statusCounts.forEach((sc) => {
      if (ordersData[sc._id] !== undefined) {
        ordersData[sc._id] = sc.count;
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyRevenueAgg = await Order.aggregate([
      { $match: { status: "Completed", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const userGrowthAgg = await User.aggregate([
      { $match: { createdAt: { $gte: fiveMonthsAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalMenuItems,
      ordersData: [
        ordersData.Pending,
        ordersData.Completed,
        ordersData.Cancelled,
      ],
      weeklyRevenue: weeklyRevenueAgg,
      userGrowth: userGrowthAgg,
    });
  } catch (error) {
    console.error("Order Stats Error:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};