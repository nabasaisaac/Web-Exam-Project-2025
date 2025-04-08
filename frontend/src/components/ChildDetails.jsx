import React from "react";
import {
  FaTimes,
  FaBaby,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/animations.css";

const ChildDetails = ({ child, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 transition-transform duration-500 z-40 modal-fade-in">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md relative modal-content-slide-in">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetails;
