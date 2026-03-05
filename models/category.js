const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);