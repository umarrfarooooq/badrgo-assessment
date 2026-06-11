'use client';

import { useState } from 'react';
import { createUser, createWallet } from '@/lib/api';

export default function SetupPage() {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return err.response.data.errors.map(e => e.msg).join(', ');
    }
    return err.response?.data?.error || err.message;
  };

  const handleCreateUser = async () => {
    try {
      setError(null);
      setResult(null);
      const res = await createUser({ name: 'Test User', email: `test${Date.now()}@test.com` });
      setResult(`Success! User created with ID: ${res.data._id}`);
      setUserId(res.data._id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateWallet = async () => {
    if (!userId) {
      setError('Please provide a User ID first.');
      return;
    }
    try {
      setError(null);
      setResult(null);
      const res = await createWallet({ userId });
      setResult(`Success! Wallet created with ID: ${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold border-b pb-2">Setup</h1>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          {result}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 1: Create a User</h2>
          <button 
            onClick={handleCreateUser}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Generate Random User
          </button>
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="text-xl font-semibold mb-2">Step 2: Create a Wallet</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="Paste User ID here"
              className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleCreateWallet}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
