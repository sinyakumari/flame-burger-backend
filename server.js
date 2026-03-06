console.log("💎💎💎 FLAME BACKEND V9.0 - SYNCED ON PORT 3010 💎💎💎");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const menuRoutes = require("./routes/menuRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* 🔍 GLOBAL LOGGER FOR DEBUGGING */
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

/* ✅ SERVE UPLOADED IMAGES */
app.use("/uploads", express.static("uploads"));
app.use("/assets/menu", express.static("assets/menu"));

/* -------------------- MONGODB -------------------- */
mongoose
  .connect("mongodb://127.0.0.1:27017/flameburger")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) =>
    console.log("❌ MongoDB Connection Failed:", err)
  );

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customization", customizationRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

/* -------------------- DEBUG -------------------- */
app.get("/debug", (req, res) => {
  res.json({ message: "DEBUG WORKING ✅" });
});

/* -------------------- ROOT -------------------- */
app.get("/", (req, res) => {
  res.send("Flame Burger Backend Running");
});

/* -------------------- GLOBAL 404 -------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Page not found" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});