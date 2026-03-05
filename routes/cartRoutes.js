console.log("CART FILE LOADED");

const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const { protect } = require("../middleware/authMiddleware");

/* =====================================================
   GET USER CART
===================================================== */
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.json([]); // return empty array
    }

    res.json(cart.items); // 🔥 return only items array

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =====================================================
   ADD TO CART
===================================================== */
router.post("/add", protect, async (req, res) => {
  try {
    const { menuItemId, name, img, price, customization } = req.body;

    if (!menuItemId || !name || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item =>
        item.menuItem.toString() === menuItemId &&
        (item.customization || "") === (customization || "")
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        name,
        img,
        price,
        customization: customization || "",
        quantity: 1
      });
    }

    await cart.save();

    res.status(201).json({
      message: "Item added",
      items: cart.items
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =====================================================
   REMOVE / DECREASE FROM CART
===================================================== */
router.post("/remove", protect, async (req, res) => {
  try {
    const { menuItemId, customization } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item =>
        item.menuItem.toString() === menuItemId &&
        (item.customization || "") === (customization || "")
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();

    res.json({
      message: "Item updated",
      items: cart.items
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;