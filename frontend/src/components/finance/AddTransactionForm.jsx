import React, { useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const AddTransactionForm = ({ onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    reference_id: "",
    reference_type: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/babysitters/search?q=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching babysitters:", error);
      Swal.fire("Error", "Failed to search babysitters", "error");
    }
  };

  const handleSelectBabysitter = (babysitter) => {
    setFormData({
      ...formData,
      reference_id: babysitter.id,
      reference_type: "babysitter",
    });
    setSearchTerm(`${babysitter.first_name} ${babysitter.last_name}`);
    setShowSearchResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/financial/transactions",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Success", "Transaction added successfully", "success");
      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      Swal.fire("Error", "Failed to add transaction", "error");
    }
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
            Add New Transaction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="babysitter-salary">Babysitter Salary</option>
                  <option value="babysitter-payment">Babysitter Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reference (Babysitter)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search babysitter..."
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {showSearchResults && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                    {searchResults.map((babysitter) => (
                      <div
                        key={babysitter.id}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                        onClick={() => handleSelectBabysitter(babysitter)}
                      >
                        {babysitter.first_name} {babysitter.last_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none cursor-pointer"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionForm;
