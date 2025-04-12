import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaUserClock,
  FaInfoCircle,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import BabysitterInfoPanel from "../components/babysitters/BabysitterInfoPanel";
import axios from "axios";

const Babysitters = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedBabysitter, setSelectedBabysitter] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nin: "",
    age: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
  });

  const [paymentData, setPaymentData] = useState({
    babysitterId: "",
    date: new Date().toISOString().split("T")[0],
    sessionType: "full-day",
    childrenCount: 1,
    amount: 0,
    status: "pending",
  });

  const [scheduleData, setScheduleData] = useState({
    babysitterId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "17:00",
    sessionType: "full-day",
    childrenAssigned: [],
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch babysitters from backend
  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/babysitters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Sort babysitters by first name in ascending order
        const sortedBabysitters = response.data.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        );
        setBabysitters(sortedBabysitters);
        setError(null);
      } catch (err) {
        console.error("Error fetching babysitters:", err);
        setError("Failed to load babysitters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  // Filter babysitters based on search term
  const filteredBabysitters = babysitters.filter((babysitter) => {
    const searchString =
      `${babysitter.first_name} ${babysitter.last_name} ${babysitter.nin} ${babysitter.email} ${babysitter.phone}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const calculatePayment = (sessionType, childrenCount) => {
    const rate = sessionType === "full-day" ? 5000 : 2000;
    return rate * childrenCount;
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = calculatePayment(
      paymentData.sessionType,
      paymentData.childrenCount
    );
    setPaymentData({ ...paymentData, amount });
    // TODO: Implement actual payment logic
    setShowPaymentForm(false);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual schedule logic
    setShowScheduleForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  const handleDeleteBabysitter = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/babysitters/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBabysitters(babysitters.filter((b) => b.id !== id));
      setShowInfoPanel(false);
    } catch (error) {
      console.error("Error deleting babysitter:", error);
    }
  };

  const handleAssignChildren = async (id, children) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/babysitters/${id}/assign-children`,
        { children },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state
      setBabysitters(
        babysitters.map((b) =>
          b.id === id ? { ...b, children_assigned: children } : b
        )
      );
    } catch (error) {
      console.error("Error assigning children:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Babysitters Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage babysitters, payments, and schedules
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Register New Babysitter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["list", "payments", "schedules"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === "list" && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">{error}</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredBabysitters.map((babysitter) => (
                    <div
                      key={babysitter.id}
                      className="bg-white border-1 border-indigo-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {babysitter.first_name} {babysitter.last_name}
                          </h3>
                          <div className="flex flex-col space-y-1 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {babysitter.phone}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {babysitter.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBabysitter(babysitter);
                              setShowInfoPanel(true);
                            }}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2 cursor-pointer"
                          >
                            <FaInfoCircle className="mr-1.5" /> Info
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBabysitter(babysitter);
                              setShowScheduleForm(true);
                            }}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2 cursor-pointer"
                          >
                            <FaCalendarAlt className="mr-1.5" /> Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Search Bar - Moved to bottom */}
              <div className="mt-6">
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search babysitters by name, phone, or email..."
                    className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Records
              </h2>
              <div className="space-y-4">
                {babysitters.length > 0 ? (
                  babysitters.map((babysitter) => (
                    <div
                      key={babysitter.id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {babysitter.first_name} {babysitter.last_name}
                      </h3>
                      <div className="space-y-2">
                        {babysitter.payments?.map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <div>
                              <span className="text-gray-900">
                                {payment.date}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {payment.sessionType} ({payment.childrenCount}{" "}
                                children)
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  payment.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No payment records found
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "schedules" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Schedules
              </h2>
              <div className="space-y-4">
                {babysitters.length > 0 ? (
                  babysitters.map((babysitter) => (
                    <div
                      key={babysitter.id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {babysitter.first_name} {babysitter.last_name}
                      </h3>
                      <div className="space-y-2">
                        {babysitter.schedule?.map((schedule, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <div>
                              <span className="text-gray-900">
                                {schedule.date}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({schedule.sessionType})
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-500">
                                {schedule.childrenAssigned?.length || 0}{" "}
                                children
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  schedule.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {schedule.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No schedules found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      {showInfoPanel && selectedBabysitter && (
        <BabysitterInfoPanel
          babysitter={selectedBabysitter}
          onClose={() => setShowInfoPanel(false)}
          onDelete={handleDeleteBabysitter}
          onAssignChildren={handleAssignChildren}
        />
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">
              Register New Babysitter
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  National ID Number
                </label>
                <input
                  type="text"
                  name="nin"
                  value={formData.nin}
                  onChange={(e) =>
                    setFormData({ ...formData, nin: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                  min="21"
                  max="35"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Next of Kin Name
                </label>
                <input
                  type="text"
                  name="nextOfKinName"
                  value={formData.nextOfKinName}
                  onChange={(e) =>
                    setFormData({ ...formData, nextOfKinName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Next of Kin Phone
                </label>
                <input
                  type="tel"
                  name="nextOfKinPhone"
                  value={formData.nextOfKinPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, nextOfKinPhone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Type
                </label>
                <select
                  name="sessionType"
                  value={paymentData.sessionType}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      sessionType: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="half-day">Half Day (2,000K per child)</option>
                  <option value="full-day">Full Day (5,000K per child)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Children
                </label>
                <input
                  type="number"
                  name="childrenCount"
                  value={paymentData.childrenCount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      childrenCount: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="text"
                  value={formatCurrency(
                    calculatePayment(
                      paymentData.sessionType,
                      paymentData.childrenCount
                    )
                  )}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  readOnly
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Create Schedule</h2>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={scheduleData.date}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={scheduleData.startTime}
                    onChange={(e) =>
                      setScheduleData({
                        ...scheduleData,
                        startTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={scheduleData.endTime}
                    onChange={(e) =>
                      setScheduleData({
                        ...scheduleData,
                        endTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Type
                </label>
                <select
                  name="sessionType"
                  value={scheduleData.sessionType}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      sessionType: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="half-day">Half Day</option>
                  <option value="full-day">Full Day</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Children to Assign
                </label>
                <select
                  multiple
                  name="childrenAssigned"
                  value={scheduleData.childrenAssigned}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      childrenAssigned: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Child 1">Child 1</option>
                  <option value="Child 2">Child 2</option>
                  <option value="Child 3">Child 3</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Babysitters;
