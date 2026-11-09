"use client";

import React, { useState, useEffect } from "react";

interface Step {
  targetSelector: string;
  title: string;
  description: string;
}

export const GuidedWalkthroughOverlay: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const steps: Step[] = [
    {
      targetSelector: "#create-app-view-trigger",
      title: "1. Create New Application",
      description: "Click here to scaffold multi-chain project configurations and configure baseline Web3 contracts.",
    },
    {
      targetSelector: "#real-adapters-hub-trigger",
      title: "2. Real Adapters Hub",
      description: "Manage custom Web3 RPC endpoints, Solana cluster connections, and Viem WebSocket transport bindings.",
    },
  ];

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem("shipyard_walkthrough_completed");
    if (!hasSeenWalkthrough) {
      setActiveStepIndex(0);
    }
  }, []);

  if (activeStepIndex === null) return null;

  const currentStep = steps[activeStepIndex];

  const handleNext = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      localStorage.setItem("shipyard_walkthrough_completed", "true");
      setActiveStepIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-slate-950 p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
        <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-400 mb-2">
          {currentStep.title}
        </h4>
        <p className="text-xs text-slate-300 mb-6 font-sans leading-relaxed">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="font-mono text-[10px] text-slate-500">
            Step {activeStepIndex + 1} of {steps.length}
          </span>
          <button
            onClick={handleNext}
            className="rounded-lg border border-cyan-500/60 bg-cyan-950/40 px-4 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
          >
            {activeStepIndex === steps.length - 1 ? "Finish Tour" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};
