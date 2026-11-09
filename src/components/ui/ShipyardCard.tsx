"use client";

import React from "react";

export interface ShipyardCardProps {
  title: string;
  status: "ONLINE" | "BUILDING" | "ALERT";
  children: React.ReactNode;
  glowColor?: "cyan" | "violet" | "magenta" | "orange";
  className?: string;
  badgeText?: string;
}

export const ShipyardCard: React.FC<ShipyardCardProps> = ({
  title,
  status,
  children,
  glowColor = "cyan",
  className = "",
  badgeText,
}) => {
  const glowStyles = {
    cyan: "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    violet: "border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    magenta: "border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.15)] hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]",
    orange: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
  };

  const statusColors = {
    ONLINE: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    BUILDING: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)]",
    ALERT: "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-slate-950/80 backdrop-blur-md p-6 transition-all duration-300 ${glowStyles[glowColor]} ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
        <h3 className="font-mono text-lg font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
          <span>{title}</span>
        </h3>
        <div className="flex items-center gap-2">
          {badgeText && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {badgeText}
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wide ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>
      </div>
      <div className="text-slate-300 font-sans">{children}</div>
    </div>
  );
};
