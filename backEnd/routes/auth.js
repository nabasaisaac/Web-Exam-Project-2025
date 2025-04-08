const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");
const { register, login } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    // Get user from request (already verified by auth middleware)
    const user = req.user;

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    // Format user data based on role
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role || (user.username ? "manager" : "babysitter"),
      firstName: user.first_name || user.username,
      lastName: user.last_name || "",
      username: user.username || null,
    };

    res.json(userData);
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

module.exports = router;
