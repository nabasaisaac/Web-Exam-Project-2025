/**
 * MainLayout Component
 *
 * This component serves as the primary layout wrapper for the application.
 * It provides a consistent structure with a navigation bar at the top,
 * a sidebar on the left, and a main content area that renders child routes.
 */

import React from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const { username } = useParams();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if the current user matches the route username
  const isAuthorized =
    user && (user.username === username || user.firstName === username);

  // If not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
