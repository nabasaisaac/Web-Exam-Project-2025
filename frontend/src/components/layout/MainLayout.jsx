/**
 * MainLayout Component
 * 
 * This component serves as the primary layout wrapper for the application.
 * It provides a consistent structure with a navigation bar at the top,
 * a sidebar on the left, and a main content area that renders child routes.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    // Main container with full viewport height and light gray background
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation bar */}
      <Navbar />
      {/* Flex container for sidebar and main content */}
      <div className="flex">
        {/* Left sidebar navigation */}
        <Sidebar />
        {/* Main content area with padding */}
        <main className="flex-1 p-6">
          {/* Outlet for rendering child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 