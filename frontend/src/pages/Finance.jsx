import React, { useState } from "react";
import {
  FaPlus,
  FaChartLine,
  FaFileExport,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import AddTransactionForm from "../components/finance/AddTransactionForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Finance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [transactionType, setTransactionType] = useState("income");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [budgetData, setBudgetData] = useState({
    category: "",
    amount: "",
    period: "monthly",
  });

  // Sample data - to be replaced with actual API calls
  const financialData = {
    overview: {
      totalIncome: 2400000,
      totalExpenses: 1800000,
      netIncome: 600000,
      monthlyBudget: 2000000,
    },
    incomeSources: [
      { category: "Full-day Sessions", amount: 1500000, target: 2000000 },
      { category: "Half-day Sessions", amount: 900000, target: 1000000 },
    ],
    expenses: [
      { category: "Babysitter Salaries", amount: 800000, budget: 1000000 },
      { category: "Toys & Materials", amount: 300000, budget: 400000 },
      { category: "Maintenance", amount: 400000, budget: 500000 },
      { category: "Utilities", amount: 300000, budget: 400000 },
    ],
    transactions: [
      {
        id: 1,
        type: "income",
        amount: 50000,
        description: "Full-day Session - Sarah Johnson",
        category: "Full-day Sessions",
        date: "2024-04-01",
      },
      {
        id: 2,
        type: "expense",
        amount: 150000,
        description: "Babysitter salary - Jane Doe",
        category: "Babysitter Salaries",
        date: "2024-04-01",
      },
      {
        id: 3,
        type: "expense",
        amount: 75000,
        description: "Educational materials",
        category: "Toys & Materials",
        date: "2024-04-02",
      },
    ],
    spendingTrends: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      income: [1800000, 2000000, 2200000, 2400000, 2600000, 2800000],
      expenses: [1500000, 1600000, 1700000, 1800000, 1900000, 2000000],
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const chartData = {
    labels: financialData.spendingTrends.labels,
    datasets: [
      {
        label: "Income",
        data: financialData.spendingTrends.income,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: financialData.spendingTrends.expenses,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Financial Trends",
      },
    },
  };

  const handleTransactionAdded = () => {
    // Refresh transactions data
    // TODO: Implement actual data refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track income, expenses, and manage budgets
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Add Transaction
            </button>
            <button
              onClick={() => setShowBudgetForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaChartLine className="mr-2" /> Set Budget
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "income", "expenses", "budgets", "reports"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <FaFilter className="mr-2" /> Filter
          </button>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === "overview" && (
            <div className="p-6">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(financialData.overview).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {formatCurrency(value)}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="mt-8">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {activeTab === "income" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Income Sources
              </h2>
              <div className="space-y-4">
                {financialData.incomeSources.map((source) => (
                  <div
                    key={source.category}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {source.category}
                      </h3>
                      <span className="text-sm font-medium text-indigo-600">
                        {formatCurrency(source.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            source.amount,
                            source.target
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Target: {formatCurrency(source.target)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Expense Categories
              </h2>
              <div className="space-y-4">
                {financialData.expenses.map((expense) => (
                  <div
                    key={expense.category}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {expense.category}
                      </h3>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-600 h-2.5 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            expense.amount,
                            expense.budget
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Budget: {formatCurrency(expense.budget)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "budgets" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Budget Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialData.expenses.map((expense) => (
                  <div
                    key={expense.category}
                    className="bg-white border rounded-lg p-4"
                  >
                    <h3 className="text-sm font-medium text-gray-900">
                      {expense.category}
                    </h3>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Budget</span>
                        <span className="font-medium">
                          {formatCurrency(expense.budget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Actual Spending</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{
                              width: `${calculateProgress(
                                expense.amount,
                                expense.budget
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Financial Reports
                </h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FaFileExport className="mr-2" /> Export Report
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Daily Summary
                  </h3>
                  <div className="space-y-4">
                    {financialData.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Budget Adherence
                  </h3>
                  <div className="space-y-4">
                    {financialData.expenses.map((expense) => (
                      <div
                        key={expense.category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-900">
                          {expense.category}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            expense.amount > expense.budget
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(expense.amount - expense.budget)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <AddTransactionForm
          onClose={() => setShowTransactionForm(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Set Budget</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={budgetData.category}
                  onChange={(e) =>
                    setBudgetData({ ...budgetData, category: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {financialData.expenses.map((expense) => (
                    <option key={expense.category} value={expense.category}>
                      {expense.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={budgetData.amount}
                  onChange={(e) =>
                    setBudgetData({ ...budgetData, amount: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Period
                </label>
                <select
                  name="period"
                  value={budgetData.period}
                  onChange={(e) =>
                    setBudgetData({ ...budgetData, period: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBudgetForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
