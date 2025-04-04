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
const bcrypt = require("bcryptjs");
const { auth } = require("../middleware/auth");

// Register a new user
router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["manager", "babysitter"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // Check if user already exists by email only
      const existingUserByEmail = await findUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create new user (password will be hashed in the model)
      const userId = await createUser({
        username,
        email,
        password,
        role,
        isActive: true,
      });

      // Generate token
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: userId,
          username,
          email,
          role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    body("email").trim().notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log("Attempting login for email:", email);

      // Find user by email
      const user = await findUserByEmail(email);
      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        console.log("User not found in database");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.is_active) {
        console.log("User account is inactive");
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Check password
      console.log("Comparing passwords...");
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        console.log("Password does not match");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await updateUserLastLogin(user.id);

      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ message: "Error logging in", error: error.message });
    }
  }
);

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
