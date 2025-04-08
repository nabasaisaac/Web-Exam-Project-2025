import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/auth.css";

const Children = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    specialNeeds: "",
    duration: "full-day",
  });

  const [errors, setErrors] = useState({
    parentEmail: "",
    parentPhone: "",
  });

  const children = [
    {
      id: 1,
      fullName: "Sarah Johnson",
      age: 4,
      parentName: "John Johnson",
      parentPhone: "+256 701234567",
      specialNeeds: "None",
      duration: "full-day",
      status: "present",
    },
    {
      id: 2,
      fullName: "Michael Brown",
      age: 3,
      parentName: "Mary Brown",
      parentPhone: "+256 702345678",
      specialNeeds: "Allergic to peanuts",
      duration: "half-day",
      status: "absent",
    },
    // Add more sample data as needed
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Basic phone validation - allows +, numbers, and spaces
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email and phone
    const emailValid = validateEmail(formData.parentEmail);
    const phoneValid = validatePhone(formData.parentPhone);

    if (!emailValid || !phoneValid) {
      setErrors({
        parentEmail: !emailValid ? "Please enter a valid email address" : "",
        parentPhone: !phoneValid ? "Please enter a valid phone number" : "",
      });
      return;
    }

    // TODO: Implement actual registration logic
    setShowRegistrationForm(false);
    setFormData({
      fullName: "",
      age: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      specialNeeds: "",
      duration: "full-day",
    });
    setErrors({
      parentEmail: "",
      parentPhone: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (name === "parentEmail" || name === "parentPhone") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Children</h1>
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg focus:outline-none focus:border-[#4299e1] border-2 border-transparent hover:bg-indigo-700 transition"
          >
            Register New Child
          </button>
        </div>

        {/* Slide-in Overlay */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black/70 transition-transform duration-500 z-40 ${
            showRegistrationForm ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Centered Registration Info Box */}
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
              {/* Close Button */}
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 focus:outline-none focus:border-[#4299e1]"
              >
                <FaTimes className="text-gray-500" />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">
                Register New Child
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Child's Full Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Email"
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-[#4299e1] ${
                      errors.parentEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.parentEmail && (
                    <p className="text-red-500 text-sm">{errors.parentEmail}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent/Guardian Phone"
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-[#4299e1] ${
                      errors.parentPhone ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.parentPhone && (
                    <p className="text-red-500 text-sm">{errors.parentPhone}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleChange}
                    placeholder="Special Needs"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                    rows="3"
                  />
                </div>
                <div className="space-y-1">
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4299e1]"
                  >
                    <option value="half-day">Half Day</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg focus:outline-none focus:border-[#4299e1] border-2 border-transparent"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {children.map((child) => (
                <li key={child.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              child.status === "present"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">
                            {child.fullName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Age: {child.age} | Duration: {child.duration}
                          </p>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center space-x-4">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Parent: {child.parentName} ({child.parentPhone})
                      </p>
                      {child.specialNeeds && (
                        <p className="text-sm text-gray-500">
                          Special Needs: {child.specialNeeds}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Children;
