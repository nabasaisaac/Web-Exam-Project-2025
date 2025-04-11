/**
 * MainLayout Component
 *
 * This component serves as the primary layout wrapper for the application.
 * It provides a consistent structure with a navigation bar at the top,
 * a sidebar on the left, and a main content area that renders child routes.
 */

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserDropdown from "../UserDropdown";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import MobileMenu from "./MobileMenu";

const MainLayout = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center">
              {/* Modern hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden relative w-8 h-8 focus:outline-none group"
                aria-label="Toggle menu"
              >
                <div className="relative flex overflow-hidden items-center justify-center rounded-full w-8 h-8 transform transition-all duration-200">
                  <div className="flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center overflow-hidden">
                    <div
                      className={`bg-gray-600 h-0.5 w-5 transform transition-all duration-300 origin-left ${
                        isMobileMenuOpen ? "rotate-45" : ""
                      }`}
                    ></div>
                    <div
                      className={`bg-gray-600 h-0.5 w-5 rounded transform transition-all duration-300 ${
                        isMobileMenuOpen ? "translate-x-10" : ""
                      }`}
                    ></div>
                    <div
                      className={`bg-gray-600 h-0.5 w-5 transform transition-all duration-300 origin-left ${
                        isMobileMenuOpen ? "-rotate-45" : ""
                      }`}
                    ></div>
                  </div>
                </div>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 ml-4">
                Daycare Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 cursor-pointer">
                <FaBell className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-3">{user?.role}</span>
                <UserDropdown />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
