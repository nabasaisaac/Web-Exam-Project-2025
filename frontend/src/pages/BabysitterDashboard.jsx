import React from "react";
import { Link } from "react-router-dom";
import {
  FaChild,
  FaClock,
  FaMoneyBillWave,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";

const BabysitterDashboard = () => {
  const stats = [
    {
      name: "Children Under Care",
      value: "5",
      icon: FaChild,
      color: "text-blue-500",
    },
    {
      name: "Today's Hours",
      value: "8",
      icon: FaClock,
      color: "text-green-500",
    },
    {
      name: "Today's Earnings",
      value: "UGX 40,000",
      icon: FaMoneyBillWave,
      color: "text-yellow-500",
    },
    {
      name: "Monthly Earnings",
      value: "UGX 800,000",
      icon: FaMoneyBillWave,
      color: "text-purple-500",
    },
  ];

  const quickActions = [
    { name: "View Children", path: "/my-children", icon: FaChild },
    { name: "Daily Schedule", path: "/my-schedule", icon: FaClock },
    {
      name: "Report Incident",
      path: "/report-incident",
      icon: FaExclamationTriangle,
    },
    { name: "Attendance Log", path: "/attendance", icon: FaClipboardList },
  ];

  const recentActivities = [
    { id: 1, child: "Sarah Johnson", action: "Checked in", time: "8:00 AM" },
    { id: 2, child: "Michael Brown", action: "Lunch served", time: "12:30 PM" },
    { id: 3, child: "Emma Wilson", action: "Nap time", time: "2:00 PM" },
    { id: 4, child: "James Davis", action: "Checked out", time: "4:30 PM" },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Babysitter Dashboard
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

      {/* Recent Activities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Today's Activities
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {activity.child}
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        {activity.action}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <p className="text-sm text-gray-500">{activity.time}</p>
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

export default BabysitterDashboard;
