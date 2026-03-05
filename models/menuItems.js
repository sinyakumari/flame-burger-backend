const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  desc: String,
  img: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
});

module.exports = mongoose.model("MenuItem", menuItemSchema);