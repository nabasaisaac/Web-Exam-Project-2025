const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const Babysitter = require("../models/Babysitter");
const FinancialTransaction = require("../models/FinancialTransaction");
const Attendance = require("../models/Attendance");
const db = require("../config/database");

// Get all babysitters
router.get("/", async (req, res) => {
  try {
    const [babysitters] = await db.query(
      `SELECT b.id, b.first_name, b.last_name, b.email, b.phone_number, b.nin, b.age, 
       b.next_of_kin_name, b.next_of_kin_phone, b.next_of_kin_relationship, 
       b.is_active, b.last_login, b.created_at,
       COUNT(c.id) as children_assigned_count
       FROM babysitters b
       LEFT JOIN children c ON b.id = c.assigned_babysitter_id
       WHERE b.is_active = 1
       GROUP BY b.id`
    );
    res.json(babysitters);
  } catch (error) {
    console.error("Error fetching babysitters:", error);
    res
      .status(500)
      .json({ message: "Error fetching babysitters", error: error.message });
  }
});

// Register a new babysitter
router.post(
  "/",
  [
    auth,
    authorize("manager"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("nin")
      .trim()
      .notEmpty()
      .withMessage("National Identification Number is required"),
    body("age")
      .isInt({ min: 21, max: 35 })
      .withMessage("Age must be between 21 and 35"),
    body("nextOfKin.name")
      .trim()
      .notEmpty()
      .withMessage("Next of kin name is required"),
    body("nextOfKin.phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Next of kin phone number is required"),
    body("nextOfKin.relationship")
      .trim()
      .notEmpty()
      .withMessage("Next of kin relationship is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const babysitter = new Babysitter(req.body);
      await babysitter.save();

      res.status(201).json({
        message: "Babysitter registered successfully",
        babysitter,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error registering babysitter",
        error: error.message,
      });
    }
  }
);

// Get babysitter by ID with children count
router.get("/:id", async (req, res) => {
  try {
    const [babysitter] = await db.query(
      `SELECT b.*, COUNT(c.id) as children_assigned_count
       FROM babysitters b
       LEFT JOIN children c ON b.id = c.assigned_babysitter_id
       WHERE b.id = ? AND b.is_active = 1
       GROUP BY b.id`,
      [req.params.id]
    );

    if (!babysitter.length) {
      return res.status(404).json({ message: "Babysitter not found" });
    }

    res.json(babysitter[0]);
  } catch (error) {
    console.error("Error fetching babysitter:", error);
    res
      .status(500)
      .json({ message: "Error fetching babysitter", error: error.message });
  }
});

// Update babysitter
router.put(
  "/:id",
  [
    auth,
    authorize("manager"),
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phoneNumber").optional().trim().notEmpty(),
    body("age").optional().isInt({ min: 21, max: 35 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const babysitter = await Babysitter.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!babysitter) {
        return res.status(404).json({ message: "Babysitter not found" });
      }

      res.json({
        message: "Babysitter updated successfully",
        babysitter,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating babysitter", error: error.message });
    }
  }
);

// Delete babysitter (soft delete)
router.delete("/:id", [auth, authorize("manager")], async (req, res) => {
  try {
    const babysitter = await Babysitter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!babysitter) {
      return res.status(404).json({ message: "Babysitter not found" });
    }

    res.json({ message: "Babysitter deactivated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deactivating babysitter", error: error.message });
  }
});

// Get babysitter's payment history
router.get("/:id/payments", auth, async (req, res) => {
  try {
    const payments = await FinancialTransaction.find({
      reference: req.params.id,
      referenceModel: "Babysitter",
      type: "expense",
      category: "babysitter-salary",
    }).sort({ date: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
});

// Get babysitter's attendance history
router.get("/:id/attendance", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      babysitter: req.params.id,
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance history",
      error: error.message,
    });
  }
});

module.exports = router;
