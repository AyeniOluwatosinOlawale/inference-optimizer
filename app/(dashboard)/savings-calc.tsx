'use client';

import { useState } from 'react';

const SAVINGS_RATE = 0.42; // 42% average based on benchmarks

export default function SavingsCalcClient() {
  const [spend, setSpend] = useState('');
  const [requests, setRequests] = useState('');
  const [model, setModel] = useState('claude');

  const monthlySpend = parseFloat(spend) || 0;
  const estimatedSaving = monthlySpend * SAVINGS_RATE;
  const newCost = monthlySpend - estimatedSaving;
  const savingPct = monthlySpend > 0 ? Math.round(SAVINGS_RATE * 100) : 0;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 text-left max-w-2xl mx-auto border border-gray-700">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 font-medium mb-1.5">Monthly LLM spend</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
            <input
              type="number"
              value={spend}
              onChange={e => setSpend(e.target.value)}
              placeholder="10,000"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 font-medium mb-1.5">Monthly requests</label>
          <input
            type="number"
            value={requests}
            onChange={e => setRequests(e.target.value)}
            placeholder="1,000,000"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 font-medium mb-1.5">Primary model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="claude">Claude (Opus)</option>
            <option value="gpt4">GPT-4o</option>
            <option value="gemini">Gemini Pro</option>
          </select>
        </div>
      </div>

      {monthlySpend > 0 ? (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">Estimated optimisation</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Current cost</p>
              <p className="text-xl font-bold text-gray-300 mt-1">£{monthlySpend.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated saving</p>
              <p className="text-xl font-bold text-orange-400 mt-1">£{Math.round(estimatedSaving).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">New cost</p>
              <p className="text-xl font-bold text-green-400 mt-1">£{Math.round(newCost).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Saving</span>
              <span className="text-orange-400 font-semibold">↓ {savingPct}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${savingPct}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">
            Based on benchmark data · Actual savings depend on workload mix
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700 text-center text-gray-500 text-sm">
          Enter your monthly spend to see estimated savings
        </div>
      )}
    </div>
  );
}
