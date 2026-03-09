const jwt = require("jsonwebtoken");

/* ===============================
   PROTECT - Verify Token
================================= */
const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, "flame_secret_key");
        console.log("🔓 [AUTH] Token Verified for User:", decoded.id, "Role:", decoded.role);
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        console.log("🔒 [AUTH] Token Verification Failed:", error.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

/* ===============================
   ADMIN ONLY - Role Check
================================= */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role !== "admin") {
        console.log("⛔ [ADMIN] Access Denied. User Role:", req.user.role);
        return res.status(403).json({ message: "Access denied. Admin only." });
    }

    console.log("👑 [ADMIN] Access Granted");
    next();
};

module.exports = { protect, adminOnly };