const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const FinancialTransaction = require("../models/FinancialTransaction");
const Child = require("../models/Child");
const Babysitter = require("../models/Babysitter");
const db = require("../config/database");

// Get all financial transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const { type, timeRange } = req.query;
    let query = `
      SELECT 
        ft.*,
        u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE 1=1
    `;

    if (type) {
      query += ` AND ft.type = '${type}'`;
    }

    if (timeRange) {
      switch (timeRange) {
        case "week":
          query += ` AND YEARWEEK(ft.date) = YEARWEEK(CURDATE())`;
          break;
        case "month":
          query += ` AND YEAR(ft.date) = YEAR(CURDATE()) AND MONTH(ft.date) = MONTH(CURDATE())`;
          break;
        case "year":
          query += ` AND YEAR(ft.date) = YEAR(CURDATE())`;
          break;
      }
    }

    query += ` ORDER BY ft.date DESC`;

    const [transactions] = await db.query(query);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
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
      .notEmpty()
      .withMessage("Category is required")
      .custom((value, { req }) => {
        const validIncomeCategories = ["parent-payment"];
        const validExpenseCategories = [
          "Procurement of toys and play materials",
          "Center maintenance and repairs",
          "Utility bills",
        ];

        if (
          req.body.type === "income" &&
          !validIncomeCategories.includes(value)
        ) {
          throw new Error("Invalid income category");
        }
        if (
          req.body.type === "expense" &&
          !validExpenseCategories.includes(value)
        ) {
          throw new Error("Invalid expense category");
        }
        return true;
      }),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("child_id")
      .optional({ nullable: true })
      .isInt()
      .withMessage("Child ID must be an integer"),
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

