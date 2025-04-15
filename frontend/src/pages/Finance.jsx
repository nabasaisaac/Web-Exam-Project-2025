import React, { useState, useEffect } from "react";
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
import AddBudgetForm from "../components/finance/AddBudgetForm";
import axios from "axios";

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
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
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

  const [budgets, setBudgets] = useState([]);
  const [budgetTracking, setBudgetTracking] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeTransactionCount, setIncomeTransactionCount] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [chartDataState, setChartDataState] = useState({
    labels: [],
    income: [],
    expenses: [],
  });

  // Add static financial data
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

  // Add this useEffect to fetch budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgets(response.data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    const fetchBudgetTracking = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets/tracking",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudgetTracking(response.data);
      } catch (error) {
        console.error("Error fetching budget tracking:", error);
      }
    };

    fetchBudgets();
    fetchBudgetTracking();
  }, []);

  const handleBudgetAdded = () => {
    // Refresh budgets and tracking data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [budgetsRes, trackingRes] = await Promise.all([
          axios.get("http://localhost:5000/api/financial/budgets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/financial/budgets/tracking", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setBudgets(budgetsRes.data);
        setBudgetTracking(trackingRes.data);
      } catch (error) {
        console.error("Error refreshing budget data:", error);
      }
    };
    fetchData();
  };

  // Add this useEffect to fetch filtered expenses
  useEffect(() => {
    const fetchFilteredExpenses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/financial/expenses/filtered?timeRange=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFilteredExpenses(response.data.expenses);
        setTotalExpenses(response.data.totalExpenses);
      } catch (error) {
        console.error("Error fetching filtered expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredExpenses();
  }, [timeRange]); // This will run whenever timeRange changes

  // Update the useEffect for filtered income and expenses to update the static data
  useEffect(() => {
    const fetchFilteredIncome = async () => {
      try {
        const token = localStorage.getItem("token");
        const [incomeResponse, expensesResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/financial/income/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            `http://localhost:5000/api/financial/expenses/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // Calculate total income from the response data
        const totalIncome = incomeResponse.data.data.reduce(
          (sum, item) => sum + (Number(item.total_income) || 0),
          0
        );
        const transactionCount = incomeResponse.data.data.reduce(
          (sum, item) => sum + (Number(item.transaction_count) || 0),
          0
        );

        // Calculate total expenses from the response data
        const totalExpenses = expensesResponse.data.expenses.reduce(
          (sum, item) => sum + (Number(item.total_amount) || 0),
          0
        );

        // Update the static data with real values
        financialData.overview.totalIncome = totalIncome;
        financialData.overview.totalExpenses = totalExpenses;
        financialData.overview.netIncome = totalIncome - totalExpenses;

        setTotalIncome(totalIncome);
        setIncomeTransactionCount(transactionCount);
        setTotalExpenses(totalExpenses);
        setNetIncome(totalIncome - totalExpenses);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        // Reset values on error
        setTotalIncome(0);
        setIncomeTransactionCount(0);
        setTotalExpenses(0);
        setNetIncome(0);
      }
    };

    fetchFilteredIncome();
  }, [timeRange]);

  // Update the useEffect for total budget to handle data properly
  useEffect(() => {
    const fetchTotalBudget = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/financial/budgets/total",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTotalBudget(Number(response.data.totalBudget) || 0);
      } catch (error) {
        console.error("Error fetching total budget:", error);
        setTotalBudget(0);
      }
    };

    fetchTotalBudget();
  }, []);

  // Update the useEffect for chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [incomeResponse, expensesResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/financial/income/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            `http://localhost:5000/api/financial/expenses/filtered?timeRange=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // Generate labels based on timeRange
        let labels = [];
        const today = new Date();
        switch (timeRange) {
          case "day":
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            break;
          case "week":
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            break;
          case "month":
            const daysInMonth = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            ).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            break;
          case "year":
            labels = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            break;
          default:
            labels = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
        }

        // Process income data
        const incomeData = new Array(labels.length).fill(0);
        incomeResponse.data.data.forEach((item) => {
          const index =
            timeRange === "week" ? item.period - 1 : item.period - 1;
          if (index >= 0 && index < incomeData.length) {
            incomeData[index] = Number(item.total_income) || 0;
          }
        });

        // Process expenses data
        const expensesData = new Array(labels.length).fill(0);
        expensesResponse.data.expenses.forEach((item) => {
          const index =
            timeRange === "week" ? item.period - 1 : item.period - 1;
          if (index >= 0 && index < expensesData.length) {
            expensesData[index] = Number(item.total_amount) || 0;
          }
        });

        setChartDataState({
          labels,
          income: incomeData,
          expenses: expensesData,
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartDataState({
          labels: [],
          income: [0],
          expenses: [0],
        });
      }
    };

    fetchChartData();
  }, [timeRange]);

  // Update the formatCurrency function to handle NaN and undefined better
  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === undefined || amount === null) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
      }).format(0);
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
      }).format(0);
    }

    if (numAmount >= 1000000) {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(numAmount);
    }
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  // Update the chart data object
  const chartDataConfig = {
    labels: chartDataState.labels,
    datasets: [
      {
        label: "Income",
        data: chartDataState.income,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.1,
        fill: false,
      },
      {
        label: "Expenses",
        data: chartDataState.expenses,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.1,
        fill: false,
      },
    ],
  };

  // Update chart options to show proper tooltips
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Financial Trends - ${
          timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
        }`,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const handleTransactionAdded = () => {
    // Refresh transactions data
    // TODO: Implement actual data refresh
  };

  // Update the expenses tab content
  const renderExpensesTab = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            For {timeRange === "day" ? "today" : `this ${timeRange}`}
          </p>
        </div>

        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {expense.category}
                </h3>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(expense.total_amount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{
                    width: `${(expense.total_amount / totalExpenses) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {expense.transaction_count} transactions
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
              onClick={() => setShowAddBudgetForm(true)}
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
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Income
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {formatCurrency(totalIncome)}
                        </dd>
                        <p className="mt-1 text-sm text-gray-500">
                          {incomeTransactionCount} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Expenses
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">
                          {formatCurrency(totalExpenses)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Net Income
                        </dt>
                        <dd
                          className={`mt-1 text-3xl font-semibold ${
                            netIncome >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(netIncome)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Monthly Budget
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {formatCurrency(totalBudget)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="mt-8">
                <Line data={chartDataConfig} options={chartOptions} />
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

          {activeTab === "expenses" && renderExpensesTab()}

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

      {/* Add Budget Form Modal */}
      {showAddBudgetForm && (
        <AddBudgetForm
          onClose={() => setShowAddBudgetForm(false)}
          onBudgetAdded={handleBudgetAdded}
        />
      )}
    </div>
  );
};

export default Finance;
