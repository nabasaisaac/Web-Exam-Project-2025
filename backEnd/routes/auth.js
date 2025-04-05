const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const {
  findUserByUsername,
  findUserByEmail,
  createUser,
  updateUserLastLogin,
} = require("../models/User");
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
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

module.exports = router;
