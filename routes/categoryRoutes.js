const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= CREATE UPLOAD FOLDER IF NOT EXISTS ================= */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ================= IMAGE UPLOAD CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });

    // Add full image URL
    const updatedCategories = categories.map((cat) => ({
      ...cat._doc,
      image: cat.image
        ? `http://localhost:3000/uploads/${cat.image}`
        : "",
    }));

    res.json(updatedCategories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

/* ================= CREATE ================= */

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const category = new Category({
      title,
      slug,
      description,
      image: req.file ? req.file.filename : "",
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

/* ================= UPDATE ================= */

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
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