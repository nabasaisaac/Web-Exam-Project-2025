import React from "react";
import { useAuth } from "../context/AuthContext";
import ManagerDashboard from "./ManagerDashboard";
import BabysitterDashboard from "./BabysitterDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // or a loading spinner
  }

  return user.role === "manager" ? (
    <ManagerDashboard />
  ) : (
    <BabysitterDashboard />
  );
};

export default Dashboard;
