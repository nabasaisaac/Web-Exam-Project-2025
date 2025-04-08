import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import BabysitterDashboard from "./BabysitterDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      // Check if the current URL matches the user's role and username
      const currentPath = window.location.pathname;
      const expectedPath = `/${user.username || user.firstName}/dashboard`;

      if (currentPath !== expectedPath) {
        navigate(expectedPath);
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return user.role === "manager" ? (
    <ManagerDashboard />
  ) : (
    <BabysitterDashboard />
  );
};

export default Dashboard;
