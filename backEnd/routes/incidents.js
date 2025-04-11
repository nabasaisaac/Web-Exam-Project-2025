const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const IncidentReport = require("../models/IncidentReport");
const Child = require("../models/Child");
const Notification = require("../models/Notification");
const db = require("../config/database");
const { sendIncidentEmail } = require("../services/emailService");

// Create incident report
router.post(
  "/",
  [
    auth,
    body("child_id").isInt().withMessage("Child ID is required"),
    body("incident_type")
      .isIn(["health", "behavior", "well-being"])
      .withMessage("Invalid incident type"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("target").isIn(["parent", "manager"]).withMessage("Invalid target"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { child_id, incident_type, description, target } = req.body;

      // Get child and parent details
      const [childRows] = await db.execute(
        `SELECT c.*, p.email as parent_email, p.name as parent_name 
         FROM children c 
         LEFT JOIN parents p ON c.parent_id = p.id 
         WHERE c.id = ?`,
        [child_id]
      );

      if (childRows.length === 0) {
        return res.status(404).json({ message: "Child not found" });
      }

      const child = childRows[0];

      // Insert incident report
      const [result] = await db.execute(
        `INSERT INTO incidents 
         (child_id, incident_type, description, reported_by, target) 
         VALUES (?, ?, ?, ?, ?)`,
        [child_id, incident_type, description, req.user.id, target]
      );

      // Send email notification if target is parent
      if (target === "parent" && child.parent_email) {
        try {
          await sendIncidentEmail(
            child.parent_email,
            child.full_name,
            incident_type,
            description,
            child.parent_name
          );
          res.json({
            message: "Incident report submitted and email sent to parent",
            incidentId: result.insertId,
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          res.json({
            message: "Incident saved but email notification failed",
            incidentId: result.insertId,
          });
        }
      } else {
        res.json({
          message: "Incident report submitted successfully",
          incidentId: result.insertId,
        });
      }
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({
        message: "Error creating incident report",
        error: error.message,
      });
    }
  }
);

// Update incident report
router.put(
  "/:id",
  [
    auth,
    authorize("manager"),
    body("parentNotified").optional().isBoolean(),
    body("followUpRequired").optional().isBoolean(),
    body("followUpNotes").optional().trim(),
    body("status").optional().isIn(["open", "resolved", "closed"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const incident = await IncidentReport.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident report not found" });
      }

      // Update parent notification date if parent was just notified
      if (req.body.parentNotified && !incident.parentNotified) {
        req.body.parentNotificationDate = new Date();
      }

      const updatedIncident = await IncidentReport.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        message: "Incident report updated successfully",
        incident: updatedIncident,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating incident report",
        error: error.message,
      });
    }
  }
);

// Get incident reports
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate, child, incidentType, status } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (child) {
      query.child = child;
    }

    if (incidentType) {
      query.incidentType = incidentType;
    }

    if (status) {
      query.status = status;
    }

    const incidents = await IncidentReport.find(query)
      .populate("child", "fullName")
      .populate("reportedBy", "username")
      .sort({ date: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching incident reports",
      error: error.message,
    });
  }
});

// Get incident report by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const incident = await IncidentReport.findById(req.params.id)
      .populate("child", "fullName parentDetails")
      .populate("reportedBy", "username");

    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching incident report",
      error: error.message,
    });
  }
});

// Get incident summary
router.get("/summary", [auth, authorize("manager")], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const incidents = await IncidentReport.find(query);

    const summary = {
      totalIncidents: incidents.length,
      byType: {},
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
      },
      byStatus: {
        open: 0,
        resolved: 0,
        closed: 0,
      },
      parentNotificationRate: 0,
    };

    incidents.forEach((incident) => {
      // Count by type
      summary.byType[incident.incidentType] =
        (summary.byType[incident.incidentType] || 0) + 1;

      // Count by severity
      summary.bySeverity[incident.severity]++;

      // Count by status
      summary.byStatus[incident.status]++;

      // Count parent notifications
      if (incident.parentNotified) {
        summary.parentNotificationRate++;
      }
    });

    // Calculate parent notification rate
    if (summary.totalIncidents > 0) {
      summary.parentNotificationRate =
        (summary.parentNotificationRate / summary.totalIncidents) * 100;
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Error generating incident summary",
      error: error.message,
    });
  }
});

// Get incidents for a child
router.get("/child/:childId", auth, async (req, res) => {
  try {
    const [incidents] = await db.execute(
      `SELECT i.*, 
       CONCAT(u.first_name, ' ', u.last_name) as reported_by_name
       FROM incidents i
       LEFT JOIN users u ON i.reported_by = u.id
       WHERE i.child_id = ?
       ORDER BY i.created_at DESC`,
      [req.params.childId]
    );

    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({
      message: "Error fetching incidents",
      error: error.message,
    });
  }
});

module.exports = router;
