const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const Notification = require("../models/Notification");
const Child = require("../models/Child");
const User = require("../models/User");

// Get notifications
router.get("/", auth, async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const query = {
      $or: [
        { recipient: req.user._id, recipientModel: "User" },
        {
          recipient: { $in: await getManagedChildren(req.user._id) },
          recipientModel: "Child",
        },
      ],
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { recipient: req.user._id, recipientModel: "User" },
          {
            recipient: { $in: await getManagedChildren(req.user._id) },
            recipientModel: "Child",
          },
        ],
      },
      {
        status: "read",
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: error.message });
  }
});

// Create notification (manager only)
router.post(
  "/",
  [
    auth,
    authorize("manager"),
    body("recipient").isMongoId().withMessage("Invalid recipient ID"),
    body("recipientModel")
      .isIn(["User", "Child"])
      .withMessage("Invalid recipient model"),
    body("type")
      .isIn([
        "payment-reminder",
        "payment-overdue",
        "incident-report",
        "attendance-update",
        "system-alert",
      ])
      .withMessage("Invalid notification type"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("priority").optional().isIn(["low", "medium", "high"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify recipient exists
      const recipient =
        req.body.recipientModel === "User"
          ? await User.findById(req.body.recipient)
          : await Child.findById(req.body.recipient);

      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      const notification = new Notification({
        ...req.body,
        status: "pending",
      });

      await notification.save();

      res.status(201).json({
        message: "Notification created successfully",
        notification,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating notification", error: error.message });
    }
  }
);

// Get notification summary
router.get("/summary", [auth, authorize("manager")], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const notifications = await Notification.find(query);

    const summary = {
      totalNotifications: notifications.length,
      byType: {},
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
      byStatus: {
        pending: 0,
        sent: 0,
        read: 0,
        failed: 0,
      },
      readRate: 0,
    };

    notifications.forEach((notification) => {
      // Count by type
      summary.byType[notification.type] =
        (summary.byType[notification.type] || 0) + 1;

      // Count by priority
      summary.byPriority[notification.priority]++;

      // Count by status
      summary.byStatus[notification.status]++;

      // Count read notifications
      if (notification.status === "read") {
        summary.readRate++;
      }
    });

    // Calculate read rate
    if (summary.totalNotifications > 0) {
      summary.readRate = (summary.readRate / summary.totalNotifications) * 100;
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Error generating notification summary",
      error: error.message,
    });
  }
});

// Helper function to get children managed by a user
async function getManagedChildren(userId) {
  const user = await User.findById(userId);
  if (user.role === "manager") {
    const children = await Child.find({ isActive: true });
    return children.map((child) => child._id);
  }
  return [];
}

module.exports = router;
