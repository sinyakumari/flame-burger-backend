console.log("CHECKOUT ROUTES FILE LOADED");
const express = require("express");
const protect = require("../middleware/Protect");

const router = express.Router();

// Protected route
router.get("/", protect, (req, res) => {
  res.json({
    message: "Checkout access granted",
    user: req.user
  });
});

module.exports = router;