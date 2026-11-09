"use client";

import React from "react";

interface PreviewTabProps {
  appTargetUrl?: string;
  appName: string;
}

export const MobileDevicePreviewTab: React.FC<PreviewTabProps> = ({
  appTargetUrl = "https://shipyard.smsdao.org",
  appName,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="font-mono text-xs text-slate-400 mb-4 uppercase tracking-widest">
        📱 Mobile Viewport Preview — {appName}
      </div>

      {/* Cyber-futuristic Phone Chassis Frame */}
      <div className="mobile-device-frame relative w-[340px] h-[680px] rounded-[48px] border-[10px] border-slate-900 bg-black shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Speaker / Camera Island Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-900 rounded-b-2xl z-20" />

        {/* Dynamic Embedded Display Frame */}
        <iframe
          src={appTargetUrl}
          title={`${appName} Mobile Preview`}
          className="w-full h-full pt-6 border-0 bg-slate-950"
        />
      </div>
    </div>
  );
};
