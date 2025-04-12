import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

const BabysitterPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching payments with token:", token);

        // Fetch approved schedules
        const schedulesResponse = await axios.get(
          "http://localhost:5000/api/babysitters/schedules",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Schedules response:", schedulesResponse.data);

        // Process pending payments
        const pendingPayments = schedulesResponse.data
          .filter((schedule) => schedule.status === "approved")
          .map((schedule) => {
            const childrenCount = schedule.children_assigned_count || 0;
            const amount = calculateAmount(
              schedule.session_type,
              childrenCount
            );
            return {
              id: schedule.id,
              first_name: schedule.first_name,
              last_name: schedule.last_name,
              date: schedule.date,
              session_type: schedule.session_type,
              children_count: childrenCount,
              amount: amount,
              status: "pending",
            };
          });
        console.log("Pending payments:", pendingPayments);

        // Fetch completed payments
        const transactionsResponse = await axios.get(
          "http://localhost:5000/api/financial/transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { type: "expense", category: "babysitter-salary" },
          }
        );
        console.log("Transactions response:", transactionsResponse.data);

        // Process completed payments
        const completedPayments = transactionsResponse.data
          .filter((transaction) => transaction.babysitter_id) // Only include transactions with babysitter_id
          .map((transaction) => {
            const childrenCount = transaction.children_count || 0;
            const amount =
              transaction.amount ||
              calculateAmount(
                transaction.session_type || "full-day",
                childrenCount
              );
            return {
              id: transaction.id,
              first_name: transaction.first_name || "Unknown",
              last_name: transaction.last_name || "Unknown",
              date: transaction.date,
              session_type: transaction.session_type || "full-day",
              children_count: childrenCount,
              amount: amount,
              status: "completed",
            };
          });
        console.log("Completed payments:", completedPayments);

        // Combine and sort by date
        const allPayments = [...pendingPayments, ...completedPayments].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        console.log("All payments:", allPayments);

        setPayments(allPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch payments. Please check the console for details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const calculateAmount = (sessionType, childrenCount) => {
    if (!childrenCount || childrenCount === 0) return 0;
    const rate = sessionType === "full-day" ? 5000 : 2000;
    return rate * childrenCount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/babysitters/payments/${paymentId}/clear`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Payment Approved",
        text: "The payment has been approved and recorded successfully.",
      });

      // Fetch approved schedules
      const schedulesResponse = await axios.get(
        "http://localhost:5000/api/babysitters/schedules",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Process pending payments
      const pendingPayments = schedulesResponse.data
        .filter((schedule) => schedule.status === "approved")
        .map((schedule) => ({
          id: schedule.id,
          first_name: schedule.first_name,
          last_name: schedule.last_name,
          date: schedule.date,
          session_type: schedule.session_type,
          children_count: schedule.children_assigned_count,
          amount: calculateAmount(
            schedule.session_type,
            schedule.children_assigned_count
          ),
          status: "pending",
        }));

      // Fetch completed payments
      const transactionsResponse = await axios.get(
        "http://localhost:5000/api/financial/transactions",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "expense" },
        }
      );

      // Process completed payments
      const completedPayments = transactionsResponse.data.map(
        (transaction) => ({
          id: transaction.id,
          first_name: transaction.first_name,
          last_name: transaction.last_name,
          date: transaction.date,
          session_type: transaction.session_type || "full-day",
          children_count: transaction.children_count || 0,
          amount: transaction.amount,
          status: "completed",
        })
      );

      // Combine and sort by date
      const allPayments = [...pendingPayments, ...completedPayments].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPayments(allPayments);
    } catch (error) {
      console.error("Error approving payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve payment. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaMoneyBillWave className="text-indigo-500 mr-2" />
              Babysitter Payments
            </h2>
          </div>

          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Session Type
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Children Count
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {payment.first_name} {payment.last_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {payment.session_type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {payment.children_count}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === "completed"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status === "completed" ? (
                                <span className="flex items-center">
                                  <FaCheckCircle className="mr-1" />
                                  Approved
                                </span>
                              ) : (
                                "Pending"
                              )}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {payment.status !== "completed" && (
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                              >
                                Approve
                              </button>
                            )}
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
  );
};

export default BabysitterPayments;
