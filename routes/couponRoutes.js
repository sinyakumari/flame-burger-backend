const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
console.log("🎫 [COUPON_ROUTES] LOADED V5.0");

router.get("/health", (req, res) => res.json({ status: "Coupons API OK" }));

// Validation during checkout (publicly accessible but usually needs auth context)
router.post("/validate", couponController.validateCoupon);

// Admin Routes
router.get("/", couponController.getAllCoupons);
router.post("/", couponController.createCoupon);

// Redundant but explicit paths for debugging
router.post("/create", couponController.createCoupon);
router.get("/all", couponController.getAllCoupons);

router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
