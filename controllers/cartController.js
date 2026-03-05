const Cart = require("../models/cart");

/* ===============================
   GET CART
=============================== */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   ADD TO CART
=============================== */
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, name, img, price, customization } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.menuItemId.toString() === menuItemId &&
        item.customization === customization
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        menuItemId,
        name,
        img,
        price,
        customization,
        quantity: 1,
      });
    }

    await cart.save();

    res.json({ message: "Item added to cart" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   REMOVE FROM CART
=============================== */
exports.removeFromCart = async (req, res) => {
  try {
    const { menuItemId, customization } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) =>
        item.menuItemId.toString() === menuItemId &&
        item.customization === customization
    );

    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items = cart.items.filter(
        (i) =>
          !(
            i.menuItemId.toString() === menuItemId &&
            i.customization === customization
          )
      );
    }

    await cart.save();

    res.json({ message: "Item removed" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};