const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//middleware
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "No token provided" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    res.status(400).json({ message: ` admin error :` });
  }
};

module.exports = { protect, isAdmin };
