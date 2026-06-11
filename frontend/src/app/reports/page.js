"use client";

import { useState, useEffect } from "react";
import { getDailySummary } from "@/lib/api";

export default function ReportsPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return err.response.data.errors.map((e) => e.msg).join(", ");
    }
    return err.response?.data?.error || err.message;
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await getDailySummary(params);
      setSummary(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold border-b pb-2">Daily Summary Report</h1>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchSummary}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
          >
            Apply Filter
          </button>
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
                setTimeout(fetchSummary, 0);
              }}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading report...</p>
        ) : summary.length === 0 ? (
          <p className="text-gray-500">
            No data found for the selected period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold text-green-600">
                    Total Credits
                  </th>
                  <th className="p-4 font-semibold text-red-600">
                    Total Debits
                  </th>
                  <th className="p-4 font-semibold">Transactions</th>
                  <th className="p-4 font-semibold">Active Wallets</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((day) => (
                  <tr
                    key={day._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">{day._id}</td>
                    <td className="p-4 text-green-600">
                      ${day.totalCredits.toFixed(2)}
                    </td>
                    <td className="p-4 text-red-600">
                      ${day.totalDebits.toFixed(2)}
                    </td>
                    <td className="p-4">{day.transactionCount}</td>
                    <td className="p-4">{day.activeWallets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
