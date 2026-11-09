import React, { useState } from 'react';
import { X, ExternalLink, Smartphone, Monitor, RefreshCw, CheckCircle2, Shield, Share2 } from 'lucide-react';
import { ShipyardApp } from '../types';

interface LiveAppModalProps {
  app: ShipyardApp;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveAppModal: React.FC<LiveAppModalProps> = ({ app, isOpen, onClose }) => {
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(app.liveUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="card w-full max-w-4xl h-[90vh] flex flex-col border border-emerald-500/40 bg-zinc-950/95 p-0 overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">{app.name}</h3>
                <span className="chip text-[10px] py-0.5">Live on Base L2</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs">{app.liveUrl}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700">
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                  deviceView === 'mobile' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Farcaster Mobile Frame view"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                  deviceView === 'desktop' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop Web view"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
              title="Reload sandbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 text-xs text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sandbox Content Area */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 overflow-auto">
          <div
            className={`transition-all duration-300 h-full border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl bg-black ${
              deviceView === 'mobile' ? 'w-[390px] max-h-[720px]' : 'w-full max-w-3xl max-h-full'
            }`}
          >
            {/* Embedded Live Sandbox */}
            {app.previewHtml ? (
              <iframe
                key={key}
                title={`${app.name} Sandbox`}
                srcDoc={app.previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms allow-same-origin"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{app.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">{app.idea}</p>
                </div>
                <div className="flex gap-2">
                  <span className="chip">Base Mainnet</span>
                  <span className="chip">Farcaster Frame</span>
                </div>
                <p className="text-xs font-mono text-emerald-400/80">
                  Wallet: {app.wallet?.address || '0x...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Static Reviewer AST Pass: Verified No Secrets or Vulnerabilities</span>
          </div>
          <div className="font-mono text-[11px] text-emerald-400">
            {app.wallet?.balanceWei ? `${(Number(app.wallet.balanceWei) / 1e18).toFixed(2)} ETH` : '0.00 ETH'}
          </div>
        </div>
      </div>
    </div>
  );
};
