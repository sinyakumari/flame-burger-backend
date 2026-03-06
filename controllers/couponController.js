const Coupon = require("../models/coupon");

/* ===============================
   ADMIN: CREATE COUPON
   =============================== */
exports.createCoupon = async (req, res) => {
  console.log("⚡ [COUPON_CONTROLLER] ATTEMPTING CREATE V5.0 - DATA:", req.body);
  try {
    const { 
      code, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      maxDiscount, 
      usageLimit, 
      expiryDate, 
      isActive 
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiryDate,
      isActive,
    });

    await newCoupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ message: "Server error while creating coupon" });
  }
};

/* ===============================
   ADMIN: GET ALL COUPONS
   =============================== */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error("Fetch Coupons Error:", error);
    res.status(500).json({ message: "Server error while fetching coupons" });
  }
};

/* ===============================
   ADMIN: UPDATE COUPON
   =============================== */
exports.updateCoupon = async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon updated successfully", coupon: updatedCoupon });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({ message: "Server error while updating coupon" });
  }
};

/* ===============================
   ADMIN: DELETE COUPON
   =============================== */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    res.status(500).json({ message: "Server error while deleting coupon" });
  }
};

/* ===============================
   CHECKOUT: VALIDATE COUPON
   =============================== */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon code" });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > cartTotal) discountAmount = cartTotal;

    res.json({
      message: "Coupon applied successfully",
      discountAmount,
      couponCode: coupon.code
    });

  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: "Server error while validating coupon" });
  }
};
