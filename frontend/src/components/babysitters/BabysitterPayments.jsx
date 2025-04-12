import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BabysitterPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/babysitters/schedules",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Filter for approved schedules and calculate payments
        const calculatedPayments = response.data
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
        setPayments(calculatedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const calculateAmount = (sessionType, childrenCount) => {
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
      await axios.put(
        `http://localhost:5000/api/babysitters/payments/${paymentId}/clear`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayments(
        payments.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: "completed" }
            : payment
        )
      );

      Swal.fire("Success!", "Payment approved successfully.", "success");
    } catch (error) {
      console.error("Error approving payment:", error);
      Swal.fire("Error!", "Failed to approve payment.", "error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {payment.first_name} {payment.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(payment.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {payment.session_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {payment.children_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatCurrency(payment.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    payment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {payment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {payment.status === "pending" && (
                  <button
                    onClick={() => handleApprovePayment(payment.id)}
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
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
  );
};

export default BabysitterPayments;
