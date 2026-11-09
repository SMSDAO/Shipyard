"use client";

import React, { useState } from "react";
import { trackAndSyncDeployment } from "../../lib/web3/deploymentWatcher";

interface TestnetDeployProps {
  appId: string;
  appName: string;
  targetTestnet?: "ARBITRUM_SEPOLIA" | "BASE_SEPOLIA" | "SOLANA_DEVNET";
}

export const TestnetDeployTrigger: React.FC<TestnetDeployProps> = ({
  appId,
  appName,
  targetTestnet = "ARBITRUM_SEPOLIA",
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const handleDeployToTestnet = async () => {
    setIsDeploying(true);
    setDeployStatus("Initializing Testnet Contract...");

    try {
      // 1. Post deployment record to database
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: `${appName} [TESTNET]`,
          chain: targetTestnet,
          logs: `[${new Date().toISOString()}] Initiated Testnet simulated deployment.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment setup failed");

      setDeployStatus("Broadcasting to Testnet Mempool...");

      // 2. Simulate broadcast receipt with mock tx hash for testnet sandbox validation
      const mockTestnetTxHash = `0xtest_${Math.random().toString(16).substring(2, 10)}`;

      await trackAndSyncDeployment({
        deploymentId: data.deployment.id,
        txHash: mockTestnetTxHash as `0x${string}`,
        onSuccess: (contractAddress) => {
          setDeployStatus(`Success! Address: ${contractAddress.slice(0, 8)}...`);
          setIsDeploying(false);
        },
        onError: (err) => {
          setDeployStatus(`Failed: ${err}`);
          setIsDeploying(false);
        },
      });
    } catch (err: any) {
      setDeployStatus(`Error: ${err.message}`);
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDeployToTestnet}
        disabled={isDeploying}
        className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/50 bg-violet-950/40 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-violet-300 transition-all hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 cursor-pointer"
      >
        <span>🧪</span> {isDeploying ? "Deploying to Testnet..." : `Deploy to ${targetTestnet}`}
      </button>
      {deployStatus && (
        <span className="font-mono text-[10px] text-violet-400 text-center animate-pulse">
          {deployStatus}
        </span>
      )}
    </div>
  );
};
