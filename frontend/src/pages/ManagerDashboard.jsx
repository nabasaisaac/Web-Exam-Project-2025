import React from "react";
import { Link } from "react-router-dom";
import {
  FaChild,
  FaUserNurse,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const ManagerDashboard = () => {
  const stats = [
    {
      name: "Total Children",
      value: "24",
      icon: FaChild,
      color: "text-blue-500",
    },
    {
      name: "Active Babysitters",
      value: "8",
      icon: FaUserNurse,
      color: "text-green-500",
    },
    {
      name: "Today's Revenue",
      value: "UGX 240,000",
      icon: FaMoneyBillWave,
      color: "text-yellow-500",
    },
    {
      name: "Monthly Revenue",
      value: "UGX 2.4M",
      icon: FaChartLine,
      color: "text-purple-500",
    },
  ];

  const quickActions = [
    { name: "Manage Children", path: "/children", icon: FaChild },
    { name: "Manage Babysitters", path: "/babysitters", icon: FaUserNurse },
    { name: "View Schedule", path: "/schedule", icon: FaCalendarAlt },
    { name: "Financial Reports", path: "/reports", icon: FaChartLine },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Budget threshold exceeded for toys category",
      time: "10:30 AM",
    },
    {
      id: 2,
      type: "info",
      message: "New child registration pending approval",
      time: "9:15 AM",
    },
    {
      id: 3,
      type: "warning",
      message: "Babysitter attendance below target",
      time: "Yesterday",
    },
  ];

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

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.path}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <action.icon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-900">
                      {action.name}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Alerts
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <li key={alert.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle
                        className={`h-5 w-5 ${
                          alert.type === "warning"
                            ? "text-yellow-400"
                            : "text-blue-400"
                        }`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-500">{alert.time}</p>
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
