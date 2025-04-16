import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilePdf,
  FaFileCsv,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BabysitterFinance = () => {
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Get babysitter ID from user info
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers }
        );
        const babysitterId = userResponse.data.id;

        // Fetch all required data
        const [paymentsResponse, schedulesResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/babysitters/${babysitterId}/payments`,
            { headers }
          ),
          axios.get(
            `http://localhost:5000/api/babysitters/${babysitterId}/schedules`,
            { headers }
          ),
        ]);

        setPayments(paymentsResponse.data);
        setSchedules(schedulesResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching finance data:", error);
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch finance data. Please try again later.",
        });
      }
    };

    fetchFinanceData();
  }, []);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Babysitter Payment History", 14, 15);

      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

      // Prepare data for the table
      const tableData = payments.map((payment) => [
        new Date(payment.date).toLocaleDateString(),
        payment.session_type,
        payment.children_count,
        `UGX ${parseFloat(payment.amount).toLocaleString()}`,
        payment.status,
      ]);

      // Add the table
      autoTable(doc, {
        head: [["Date", "Session Type", "Children Count", "Amount", "Status"]],
        body: tableData,
        startY: 35,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
      });

      // Save the PDF
      doc.save(
        `babysitter-payments-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate PDF. Please try again later.",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      // Prepare CSV content
      const headers = [
        "Date",
        "Session Type",
        "Children Count",
        "Amount",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...payments.map((payment) =>
          [
            new Date(payment.date).toLocaleDateString(),
            payment.session_type,
            payment.children_count,
            `UGX ${parseFloat(payment.amount).toLocaleString()}`,
            payment.status,
          ].join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `babysitter-payments-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating CSV:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate CSV. Please try again later.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Finance</h1>
          <div className="space-x-2">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <FaFileCsv className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment History
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Children Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.session_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.children_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        UGX {parseFloat(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Schedules */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Schedules
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {schedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(schedule.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.session_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.start_time} - {schedule.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                schedule.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : schedule.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : schedule.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {schedule.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No schedules found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabysitterFinance;
