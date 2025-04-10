/**
 * Sidebar Component
 *
 * This component renders the left sidebar navigation of the application.
 * It displays a list of navigation items with icons and highlights
 * the currently active route. The sidebar is hidden on mobile devices
 * and becomes visible on medium and larger screens.
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaChild,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const { user } = useAuth();

  const managerLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      name: "Children",
      path: "/children",
      icon: <FaChild className="w-5 h-5" />,
    },
    {
      name: "Incidents",
      path: "/incidents",
      icon: <FaExclamationTriangle className="w-5 h-5" />,
    },
    {
      name: "Payments",
      path: "/payments",
      icon: <FaMoneyBillWave className="w-5 h-5" />,
    },
    {
      name: "Scheduling",
      path: "/scheduling",
      icon: <FaCalendarAlt className="w-5 h-5" />,
    },
    {
      name: "Babysitters",
      path: "/babysitters",
      icon: <FaUsers className="w-5 h-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartLine className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  const babysitterLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      name: "Children",
      path: "/children",
      icon: <FaChild className="w-5 h-5" />,
    },
    {
      name: "Incidents",
      path: "/incidents",
      icon: <FaExclamationTriangle className="w-5 h-5" />,
    },
  ];

  const links = user?.role === "manager" ? managerLinks : babysitterLinks;

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-8 text-center">Daycare Manager</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
