console.log("AUTH ROUTES FILE LOADED");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

       const { password: _, ...userWithoutPassword } = user._doc;

res.status(201).json({
    message: "User registered successfully",
    user: userWithoutPassword
});

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            "flame_secret_key",
            { expiresIn: "7d" }
        );

        const { password: _, ...userWithoutPassword } = user._doc;

        res.json({
            message: "Login successful",
            token,
            user: userWithoutPassword   // ✅ IMPORTANT
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN GET USERS
router.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching users" });
    }
});

module.exports = router;