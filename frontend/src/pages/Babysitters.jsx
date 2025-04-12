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
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Babysitters
              </h1>
              <nav className="-mb-px flex space-x-8 mt-6">
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
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search babysitters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm sm:leading-6"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Phone
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Children Assigned
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredBabysitters.map((babysitter) => (
                          <tr key={babysitter.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {babysitter.first_name} {babysitter.last_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {babysitter.phone_number}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {babysitter.email}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {babysitter.children_assigned_count}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedBabysitter(babysitter);
                                    setShowInfoPanel(true);
                                  }}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2 cursor-pointer"
                                >
                                  <FaInfoCircle className="h-4 w-4" />
                                  <span>Info</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBabysitter(babysitter);
                                    setShowScheduleForm(true);
                                  }}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2 cursor-pointer"
                                >
                                  <FaCalendarAlt className="h-4 w-4" />
                                  <span>Schedule</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
