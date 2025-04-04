const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const IncidentReport = require("../models/IncidentReport");
const Child = require("../models/Child");
const Notification = require("../models/Notification");

// Create incident report
router.post(
  "/",
  [
    auth,
    authorize("manager", "babysitter"),
    body("child").isMongoId().withMessage("Invalid child ID"),
    body("incidentType")
      .isIn(["health", "behavior", "accident", "other"])
      .withMessage("Invalid incident type"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("severity")
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid severity level"),
    body("actionTaken")
      .trim()
      .notEmpty()
      .withMessage("Action taken is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify child exists and is active
      const child = await Child.findOne({
        _id: req.body.child,
        isActive: true,
      });

      if (!child) {
        return res.status(404).json({ message: "Child not found or inactive" });
      }

      const incident = new IncidentReport({
        ...req.body,
        reportedBy: req.user._id,
      });

      await incident.save();

      // Create notification for manager if reported by babysitter
      if (req.user.role === "babysitter") {
        const notification = new Notification({
          recipient: child._id,
          recipientModel: "Child",
          type: "incident-report",
          title: "New Incident Report",
          message: `An incident has been reported for ${child.fullName}`,
          priority: incident.severity === "high" ? "high" : "medium",
          metadata: {
            incidentId: incident._id,
          },
        });

        await notification.save();
      }

      res.status(201).json({
        message: "Incident report created successfully",
        incident,
      });
    } catch (error) {
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

module.exports = router;
