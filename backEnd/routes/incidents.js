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
router.post("/", [auth, authorize("babysitter")], async (req, res) => {
  try {
    const { child_id, incident_type, description, target } = req.body;
    console.log("Processing incident report for child:", child_id);

    // Get child details directly from children table
    const [rows] = await db.query("SELECT * FROM children WHERE id = ?", [
      child_id,
    ]);
    const child = rows[0];

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Save incident to database
    const [result] = await db.query(
      "INSERT INTO incident_report (child_id, reported_by, incident_type, description, target) VALUES (?, ?, ?, ?, ?)",
      [child_id, req.user.id, incident_type, description, target]
    );

    // Send response immediately
    res.status(201).json({
      message: "Incident reported successfully",
      id: result.insertId,
    });

    // Send email notification to parent asynchronously if target is parent
    if (target === "parent" && child.parent_email) {
      sendIncidentEmail(
        child.parent_email,
        child.full_name,
        incident_type,
        description,
        child.parent_name
      ).catch((error) => {
        console.error("Email sending failed:", error.message);
      });
    }
  } catch (error) {
    console.error("Error reporting incident:", error);
    res.status(500).json({ message: "Failed to report incident" });
  }
});

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

// Get incident reports for a child
router.get("/child/:childId", auth, async (req, res) => {
  try {
    const incidents = await IncidentReport.getChildIncidents(
      req.params.childId
    );
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incident reports:", error);
    res.status(500).json({
      message: "Error fetching incident reports",
      error: error.message,
    });
  }
});

module.exports = router;