// Budget Management Routes
router.post(
  "/budgets",
  [
    auth,
    authorize("manager"),
    body("category")
      .notEmpty()
      .withMessage("Category is required")
      .isIn([
        "Procurement of toys and play materials",
        "Center maintenance and repairs",
        "Utility bills",
        "Babysitter salaries",
      ])
      .withMessage("Invalid category"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("period_type")
      .isIn(["monthly", "weekly"])
      .withMessage("Period type must be monthly or weekly"),
    body("start_date").isISO8601().withMessage("Valid start date is required"),
    body("end_date")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("Valid end date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [result] = await db.query(
        `INSERT INTO budgets 
         (category, amount, period_type, start_date, end_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.body.category,
          req.body.amount,
          req.body.period_type,
          req.body.start_date,
          req.body.end_date,
          req.user.id,
        ]
      );

      res.status(201).json({
        message: "Budget created successfully",
        budgetId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({
        message: "Error creating budget",
        error: error.message,
      });
    }
  }
);

// Get all budgets
router.get("/budgets", [auth, authorize("manager")], async (req, res) => {
  try {
    const [budgets] = await db.query(
      `SELECT b.*, u.username as created_by_name 
       FROM budgets b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.start_date DESC`
    );
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({
      message: "Error fetching budgets",
      error: error.message,
    });
  }
});

// Get budget tracking data
router.get(
  "/budgets/tracking",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let query = `
      SELECT 
        b.category,
        b.amount as budgeted_amount,
        b.period_type,
        b.start_date,
        b.end_date,
        COALESCE(SUM(bt.actual_amount), 0) as actual_amount,
        (b.amount - COALESCE(SUM(bt.actual_amount), 0)) as remaining_amount
      FROM budgets b
      LEFT JOIN budget_tracking bt ON b.id = bt.budget_id
      WHERE 1=1
    `;
      const params = [];

      if (startDate && endDate) {
        query += " AND bt.tracking_date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      query += " GROUP BY b.id ORDER BY b.start_date DESC";

      const [tracking] = await db.query(query, params);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching budget tracking:", error);
      res.status(500).json({
        message: "Error fetching budget tracking",
        error: error.message,
      });
    }
  }
);

// Get filtered expenses with historical data
router.get(
  "/expenses/filtered",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { timeRange } = req.query;
      let dateFilter = "";
      let groupBy = "";

      switch (timeRange) {
        case "day":
          dateFilter = "DATE(date) = CURDATE()";
          groupBy = "HOUR(date)";
          break;
        case "week":
          dateFilter = "YEARWEEK(date) = YEARWEEK(CURDATE())";
          groupBy = "DAYOFWEEK(date)";
          break;
        case "month":
          dateFilter =
            "YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())";
          groupBy = "DAY(date)";
          break;
        case "year":
          dateFilter = "YEAR(date) = YEAR(CURDATE())";
          groupBy = "MONTH(date)";
          break;
        default:
          dateFilter =
            "YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())";
          groupBy = "DAY(date)";
      }

      const query = `
      SELECT 
        ${groupBy} as period,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(COUNT(*), 0) as transaction_count
      FROM financial_transactions
      WHERE type = 'expense'
      AND ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period
    `;

      const [result] = await db.query(query);
      res.json({
        expenses: result,
        timeRange,
      });
    } catch (error) {
      console.error("Error fetching filtered expenses:", error);
      res.status(500).json({
        message: "Error fetching filtered expenses",
        error: error.message,
      });
    }
  }
);

// Get filtered income with historical data
router.get(
  "/income/filtered",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { timeRange } = req.query;
      let dateFilter = "";
      let groupBy = "";

      switch (timeRange) {
        case "day":
          dateFilter = "DATE(date) = CURDATE()";
          groupBy = "HOUR(date)";
          break;
        case "week":
          dateFilter = "YEARWEEK(date) = YEARWEEK(CURDATE())";
          groupBy = "DAYOFWEEK(date)";
          break;
        case "month":
          dateFilter =
            "YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())";
          groupBy = "DAY(date)";
          break;
        case "year":
          dateFilter = "YEAR(date) = YEAR(CURDATE())";
          groupBy = "MONTH(date)";
          break;
        default:
          dateFilter =
            "YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())";
          groupBy = "DAY(date)";
      }

      const query = `
      SELECT 
        ${groupBy} as period,
        COALESCE(SUM(amount), 0) as total_income,
        COALESCE(COUNT(*), 0) as transaction_count
      FROM financial_transactions
      WHERE type = 'income'
      AND ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period
    `;

      const [result] = await db.query(query);
      res.json({
        data: result,
        timeRange,
      });
    } catch (error) {
      console.error("Error fetching filtered income:", error);
      res.status(500).json({
        message: "Error fetching filtered income",
        error: error.message,
      });
    }
  }
);

// Get total monthly budget
router.get("/budgets/total", [auth, authorize("manager")], async (req, res) => {
  try {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total_budget
      FROM budgets
      WHERE period_type = 'monthly'
      AND start_date <= CURDATE()
      AND (end_date IS NULL OR end_date >= CURDATE())
    `;

    const [result] = await db.query(query);
    res.json({ totalBudget: Number(result[0].total_budget) || 0 });
  } catch (error) {
    console.error("Error fetching total budget:", error);
    res.status(500).json({
      message: "Error fetching total budget",
      error: error.message,
    });
  }
});

// Get total expenses by category
router.get("/expenses/total", auth, async (req, res) => {
  try {
    const { timeRange } = req.query;
    let dateFilter = "";

    if (timeRange) {
      switch (timeRange) {
        case "week":
          dateFilter = "AND YEARWEEK(date) = YEARWEEK(CURDATE())";
          break;
        case "month":
          dateFilter =
            "AND YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())";
          break;
        case "year":
          dateFilter = "AND YEAR(date) = YEAR(CURDATE())";
          break;
      }
    }

    const query = `
      SELECT 
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM financial_transactions
      WHERE type = 'expense'
      ${dateFilter}
      GROUP BY category
      ORDER BY total_amount DESC
    `;

    const [expenses] = await db.query(query);
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching total expenses:", error);
    res.status(500).json({ error: "Failed to fetch total expenses" });
  }
});

module.exports = router;
