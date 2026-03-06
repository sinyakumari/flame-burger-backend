console.log("MENU ROUTE LOADED");

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Category = require("../models/category");
const MenuItem = require("../models/menuItems");
const { protect, adminOnly } = require("../middleware/authMiddleware");

/* ======================================================
   MULTER CONFIG — save to assets/menu/
====================================================== */
const menuUploadDir = path.join(__dirname, "..", "assets", "menu");
if (!fs.existsSync(menuUploadDir)) {
  fs.mkdirSync(menuUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, menuUploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* ======================================================
   DEBUG LOGGER (VERY IMPORTANT)
====================================================== */
router.use((req, res, next) => {
  console.log("🔥 MENU ROUTE HIT:", req.method, req.originalUrl);
  next();
});

/* ======================================================
   CHECK ROUTE
====================================================== */
router.get("/check", (req, res) => {
  res.json({ message: "MENU CHECK WORKING" });
});

/* ======================================================
   ADD MENU ITEM (ADMIN ONLY)
====================================================== */
router.post("/add-item", protect, adminOnly, upload.single("imageFile"), async (req, res) => {
  try {
    console.log("ADMIN ADD ITEM HIT");

    const { name, price, desc, imageUrl, categoryTitle } = req.body;

    // File upload takes priority over URL
    let img;
    if (req.file) {
      img = "/assets/menu/" + req.file.filename;
    } else {
      img = imageUrl || "";
    }

    const category = await Category.findOne({ title: categoryTitle });

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newItem = new MenuItem({
      name,
      price,
      desc,
      img,
      category: category._id
    });

    await newItem.save();

    res.status(201).json({
      message: "Item added successfully",
      item: newItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   UPDATE MENU ITEM (ADMIN ONLY)
====================================================== */
router.put("/:id", protect, adminOnly, upload.single("imageFile"), async (req, res) => {
  try {
    console.log("UPDATE ROUTE HIT");

    const { name, price, desc, imageUrl, categoryTitle } = req.body;

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Optional category update
    if (categoryTitle) {
      const category = await Category.findOne({ title: categoryTitle });

      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }

      item.category = category._id;
    }

    // File upload takes priority over URL; keep existing if neither provided
    if (req.file) {
      item.img = "/assets/menu/" + req.file.filename;
    } else if (imageUrl !== undefined && imageUrl !== "") {
      item.img = imageUrl;
    }
    // else: keep existing item.img

    item.name = name ?? item.name;
    item.price = price ?? item.price;
    item.desc = desc ?? item.desc;

    await item.save();

    res.json({ message: "Item updated successfully", item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   DELETE MENU ITEM (ADMIN ONLY)
====================================================== */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    console.log("DELETE ROUTE HIT");

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   GET MENU (PUBLIC) - KEEP THIS LAST
====================================================== */
router.get("/", async (req, res) => {
  try {
    console.log("GET MENU HIT");
    console.log("QUERY:", req.query);

    const { categoryTitle } = req.query;

    let filter = {};

    if (categoryTitle) {
      const category = await Category.findOne({ title: categoryTitle });

      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }

      filter.category = category._id;
    }

    const menu = await MenuItem.find(filter).populate("category");

    res.json(menu);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;