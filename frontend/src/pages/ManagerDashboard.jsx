import React, { useState, useEffect } from "react";
import {
  FaChild,
  FaUserNurse,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";

const ManagerDashboard = () => {
  const [stats, setStats] = useState([
    {
      name: "Total Children",
      value: "0",
      icon: FaChild,
      color: "text-blue-500",
    },
    {
      name: "Active Babysitters",
      value: "0",
      icon: FaUserNurse,
      color: "text-green-500",
    },
    {
      name: "Today's Revenue",
      value: "UGX 0",
      icon: FaMoneyBillWave,
      color: "text-yellow-500",
    },
    {
      name: "Monthly Revenue",
      value: "UGX 0",
      icon: FaChartLine,
      color: "text-purple-500",
    },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [
          childrenRes,
          babysittersRes,
          transactionsRes,
          babysitterPaymentsRes,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/children", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/babysitters", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/financial/transactions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/babysitters/payments/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Format currency
        const formatCurrency = (amount) => {
          return new Intl.NumberFormat("en-UG", {
            style: "currency",
            currency: "UGX",
            maximumFractionDigits: 0,
          }).format(amount);
        };

        // Calculate today's and monthly revenue
        const today = new Date().toISOString().split("T")[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        // Calculate revenue from financial transactions
        const todayRevenue = transactionsRes.data
          .filter((t) => t.type === "income" && t.date.startsWith(today))
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlyRevenue = transactionsRes.data
          .filter((t) => t.type === "income" && t.date.startsWith(thisMonth))
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Update stats with real data
        setStats([
          {
            name: "Total Children",
            value: childrenRes.data.length.toString(),
            icon: FaChild,
            color: "text-blue-500",
          },
          {
            name: "Active Babysitters",
            value: babysittersRes.data.length.toString(),
            icon: FaUserNurse,
            color: "text-green-500",
          },
          {
            name: "Today's Revenue",
            value: formatCurrency(todayRevenue),
            icon: FaMoneyBillWave,
            color: "text-yellow-500",
          },
          {
            name: "Monthly Revenue",
            value: formatCurrency(monthlyRevenue),
            icon: FaChartLine,
            color: "text-purple-500",
          },
        ]);

        // Combine and sort recent transactions and payments
        const allTransactions = [
          ...transactionsRes.data.map((t) => ({
            id: t.id,
            type: t.type === "income" ? "info" : "warning",
            message: `${
              t.type === "income" ? "Income" : "Expense"
            } of ${formatCurrency(t.amount)} for ${t.category}`,
            time: new Date(t.date).getTime(),
            date: t.date,
          })),
          ...babysitterPaymentsRes.data
            .filter((p) => p.status === "completed")
            .map((p) => ({
              id: p.id,
              type: "warning",
              message: `Babysitter payment of ${formatCurrency(p.amount)} to ${
                p.first_name
              } ${p.last_name}`,
              time: new Date(p.date).getTime(),
              date: p.date,
            })),
        ];

        // Sort by date and get the 3 most recent
        const recent = allTransactions
          .sort((a, b) => b.time - a.time)
          .slice(0, 3)
          .map((t) => {
            const date = new Date(t.date);
            return {
              ...t,
              time: date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            };
          });

        setRecentTransactions(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manager Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle
                        className={`h-5 w-5 ${
                          transaction.type === "warning"
                            ? "text-yellow-400"
                            : "text-blue-400"
                        }`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.message}
                      </p>
                      <p className="text-sm text-gray-500">{transaction.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
