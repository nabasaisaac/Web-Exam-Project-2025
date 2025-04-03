const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const FinancialTransaction = require("../models/FinancialTransaction");
const Child = require("../models/Child");
const Babysitter = require("../models/Babysitter");

// Get all financial transactions
router.get("/transactions", [auth, authorize("manager")], async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const transactions = await FinancialTransaction.find(query)
      .sort({ date: -1 })
      .populate("reference", "fullName firstName lastName");

    res.json(transactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
});

// Record a new financial transaction
router.post(
  "/transactions",
  [
    auth,
    authorize("manager"),
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Invalid transaction type"),
    body("category")
      .isIn([
        "daycare-fees",
        "babysitter-salary",
        "toys-materials",
        "maintenance",
        "utilities",
        "other",
      ])
      .withMessage("Invalid category"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("reference").optional().isMongoId(),
    body("referenceModel").optional().isIn(["Child", "Babysitter"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = new FinancialTransaction({
        ...req.body,
        createdBy: req.user._id,
      });

      await transaction.save();

      res.status(201).json({
        message: "Transaction recorded successfully",
        transaction,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error recording transaction", error: error.message });
    }
  }
);

// Get financial summary
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

    const transactions = await FinancialTransaction.find(query);

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      byCategory: {
        income: {},
        expense: {},
      },
    };

    transactions.forEach((transaction) => {
      const amount = transaction.amount;
      if (transaction.type === "income") {
        summary.totalIncome += amount;
        summary.byCategory.income[transaction.category] =
          (summary.byCategory.income[transaction.category] || 0) + amount;
      } else {
        summary.totalExpenses += amount;
        summary.byCategory.expense[transaction.category] =
          (summary.byCategory.expense[transaction.category] || 0) + amount;
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalExpenses;

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Error generating financial summary",
      error: error.message,
    });
  }
});

// Get overdue payments
router.get("/overdue", [auth, authorize("manager")], async (req, res) => {
  try {
    const today = new Date();
    const overdueDate = new Date(today.setDate(today.getDate() - 30)); // 30 days overdue

    const overduePayments = await FinancialTransaction.find({
      type: "income",
      category: "daycare-fees",
      status: "pending",
      date: { $lt: overdueDate },
    }).populate("reference", "fullName parentDetails");

    res.json(overduePayments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching overdue payments",
      error: error.message,
    });
  }
});

// Get babysitter payments due
router.get(
  "/babysitter-payments",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        type: "expense",
        category: "babysitter-salary",
        status: "pending",
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const payments = await FinancialTransaction.find(query).populate(
        "reference",
        "firstName lastName"
      );

      res.json(payments);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching babysitter payments",
        error: error.message,
      });
    }
  }
);

module.exports = router;
