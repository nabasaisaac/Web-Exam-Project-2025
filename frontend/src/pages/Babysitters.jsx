import React, { useState } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaUserClock,
  FaInfoCircle,
} from "react-icons/fa";
import BabysitterInfoPanel from "../components/babysitters/BabysitterInfoPanel";

const Babysitters = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedBabysitter, setSelectedBabysitter] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
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

  const babysitters = [
    {
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "+256 701234567",
      nin: "CM12345678XYZ",
      age: 25,
      nextOfKinName: "John Doe",
      nextOfKinPhone: "+256 702345678",
      status: "active",
      childrenAssigned: 3,
      paymentRate: {
        "half-day": 2000,
        "full-day": 5000,
      },
      schedule: [
        {
          date: "2024-04-15",
          startTime: "08:00",
          endTime: "17:00",
          sessionType: "full-day",
          childrenAssigned: ["Child 1", "Child 2", "Child 3"],
          status: "completed",
        },
      ],
      payments: [
        {
          date: "2024-04-15",
          sessionType: "full-day",
          childrenCount: 3,
          amount: 15000,
          status: "paid",
        },
      ],
    },
    {
      id: 2,
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@example.com",
      phone: "+256 703456789",
      nin: "CM87654321XYZ",
      age: 28,
      nextOfKinName: "Sarah Smith",
      nextOfKinPhone: "+256 704567890",
      status: "active",
      childrenAssigned: 2,
      paymentRate: {
        "half-day": 2000,
        "full-day": 5000,
      },
      schedule: [
        {
          date: "2024-04-15",
          startTime: "08:00",
          endTime: "12:00",
          sessionType: "half-day",
          childrenAssigned: ["Child 1", "Child 2"],
          status: "completed",
        },
      ],
      payments: [
        {
          date: "2024-04-15",
          sessionType: "half-day",
          childrenCount: 2,
          amount: 4000,
          status: "paid",
        },
      ],
    },
  ];

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

  const handleDeleteBabysitter = (id) => {
    // TODO: Implement delete functionality
    console.log("Delete babysitter:", id);
    setShowInfoPanel(false);
  };

  const handleAssignChildren = (id, children) => {
    // TODO: Implement assign children functionality
    console.log("Assign children:", id, children);
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
              <div className="grid grid-cols-1 gap-6">
                {babysitters.map((babysitter) => (
                  <div
                    key={babysitter.id}
                    className="bg-white border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {babysitter.firstName} {babysitter.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Age: {babysitter.age} | Children Assigned:{" "}
                          {babysitter.childrenAssigned?.length || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact: {babysitter.phone} | Email:{" "}
                          {babysitter.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          NIN: {babysitter.nin}
                        </p>
                        <p className="text-sm text-gray-500">
                          Next of Kin: {babysitter.nextOfKinName} (
                          {babysitter.nextOfKinPhone})
                        </p>
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
            </div>
          )}

          {activeTab === "payments" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Records
              </h2>
              <div className="space-y-4">
                {babysitters.map((babysitter) => (
                  <div
                    key={babysitter.id}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {babysitter.firstName} {babysitter.lastName}
                    </h3>
                    <div className="space-y-2">
                      {babysitter.payments.map((payment, index) => (
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
                ))}
              </div>
            </div>
          )}

          {activeTab === "schedules" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Schedules
              </h2>
              <div className="space-y-4">
                {babysitters.map((babysitter) => (
                  <div
                    key={babysitter.id}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {babysitter.firstName} {babysitter.lastName}
                    </h3>
                    <div className="space-y-2">
                      {babysitter.schedule.map((schedule, index) => (
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
                              {schedule.childrenAssigned.length} children
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
                ))}
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
