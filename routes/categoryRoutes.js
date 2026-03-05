const express = require("express");
const router = express.Router();
const Category = require("../models/category");

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

/* ================= CREATE ================= */
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const category = new Category({
      title,
      slug,
      description,
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

module.exports = router;