const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  img: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  customization: {
    type: String,
    default: ""
  }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);