"use client";

import React, { useState } from "react";

export const GitHubSyncPanel: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [isLinked, setIsLinked] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(true);

  const handleLinkRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    setIsLinked(true);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span>🐙</span> GitHub Webhook & GitOps Automation
        </h3>
        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${isLinked ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`}>
          {isLinked ? "SYNC ACTIVE" : "DISCONNECTED"}
        </span>
      </div>

      <form onSubmit={handleLinkRepo} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Repository URL</label>
          <input
            type="text"
            placeholder="https://github.com/SMSDAO/Shipyard"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Deployment Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2 text-slate-300">
              <input
                type="checkbox"
                checked={autoDeploy}
                onChange={(e) => setAutoDeploy(e.target.checked)}
                className="accent-cyan-500"
              />
              <span>Trigger Deploy on `push`</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg border border-cyan-500/50 bg-cyan-950/40 px-4 py-2 font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
        >
          {isLinked ? "Update GitOps Sync" : "Link Repository"}
        </button>
      </form>
    </div>
  );
};
