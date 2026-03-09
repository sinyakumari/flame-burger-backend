const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET ADMIN PROFILE
router.get("/profile", protect, adminOnly, async (req, res) => {
    try {
        console.log("🔍 [DEBUG] req.user:", req.user);
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            console.log("❌ [DEBUG] User not found in DB for ID:", req.user.id);
            return res.status(404).json({ message: "Admin profile not found in database" });
        }
        
        console.log("✅ [DEBUG] User Found:", user.name);
        res.json(user);
    } catch (error) {
        console.error("❌ PROFILE GET ERROR:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
});

// UPDATE ADMIN PROFILE
router.put("/profile", protect, adminOnly, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        const updatedUser = await user.save();
        const { password, ...userWithoutPassword } = updatedUser._doc;

        res.json({
            message: "Profile updated successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already in use" });
        }
        console.error("❌ PROFILE UPDATE ERROR:", error);
        res.status(500).json({ message: "Server error updating profile" });
    }
});

// UPDATE ADMIN PASSWORD
router.put("/profile/password", protect, adminOnly, async (req, res) => {
    console.log("🎯 [ADMIN_ROUTES] Password Update Route Hit!");
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("❌ PASSWORD UPDATE ERROR:", error);
        res.status(500).json({ message: "Server error updating password" });
    }
});

module.exports = router;
