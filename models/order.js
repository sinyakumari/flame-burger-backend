const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItemId: mongoose.Schema.Types.ObjectId,
  name: String,
  img: String,
  price: Number,
  quantity: Number,
  customization: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: Number,
    deliveryFee: Number,
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    finalAmount: Number,

    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    payment: {
      type: String,
      enum: ["cash", "card", "upi"],
      default: "cash",
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);