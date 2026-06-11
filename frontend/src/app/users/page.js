"use client";

import { useState, useEffect } from "react";
import { createUser, createWallet } from "@/lib/api";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api" });

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return err.response.data.errors.map((e) => e.msg).join(", ");
    }
    return err.response?.data?.error || err.message;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);
      setSubmitting(true);
      const res = await createUser({ name, email, phone: phone || undefined });
      setSuccessMessage(`User "${res.data.name}" created successfully.`);
      setName("");
      setEmail("");
      setPhone("");
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWallet = async (userId) => {
    try {
      setError(null);
      setSuccessMessage(null);
      const res = await createWallet({ userId });
      setSuccessMessage(`Wallet created successfully! Wallet ID: ${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold border-b pb-2">Users</h1>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {successMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+923001234567"
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No users found. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 border-b font-semibold">Name</th>
                  <th className="p-3 border-b font-semibold">Email</th>
                  <th className="p-3 border-b font-semibold">Phone</th>
                  <th className="p-3 border-b font-semibold">Status</th>
                  <th className="p-3 border-b font-semibold">Created</th>
                  <th className="p-3 border-b font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3 text-gray-600">{user.phone || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleCreateWallet(user._id)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100"
                      >
                        Create Wallet
                      </button>
                    </td>
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
