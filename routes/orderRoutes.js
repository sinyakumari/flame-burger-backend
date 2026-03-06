const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { 
  placeOrder, 
  getAllOrdersAdmin, 
  updateOrderStatusAdmin, 
  getOrderStatsAdmin 
} = require("../controllers/orderController");

const router = express.Router();

router.post("/place", protect, placeOrder);

// Admin Routes
router.get("/admin", protect, adminOnly, getAllOrdersAdmin);
router.get("/admin/stats", protect, adminOnly, getOrderStatsAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;