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

// Get all babysitter schedules
router.get("/schedules", auth, async (req, res) => {
  try {
    const [schedules] = await db.query(`
      SELECT 
        bs.*,
        b.first_name,
        b.last_name,
        COUNT(c.id) as children_assigned_count
      FROM babysitter_schedules bs
      JOIN babysitters b ON bs.babysitter_id = b.id
      LEFT JOIN children c ON b.id = c.assigned_babysitter_id
      WHERE b.is_active = TRUE
      GROUP BY bs.id, b.id, bs.date, bs.start_time, bs.end_time, bs.session_type, bs.status, bs.created_at
      ORDER BY bs.date DESC, bs.start_time ASC
    `);

    if (!schedules) {
      return res.status(200).json([]);
    }

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// Get babysitter by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const [babysitter] = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = TRUE",
      [req.params.id]
    );

    if (!babysitter || babysitter.length === 0) {
      return res.status(404).json({ message: "Babysitter not found" });
    }

    res.json(babysitter[0]);
  } catch (error) {
    console.error("Error fetching babysitter:", error);
    res.status(500).json({ error: "Failed to fetch babysitter" });
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
    const result = await Babysitter.deleteBabysitter(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Error in delete route:", error);
    if (error.message === "Babysitter not found") {
      return res.status(404).json({ message: error.message });
    }
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

// Get babysitter payments
router.get("/:id/payments", auth, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT ft.*, 
       b.first_name, b.last_name,
       c.children_count
       FROM financial_transactions ft
       JOIN babysitters b ON ft.reference_id = b.id
       LEFT JOIN (
         SELECT assigned_babysitter_id, COUNT(*) as children_count
         FROM children
         WHERE is_active = 1
         GROUP BY assigned_babysitter_id
       ) c ON b.id = c.assigned_babysitter_id
       WHERE ft.reference_type = 'babysitter'
       AND ft.reference_id = ?
       ORDER BY ft.date DESC`,
      [req.params.id]
    );
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
});

// Calculate daily payment for babysitter
router.post("/:id/calculate-payment", auth, async (req, res) => {
  try {
    const { date, sessionType } = req.body;

    // Get number of children assigned to babysitter
    const [childrenCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM children 
       WHERE assigned_babysitter_id = ? 
       AND is_active = 1`,
      [req.params.id]
    );

    // Calculate payment based on session type and number of children
    const rate = sessionType === "full-day" ? 5000 : 2000;
    const amount = rate * childrenCount[0].count;

    res.json({
      childrenCount: childrenCount[0].count,
      rate,
      amount,
      sessionType,
      date,
    });
  } catch (error) {
    console.error("Error calculating payment:", error);
    res
      .status(500)
      .json({ message: "Error calculating payment", error: error.message });
  }
});

// Clear a payment (update status to completed)
router.put(
  "/:id/payments/:paymentId/clear",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      await db.query(
        `UPDATE financial_transactions 
       SET status = 'completed' 
       WHERE id = ? AND reference_id = ? AND reference_type = 'babysitter'`,
        [req.params.paymentId, req.params.id]
      );
      res.json({ message: "Payment cleared successfully" });
    } catch (error) {
      console.error("Error clearing payment:", error);
      res
        .status(500)
        .json({ message: "Error clearing payment", error: error.message });
    }
  }
);

// Create schedule for babysitter
router.post("/:id/schedule", [auth, authorize("manager")], async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, sessionType } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime || !sessionType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if babysitter exists and is active
    const babysitter = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = TRUE",
      [id]
    );

    if (babysitter.length === 0) {
      return res
        .status(404)
        .json({ error: "Babysitter not found or inactive" });
    }

    // Insert the schedule
    const result = await db.query(
      `INSERT INTO babysitter_schedules 
       (babysitter_id, date, start_time, end_time, session_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, date, startTime, endTime, sessionType]
    );

    res.status(201).json({
      message: "Schedule created successfully",
      scheduleId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// Update schedule status
router.put(
  "/schedules/:id/status",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!status || !["pending", "approved"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Update the status
      await db.query(
        "UPDATE babysitter_schedules SET status = ? WHERE id = ?",
        [status, id]
      );

      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

// Get approved schedules for payments
router.get("/payments", auth, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT 
        bs.*,
        b.first_name,
        b.last_name,
        COUNT(c.id) as children_count
      FROM babysitter_schedules bs
      JOIN babysitters b ON bs.babysitter_id = b.id
      LEFT JOIN children c ON b.id = c.assigned_babysitter_id
      WHERE bs.status = 'approved'
      AND NOT EXISTS (
        SELECT 1 FROM babysitter_payments bp 
        WHERE bp.schedule_id = bs.id
      )
      GROUP BY bs.id, b.id, bs.date, bs.start_time, bs.end_time, bs.session_type
      ORDER BY bs.date DESC
    `);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Clear a payment (mark as completed)
router.put(
  "/payments/:id/clear",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get the schedule details
      const [schedule] = await db.query(
        `
      SELECT 
        bs.*,
        COUNT(c.id) as children_count
      FROM babysitter_schedules bs
      LEFT JOIN children c ON bs.babysitter_id = c.assigned_babysitter_id
      WHERE bs.id = ?
      GROUP BY bs.id
    `,
        [id]
      );

      if (!schedule || schedule.length === 0) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      const { session_type, children_count } = schedule[0];
      const rate = session_type === "full-day" ? 5000 : 2000;
      const amount = rate * children_count;

      // Create payment record
      await db.query(
        `
      INSERT INTO babysitter_payments 
      (schedule_id, amount, status) 
      VALUES (?, ?, 'completed')
    `,
        [id, amount]
      );

      res.json({ message: "Payment cleared successfully" });
    } catch (error) {
      console.error("Error clearing payment:", error);
      res.status(500).json({ error: "Failed to clear payment" });
    }
  }
);

module.exports = router;
