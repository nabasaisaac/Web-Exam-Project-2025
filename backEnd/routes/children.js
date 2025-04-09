const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const Child = require("../models/Child");
const Attendance = require("../models/Attendance");
const IncidentReport = require("../models/IncidentReport");
const FinancialTransaction = require("../models/FinancialTransaction");
const Babysitter = require("../models/Babysitter");
const db = require("../config/database");

// Get all children
router.get("/", auth, async (req, res) => {
  try {
    let children;
    if (req.query.babysitterId) {
      // If babysitterId is provided, get only their children
      children = await Child.findChildrenByBabysitter(req.query.babysitterId);
    } else {
      // Otherwise get all children
      children = await Child.findAllChildren();
    }
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
    authorize("manager", "babysitter"),
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

      const childData = {
        fullName: req.body.fullName,
        age: req.body.age,
        parentName: req.body.parentDetails.fullName,
        parentPhone: req.body.parentDetails.phoneNumber,
        parentEmail: req.body.parentDetails.email,
        specialCareNeeds: req.body.specialNeeds,
        sessionType: req.body.sessionType,
        assignedBabysitterId: req.body.assignedBabysitter,
      };

      const childId = await Child.createChild(childData);
      const child = await Child.findChildById(childId);

      res.status(201).json({
        message: "Child registered successfully",
        child,
      });
    } catch (error) {
      console.error("Error registering child:", error);
      res
        .status(500)
        .json({ message: "Error registering child", error: error.message });
    }
  }
);

// Get child by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const child = await Child.findChildById(req.params.id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Get the babysitter details if assigned
    if (child.assigned_babysitter_id) {
      const babysitter = await Babysitter.findBabysitterById(
        child.assigned_babysitter_id
      );
      child.assigned_babysitter = babysitter;
    }

    res.json(child);
  } catch (error) {
    console.error("Error fetching child:", error);
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

      const updates = {
        full_name: req.body.fullName,
        age: req.body.age,
        parent_name: req.body.parentDetails?.fullName,
        parent_phone: req.body.parentDetails?.phoneNumber,
        parent_email: req.body.parentDetails?.email,
        special_care_needs: req.body.specialNeeds,
        session_type: req.body.sessionType,
      };

      await Child.updateChild(req.params.id, updates);
      const child = await Child.findChildById(req.params.id);

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
    await Child.deleteChild(req.params.id);
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
    const attendance = await Child.getChildAttendance(req.params.id);
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
    const incidents = await Child.getChildIncidents(req.params.id);
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

// Update child attendance
router.post("/:id/attendance", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const childId = req.params.id;

    // Validate status
    if (!["check-in", "check-out"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    // Update child's is_active status
    // true for check-in, false for check-out
    const isActive = status === "check-in";
    const query = "UPDATE children SET is_active = ? WHERE id = ?";
    await db.query(query, [isActive, childId]);

    // Get updated child data
    const child = await Child.findChildById(childId);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.json({
      message: "Attendance updated successfully",
      status: child.is_active ? "check-in" : "check-out",
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Error updating attendance" });
  }
});

module.exports = router;
