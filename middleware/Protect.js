const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(404).json({ message: "Page not found" });
    }

    try {
        const decoded = jwt.verify(token, "flame_secret_key");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(404).json({ message: "Page not found" });
    }
};

module.exports = protect;