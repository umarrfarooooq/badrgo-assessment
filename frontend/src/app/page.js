"use client";

import { useState, useEffect } from "react";
import { getDailySummary } from "@/lib/api";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api" });

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, summaryRes] = await Promise.all([
          api.get("/wallets/stats"),
          getDailySummary(),
        ]);
        setStats(statsRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <strong>Error loading dashboard:</strong> {error}
      </div>
    );
  }

  const statCards = [
    { label: "Total Wallets", value: stats?.totalWallets ?? 0 },
    { label: "Total Balance", value: `$${stats?.totalBalance ?? "0.00"}` },
    { label: "Total Credits", value: `$${stats?.totalCredits ?? "0.00"}` },
    { label: "Total Debits", value: `$${stats?.totalDebits ?? "0.00"}` },
    { label: "Transactions", value: stats?.transactionCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold border-b pb-2">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-5 rounded-xl shadow-sm border text-center"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">
          Recent Daily Activity
        </h2>
        {summary.length === 0 ? (
          <p className="text-gray-500 text-sm">No transaction activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 border-b font-semibold">Date</th>
                  <th className="p-3 border-b font-semibold text-green-600">
                    Credits
                  </th>
                  <th className="p-3 border-b font-semibold text-red-600">
                    Debits
                  </th>
                  <th className="p-3 border-b font-semibold">Transactions</th>
                  <th className="p-3 border-b font-semibold">Active Wallets</th>
                </tr>
              </thead>
              <tbody>
                {summary.slice(0, 5).map((day) => (
                  <tr
                    key={day._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{day._id}</td>
                    <td className="p-3 text-green-600">
                      ${day.totalCredits.toFixed(2)}
                    </td>
                    <td className="p-3 text-red-600">
                      ${day.totalDebits.toFixed(2)}
                    </td>
                    <td className="p-3">{day.transactionCount}</td>
                    <td className="p-3">{day.activeWallets}</td>
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
