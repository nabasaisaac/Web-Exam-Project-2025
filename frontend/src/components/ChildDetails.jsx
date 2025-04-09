import React, { useState } from "react";
import {
  FaTimes,
  FaBaby,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaInfoCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

// import "../styles/animations.css";

const ChildDetails = ({ child, onClose, setChildren, children, user }) => {
  const [isActive, setIsActive] = useState(child.is_active);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [incidentData, setIncidentData] = useState({
    incidentType: "health",
    description: "",
    target: "manager",
  });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const handleAttendanceChange = async (status) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/children/${child.id}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      const data = await response.json();
      setIsActive(status === "check-in");

      // Update the children list immediately
      const updatedChildren = children.map((c) => {
        if (c.id === child.id) {
          return { ...c, is_active: status === "check-in" ? 1 : 0 };
        }
        return c;
      });
      setChildren(updatedChildren);

      // Show success toast
      if (status === "check-in") {
        toast.success(`${child.full_name} has been checked in successfully!`);
      } else {
        toast.success(`${child.full_name} has been checked out successfully!`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to update attendance: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingIncident(true);
    setError("");

    const requestData = {
      child_id: child.id,
      incident_type: incidentData.incidentType,
      description: incidentData.description,
      target: incidentData.target,
    };

    console.log("Sending incident report:", requestData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/incidents",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Server response:", response.data);
      const { data } = response;

      if (data.message.includes("but email notification failed")) {
        toast.warning("Incident saved but email to parent failed to send");
      } else {
        toast.success(
          incidentData.target === "parent"
            ? "Incident report submitted and email sent to parent!"
            : "Incident report submitted to manager!"
        );
      }

      // Reset form
      setIncidentData({
        incidentType: "health",
        description: "",
        target: "manager",
      });
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || err.message);
      toast.error(
        err.response?.data?.message || "Failed to submit incident report"
      );
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setIncidentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 transition-transform duration-500 z-40 modal-fade-in overflow-auto">
      <div className="flex items-center justify-center h-full my-8">
        <div className="bg-white p-8 my-8 rounded-lg shadow-lg w-[90%] max-w-4xl relative modal-content-slide-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex 
            items-center justify-center rounded-full border border-indigo-600
            focus:outline-none focus:border-[#4299e1] 
            cursor-pointer hover:animate-spin hover:scale-110"
          >
            <FaTimes className="text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Child Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Child Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaBaby className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{child.full_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaInfoCircle className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{child.age} years old</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUser className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Parent Name</p>
                  <p className="font-medium">{child.parent_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaPhone className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Parent Phone</p>
                  <p className="font-medium">{child.parent_phone}</p>
                </div>
              </div>

              {child.parent_email && (
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Parent Email</p>
                    <p className="font-medium">{child.parent_email}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Session Type</p>
                <p className="font-medium capitalize">{child.session_type}</p>
              </div>

              {child.special_care_needs && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Special Care Needs</p>
                  <p className="font-medium">{child.special_care_needs}</p>
                </div>
              )}

              {/* Attendance Section */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Attendance Status</p>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attendance"
                      value="check-in"
                      checked={isActive}
                      onChange={() => handleAttendanceChange("check-in")}
                      className="form-radio text-indigo-600 w-6 h-6"
                      disabled={isLoading}
                    />
                    <span className="flex items-center">
                      <FaSignInAlt className="text-green-500 mr-1" />
                      Check In
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attendance"
                      value="check-out"
                      checked={!isActive}
                      onChange={() => handleAttendanceChange("check-out")}
                      className="form-radio text-indigo-600 w-6 h-6"
                      disabled={isLoading}
                    />
                    <span className="flex items-center">
                      <FaSignOutAlt className="text-red-500 mr-1" />
                      Check Out
                    </span>
                  </label>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>

            {/* Right Column - Incident Report Section */}
            {user.role === "babysitter" && (
              <div className="pt-4 border-t border-gray-200 md:border-t-0 md:border-l md:pl-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <h3 className="text-lg font-medium">Report Incident</h3>
                </div>

                <form onSubmit={handleIncidentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Type
                    </label>
                    <select
                      name="incidentType"
                      value={incidentData.incidentType}
                      onChange={handleIncidentChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="health">Health</option>
                      <option value="behavior">Behavior</option>
                      <option value="well-being">Well-being</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send To:
                    </label>
                    <select
                      name="target"
                      value={incidentData.target}
                      onChange={handleIncidentChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="manager">Manager</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={incidentData.description}
                      onChange={handleIncidentChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      rows="3"
                      placeholder="Describe the incident..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingIncident}
                    className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-lg 
                      ${
                        isSubmittingIncident
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-indigo-700"
                      }`}
                  >
                    {isSubmittingIncident ? "Submitting..." : "Submit Report"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetails;
