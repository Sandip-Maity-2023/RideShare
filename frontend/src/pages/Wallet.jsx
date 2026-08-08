import React, { useState } from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';

const Wallet = () => {
  const [balance, setBalance] = useState(450.0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const handleRecharge = (e) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount <= 0) return;

    // Simulate Razorpay sandbox payment credit
    setBalance((prev) => prev + amount);
    setRechargeAmount('');
    setShowRechargeModal(false);
    alert(`Wallet successfully recharged with ₹${amount}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Wallet Balance Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <p className="text-xs uppercase font-semibold text-blue-100 tracking-wider">
            Available Wallet Balance
          </p>
          <h1 className="text-3xl font-extrabold mt-1">₹{balance.toFixed(2)}</h1>
        </div>

        <button
          onClick={() => setShowRechargeModal(true)}
          className="px-4 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Recharge Wallet</span>
        </button>
      </div>

      {/* Payment Options Matrix */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Supported Trip Payment Methods
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Wallet', 'UPI', 'Card', 'Cash'].map((method) => (
            <div
              key={method}
              className="p-3 border border-gray-200 rounded-xl flex items-center space-x-2 bg-gray-50 text-gray-700 font-semibold text-xs"
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>{method}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Wallet Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Recent Transactions
        </h2>

        <div className="divide-y divide-gray-100">
          <div className="py-3 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Trip Fare - Raj Patel</p>
                <p className="text-xs text-gray-400">09 Aug 2026, 05:30 PM</p>
              </div>
            </div>
            <span className="font-bold text-red-600">- ₹150.00</span>
          </div>

          <div className="py-3 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Razorpay Top-Up</p>
                <p className="text-xs text-gray-400">08 Aug 2026, 11:00 AM</p>
              </div>
            </div>
            <span className="font-bold text-green-600">+ ₹500.00</span>
          </div>
        </div>
      </div>

      {/* Sandbox Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Recharge Wallet (Sandbox)</h3>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Enter Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;