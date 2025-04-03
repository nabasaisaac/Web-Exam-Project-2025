const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const Child = require("../models/Child");
const Attendance = require("../models/Attendance");
const IncidentReport = require("../models/IncidentReport");
const FinancialTransaction = require("../models/FinancialTransaction");

// Get all children
router.get("/", auth, async (req, res) => {
  try {
    const children = await Child.find({ isActive: true }).populate(
      "assignedBabysitter",
      "firstName lastName"
    );
    res.json(children);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching children", error: error.message });
  }
});

// Register a new child
router.post(
  "/",
  [
    auth,
    authorize("manager"),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Child's full name is required"),
    body("age").isInt({ min: 0 }).withMessage("Age must be a positive number"),
    body("parentDetails.fullName")
      .trim()
      .notEmpty()
      .withMessage("Parent's full name is required"),
    body("parentDetails.phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Parent's phone number is required"),
    body("parentDetails.email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("sessionType")
      .isIn(["half-day", "full-day"])
      .withMessage("Invalid session type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const child = new Child(req.body);
      await child.save();

      res.status(201).json({
        message: "Child registered successfully",
        child,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error registering child", error: error.message });
    }
  }
);

// Get child by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate(
      "assignedBabysitter",
      "firstName lastName"
    );

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
    res.json(child);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching child", error: error.message });
  }
});

// Update child
router.put(
  "/:id",
  [
    auth,
    authorize("manager"),
    body("fullName").optional().trim().notEmpty(),
    body("age").optional().isInt({ min: 0 }),
    body("parentDetails.fullName").optional().trim().notEmpty(),
    body("parentDetails.phoneNumber").optional().trim().notEmpty(),
    body("parentDetails.email").optional().isEmail(),
    body("sessionType").optional().isIn(["half-day", "full-day"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const child = await Child.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      res.json({
        message: "Child updated successfully",
        child,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating child", error: error.message });
    }
  }
);

// Delete child (soft delete)
router.delete("/:id", [auth, authorize("manager")], async (req, res) => {
  try {
    const child = await Child.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.json({ message: "Child deactivated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deactivating child", error: error.message });
  }
});

// Get child's attendance history
router.get("/:id/attendance", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      "children.child": req.params.id,
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance history",
      error: error.message,
    });
  }
});

// Get child's incident reports
router.get("/:id/incidents", auth, async (req, res) => {
  try {
    const incidents = await IncidentReport.find({
      child: req.params.id,
    }).sort({ date: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching incident reports",
      error: error.message,
    });
  }
});

// Get child's payment history
router.get("/:id/payments", auth, async (req, res) => {
  try {
    const payments = await FinancialTransaction.find({
      reference: req.params.id,
      referenceModel: "Child",
      type: "income",
      category: "daycare-fees",
    }).sort({ date: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
});

module.exports = router;
