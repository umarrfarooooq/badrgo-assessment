"use client";

import { useState } from "react";
import {
  getWallet,
  creditWallet,
  debitWallet,
  getTransactions,
} from "@/lib/api";

export default function WalletsPage() {
  const [walletId, setWalletId] = useState("");
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("");

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return err.response.data.errors.map((e) => e.msg).join(", ");
    }
    return err.response?.data?.error || err.message;
  };

  const loadWallet = async () => {
    if (!walletId) return;
    try {
      setError(null);
      setWalletLoading(true);
      const res = await getWallet(walletId);
      setWalletData(res.data);
      const txRes = await getTransactions(walletId);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      setError(getErrorMessage(err));
      setWalletData(null);
      setTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleOperation = async (type) => {
    try {
      setError(null);
      setOperationLoading(true);
      const payload = { amount: Number(amount), referenceId, description };
      if (type === "credit") {
        await creditWallet(walletId, payload);
      } else {
        await debitWallet(walletId, payload);
      }
      setAmount("");
      setReferenceId("");
      setDescription("");
      await loadWallet();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold border-b pb-2">Wallet Management</h1>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          placeholder="Enter Wallet ID"
          className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={loadWallet}
          disabled={walletLoading}
          className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {walletLoading ? "Loading..." : "Load"}
        </button>
      </div>

      {walletData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Wallet Details
            </h2>
            <div className="text-lg">
              <span className="text-gray-500">Balance: </span>
              <span className="font-bold text-3xl block mt-1">
                $
                {parseFloat(
                  walletData.balance.$numberDecimal || walletData.balance,
                ).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status: </span>
              <span
                className={`font-medium ${walletData.status === "active" ? "text-green-600" : "text-red-600"}`}
              >
                {walletData.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-400 break-all">
              ID: {walletData._id}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Operations</h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="Reference ID"
                className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (Optional)"
              className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleOperation("credit")}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Credit
              </button>
              <button
                onClick={() => handleOperation("debit")}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Debit
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Transaction History
            </h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 border-b">Type</th>
                      <th className="p-3 border-b">Amount</th>
                      <th className="p-3 border-b">Before</th>
                      <th className="p-3 border-b">After</th>
                      <th className="p-3 border-b">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx._id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${tx.type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-medium">
                          $
                          {parseFloat(
                            tx.amount.$numberDecimal || tx.amount,
                          ).toFixed(2)}
                        </td>
                        <td className="p-3 text-gray-500">
                          $
                          {parseFloat(
                            tx.balanceBefore.$numberDecimal || tx.balanceBefore,
                          ).toFixed(2)}
                        </td>
                        <td className="p-3 text-gray-500">
                          $
                          {parseFloat(
                            tx.balanceAfter.$numberDecimal || tx.balanceAfter,
                          ).toFixed(2)}
                        </td>
                        <td className="p-3 text-gray-500 font-mono text-xs">
                          {tx.referenceId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
