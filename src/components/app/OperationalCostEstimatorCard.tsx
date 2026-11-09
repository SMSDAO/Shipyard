"use client";

import React, { useState } from "react";

interface CostEstimatorProps {
  selectedChains: string[];
}

export const OperationalCostEstimatorCard: React.FC<CostEstimatorProps> = ({ selectedChains }) => {
  const [monthlyTx, setMonthlyTx] = useState<number>(10000);

  // Cost calculation matrices (USD)
  const calculateCosts = () => {
    const baseDbCost = 15; // PostgreSQL Base
    const rpcBase = monthlyTx > 50000 ? 49 : 0; // RPC tier
    
    let gasMultiplier = 0;
    if (selectedChains.includes("Ethereum")) gasMultiplier += 0.05;
    if (selectedChains.includes("Arbitrum One")) gasMultiplier += 0.002;
    if (selectedChains.includes("Base L2")) gasMultiplier += 0.001;
    if (selectedChains.includes("Solana")) gasMultiplier += 0.0001;

    const estimatedGasUSD = (monthlyTx * (gasMultiplier || 0.001)).toFixed(2);
    const totalCost = (baseDbCost + rpcBase + parseFloat(estimatedGasUSD)).toFixed(2);

    return { baseDbCost, rpcBase, estimatedGasUSD, totalCost };
  };

  const costs = calculateCosts();

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-400">
          ⚡ Estimated Monthly Operational Cost
        </h3>
        <span className="font-mono text-xs text-slate-400">Real-Time Estimator</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between font-mono text-xs text-slate-300 mb-2">
            <span>Expected Monthly Transactions:</span>
            <span className="font-bold text-cyan-300">{monthlyTx.toLocaleString()} txs</span>
          </div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={monthlyTx}
            onChange={(e) => setMonthlyTx(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block">DB Infrastructure</span>
            <span className="text-slate-200 font-semibold">${costs.baseDbCost}/mo</span>
          </div>
          <div>
            <span className="text-slate-500 block">RPC Services</span>
            <span className="text-slate-200 font-semibold">${costs.rpcBase}/mo</span>
          </div>
          <div>
            <span className="text-slate-500 block">Est. Onchain Gas</span>
            <span className="text-amber-400 font-semibold">${costs.estimatedGasUSD}/mo</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="font-mono text-xs uppercase text-slate-400">Total Estimated Overhead:</span>
          <span className="font-mono text-2xl font-bold text-emerald-400 shadow-[0_0_10px_#10b981]">
            ${costs.totalCost} <span className="text-xs text-slate-400 font-normal">/ month</span>
          </span>
        </div>
      </div>
    </div>
  );
};
