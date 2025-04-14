const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const FinancialTransaction = require("../models/FinancialTransaction");
const Child = require("../models/Child");
const Babysitter = require("../models/Babysitter");
const db = require("../config/database");

// Get all financial transactions
router.get("/transactions", [auth, authorize("manager")], async (req, res) => {
  try {
    const { startDate, endDate, type, status } = req.query;
    let query = `
      SELECT 
        ft.*,
        b.first_name,
        b.last_name,
        u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN babysitters b ON ft.babysitter_id = b.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += " AND ft.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (type) {
      query += " AND ft.type = ?";
      params.push(type);
    }

    if (status) {
      query += " AND ft.status = ?";
      params.push(status);
    }

    query += " ORDER BY ft.date DESC";

    const [transactions] = await db.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
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
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("child_id").optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [result] = await db.query(
        `INSERT INTO financial_transactions 
         (type, category, amount, description, date, created_by, child_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.type,
          req.body.category,
          req.body.amount,
          req.body.description,
          req.body.date,
          req.user.id,
          req.body.child_id || null,
        ]
      );

      res.status(201).json({
        message: "Transaction recorded successfully",
        transactionId: result.insertId,
      });
    } catch (error) {
      console.error("Error recording transaction:", error);
      res.status(500).json({
        message: "Error recording transaction",
        error: error.message,
      });
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
