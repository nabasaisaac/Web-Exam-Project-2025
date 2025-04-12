import React, { useState } from "react";
import {
  FaTimes,
  FaTrash,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUserFriends,
} from "react-icons/fa";

const BabysitterInfoPanel = ({
  babysitter,
  onClose,
  onDelete,
  onAssignChildren,
}) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock children data - replace with actual data from your backend
  const children = [
    { id: 1, name: "John Doe", age: 5 },
    { id: 2, name: "Jane Smith", age: 4 },
    { id: 3, name: "Mike Johnson", age: 6 },
    { id: 4, name: "Sarah Williams", age: 5 },
    { id: 5, name: "David Brown", age: 4 },
  ];

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this babysitter?")) {
      onDelete(babysitter.id);
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    onAssignChildren(babysitter.id, selectedChildren);
    setShowAssignForm(false);
    setSelectedChildren([]);
    setSearchTerm("");
  };

  const toggleChildSelection = (childId) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-40 animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-center min-h-full py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-4xl relative animate-slide-up my-12">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-indigo-600 focus:outline-none focus:border-[#4299e1] cursor-pointer hover:animate-spin hover:scale-110"
          >
            <FaTimes className="text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Babysitter Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {babysitter.firstName} {babysitter.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{babysitter.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaPhone className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{babysitter.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaIdCard className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">NIN</p>
                  <p className="font-medium">{babysitter.nin}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUserFriends className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{babysitter.age}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Next of Kin and Children */}
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Next of Kin
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {babysitter.nextOfKinName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {babysitter.nextOfKinPhone}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Assigned Children
                  </h3>
                  <button
                    onClick={() => setShowAssignForm(!showAssignForm)}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Assign
                  </button>
                </div>

                {/* Assign Children Form */}
                {showAssignForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search children..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-4 max-h-40 overflow-y-auto">
                      {filteredChildren.map((child) => (
                        <div
                          key={child.id}
                          className={`p-2 cursor-pointer rounded-md ${
                            selectedChildren.includes(child.id)
                              ? "bg-indigo-50 text-indigo-600"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleChildSelection(child.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedChildren.includes(child.id)}
                              onChange={() => toggleChildSelection(child.id)}
                              className="mr-2"
                            />
                            <span>
                              {child.name} (Age: {child.age})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAssignForm(false);
                          setSearchTerm("");
                          setSelectedChildren([]);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignSubmit}
                        className="px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Assign Selected
                      </button>
                    </div>
                  </div>
                )}

                {/* Assigned Children List */}
                {babysitter.childrenAssigned?.length > 0 ? (
                  <div className="space-y-2">
                    {babysitter.childrenAssigned.map((child, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <span>{child}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = babysitter.childrenAssigned.filter(
                              (c) => c !== child
                            );
                            onAssignChildren(babysitter.id, updated);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No children assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaTrash className="mr-2" />
              Delete Babysitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterInfoPanel;
