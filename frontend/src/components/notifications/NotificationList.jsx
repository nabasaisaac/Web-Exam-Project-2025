import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import axios from "axios";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          setError("Not authenticated. Please login again.");
          setIsLoading(false);
          return;
        }

        console.log(
          "Fetching notifications with token:",
          token.substring(0, 10) + "..."
        );

        const response = await axios.get(
          "http://localhost:5000/api/incidents/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Notifications response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          console.warn("Invalid notifications response:", response.data);
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack,
        });

        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          setError("You don't have permission to view notifications.");
        } else if (error.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to fetch notifications. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      console.log("Marking notification as read:", id);

      const response = await axios.put(
        `http://localhost:5000/api/incidents/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Mark as read response:", response.data);

      // Update the notification status in the local state
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, status: 1 } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to mark notifications as read.");
      } else if (error.response?.status === 404) {
        setError("Notification not found.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to mark notification as read. Please try again."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow ${
                notification.status === 0
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {notification.incident_type}
                  </h3>
                  <p className="text-gray-600">{notification.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Reported by: {notification.reported_by_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Child: {notification.child_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {notification.status === 0 && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <FaCheck className="mr-1" /> Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
