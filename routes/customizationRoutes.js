const express = require("express");
const router = express.Router();

const Customization = require("../models/customization");
const Category = require("../models/category");
const { protect, adminOnly } = require("../middleware/authMiddleware");

/* ----------------------------------
   GET ALL CUSTOMIZATIONS (PUBLIC)
---------------------------------- */
router.get("/", async (req, res) => {
  try {
    const customizations = await Customization.find({ isActive: true }).populate("category", "title");
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ----------------------------------
   GET CUSTOMIZATIONS BY CATEGORY (PUBLIC)
---------------------------------- */
router.get("/:categoryTitle", async (req, res) => {
  try {
    const { categoryTitle } = req.params;

    const category = await Category.findOne({ title: categoryTitle });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const customizations = await Customization.find({
      category: category._id
    });

    res.json(customizations);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ----------------------------------
   ADD CUSTOMIZATION (ADMIN ONLY)
---------------------------------- */
router.post("/add", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, categoryTitle } = req.body;

    const category = await Category.findOne({ title: categoryTitle });

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newCustomization = new Customization({
      name,
      price,
      category: category._id
    });

    await newCustomization.save();

    res.status(201).json({
      message: "Customization added successfully",
      customization: newCustomization
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ----------------------------------
   UPDATE CUSTOMIZATION (ADMIN ONLY)
---------------------------------- */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, isActive } = req.body;
    const updatedCustomization = await Customization.findByIdAndUpdate(
      req.params.id,
      { name, price, isActive },
      { new: true }
    );

    if (!updatedCustomization) {
      return res.status(404).json({ message: "Customization not found" });
    }

    res.json({
      message: "Customization updated successfully",
      customization: updatedCustomization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ----------------------------------
   DELETE CUSTOMIZATION (ADMIN ONLY)
---------------------------------- */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deletedCustomization = await Customization.findByIdAndDelete(req.params.id);

    if (!deletedCustomization) {
      return res.status(404).json({ message: "Customization not found" });
    }

    res.json({ message: "Customization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;