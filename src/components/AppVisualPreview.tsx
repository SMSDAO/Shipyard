import React, { useState } from 'react';
import { ShipyardApp } from '../types';
import { 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Coins, 
  Send, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  ShieldCheck,
  Share2,
  ExternalLink,
  Wallet
} from 'lucide-react';

interface AppVisualPreviewProps {
  app: ShipyardApp;
  onUpdateApp?: (updated: Partial<ShipyardApp>) => void;
}

type DeviceMode = 'MOBILE' | 'DESKTOP';
type ThemeId = 'emerald' | 'neon' | 'gold' | 'sapphire';

const THEMES: Record<ThemeId, {
  name: string;
  bg: string;
  accent: string;
  accentText: string;
  accentBorder: string;
  glow: string;
  buttonGradient: string;
}> = {
  emerald: {
    name: 'Emerald Cyber',
    bg: 'bg-[#05140e]',
    accent: 'text-emerald-400',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
  neon: {
    name: 'Neon Cyberpunk',
    bg: 'bg-[#130722]',
    accent: 'text-purple-400',
    accentText: 'text-purple-300',
    accentBorder: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #a855f7, #6b21a8)',
  },
  gold: {
    name: 'Obsidian Gold',
    bg: 'bg-[#141209]',
    accent: 'text-amber-400',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
  },
  sapphire: {
    name: 'Midnight Sapphire',
    bg: 'bg-[#081528]',
    accent: 'text-cyan-400',
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #06b6d4, #0369a1)',
  },
};

export const AppVisualPreview: React.FC<AppVisualPreviewProps> = ({
  app,
  onUpdateApp,
}) => {
  const [device, setDevice] = useState<DeviceMode>('MOBILE');
  const [themeId, setThemeId] = useState<ThemeId>(app.themeSetting || 'emerald');
  
  // Interactive mini-app state
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [selectedTip, setSelectedTip] = useState('0.005');
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);

  const theme = THEMES[themeId];

  const lowerIdea = (app.idea || '').toLowerCase();
  const isGame = lowerIdea.includes('game') || lowerIdea.includes('arcade') || lowerIdea.includes('score') || app.category === 'Arcade';
  const isTip = lowerIdea.includes('tip') || lowerIdea.includes('bot') || lowerIdea.includes('creator') || app.category === 'Tipping';
  const isMeme = lowerIdea.includes('meme') || lowerIdea.includes('nft') || lowerIdea.includes('mint') || app.category === 'NFT' || app.category === 'Meme';

  const handleGameTap = () => {
    const points = 100 * combo;
    setScore((prev) => prev + points);
    setCombo((prev) => Math.min(prev + 1, 8));
    setLastActionToast(`+${points} Points! Combo x${combo}`);
    setTimeout(() => setLastActionToast(null), 1800);
  };

  const handleSendTip = () => {
    const tx = '0x' + Math.random().toString(16).substring(2, 10);
    setLastActionToast(`Sent ${selectedTip} ETH to Creator! Hash: ${tx}`);
    setTimeout(() => setLastActionToast(null), 2500);
  };

  const handleMintAction = () => {
    const tokenId = Math.floor(1000 + Math.random() * 9000);
    setLastActionToast(`Minted Pass #${tokenId} on Base Mainnet!`);
    setTimeout(() => setLastActionToast(null), 2500);
  };

  const changeTheme = (newTheme: ThemeId) => {
    setThemeId(newTheme);
    if (onUpdateApp) {
      onUpdateApp({ themeSetting: newTheme });
    }
  };

  return (
    <div className="glow-card p-5 space-y-4 border border-zinc-200 dark:border-zinc-800">
      {/* Controls Bar: Device Switcher, Theme Switcher, Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm sm:text-base">Interactive App Visual Preview</h3>
            <span className="chip text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Live Simulation
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Real-time visual rendering based on prompt semantics and selected design theme
          </p>
        </div>

        {/* Device toggle & theme selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Toggle */}
          <div className="flex rounded-lg p-0.5 bg-zinc-200 dark:bg-zinc-800/90 text-xs">
            <button
              onClick={() => setDevice('MOBILE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                device === 'MOBILE'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Frame</span>
            </button>
            <button
              onClick={() => setDevice('DESKTOP')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                device === 'DESKTOP'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Web</span>
            </button>
          </div>

          {/* Theme Palette Buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            {(Object.keys(THEMES) as ThemeId[]).map((tid) => (
              <button
                key={tid}
                onClick={() => changeTheme(tid)}
                title={THEMES[tid].name}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                  themeId === tid ? 'scale-110 shadow-sm border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: tid === 'emerald' ? '#10b981' : tid === 'neon' ? '#a855f7' : tid === 'gold' ? '#f59e0b' : '#06b6d4',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div className="py-2 flex items-center justify-center min-h-[460px] bg-zinc-950/40 rounded-xl p-4 overflow-hidden relative">
        {/* Ambient Glow Backdrop */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ background: theme.glow }}
        />

        {/* MOBILE DEVICE FRAME */}
        {device === 'MOBILE' ? (
          <div className="mobile-device-frame relative w-full max-w-[340px] text-white select-none shadow-2xl">
            {/* Phone Notch */}
            <div className="mobile-notch" />

            {/* Mobile Status Bar */}
            <div className="pt-5 px-6 pb-2 flex justify-between items-center text-[11px] font-mono opacity-60">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Base 5G</span>
              </div>
            </div>

            {/* Mobile App Header (Telegram/Farcaster mini-app style) */}
            <div className={`px-4 py-2 border-b ${theme.accentBorder} flex items-center justify-between bg-black/30 backdrop-blur-md`}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ background: theme.buttonGradient }}
                >
                  {app.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-xs leading-none">{app.name}</h4>
                  <span className={`text-[10px] ${theme.accent}`}>Telegram Mini-App</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                  {connected ? '0x71C...a89F' : 'Connect'}
                </span>
              </div>
            </div>

            {/* Mobile Inner Content */}
            <div className={`p-4 space-y-3.5 min-h-[380px] ${theme.bg} text-zinc-100 flex flex-col justify-between`}>
              {/* Top Banner */}
              <div className="space-y-1 text-center pt-2">
                <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Powered by Base L2</span>
                </div>
                <h3 className="text-base font-bold tracking-tight">{app.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 px-2">
                  {app.idea}
                </p>
              </div>

              {/* Dynamic Feature Module based on Prompt Category */}
              {isGame ? (
                /* Arcade Game Dynamic UI */
                <div className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                  <div className="flex justify-around items-center py-1">
                    <div>
                      <p className="text-[10px] text-zinc-400">TOTAL SCORE</p>
                      <p className={`text-2xl font-black font-mono ${theme.accent}`}>{score.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">COMBO</p>
                      <p className="text-base font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        x{combo}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Tap Button */}
                  <button
                    onClick={handleGameTap}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-all cursor-pointer flash-border"
                    style={{ background: theme.buttonGradient }}
                  >
                    🕹️ TAP TARGET TO PLAY
                  </button>

                  <p className="text-[10px] text-zinc-400">
                    Leaderboard prize pool: 1.45 ETH on Base
                  </p>
                </div>
              ) : isTip ? (
                /* Micro-Tipping Dynamic UI */
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                  <p className="text-xs font-medium text-zinc-300">Choose Tip Amount</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['0.001', '0.005', '0.02'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSelectedTip(amt)}
                        className={`py-2 px-2 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                          selectedTip === amt
                            ? 'bg-white/20 border border-white/40 text-white shadow-xs'
                            : 'bg-white/5 border border-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        {amt} ETH
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSendTip}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ background: theme.buttonGradient }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send {selectedTip} ETH Tip</span>
                  </button>

                  <p className="text-[10px] text-zinc-400">
                    85% direct creator royalty via split contract
                  </p>
                </div>
              ) : isMeme ? (
                /* Meme / NFT Dynamic UI */
                <div className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                  <div className="h-28 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                    <Sparkles className="w-6 h-6 text-amber-400 mb-1" />
                    <p className="text-xs font-mono font-bold text-zinc-200">${app.token?.symbol || 'PASS'}</p>
                    <p className="text-[10px] text-zinc-400">Generative Token Pass #1042</p>
                  </div>

                  <button
                    onClick={handleMintAction}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ background: theme.buttonGradient }}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Mint Pass (0.002 ETH)</span>
                  </button>
                </div>
              ) : (
                /* General Enterprise dApp UI */
                <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                  <div className="flex justify-between text-xs py-1 text-zinc-300">
                    <span>Protocol Status</span>
                    <span className="font-mono text-emerald-400">Operational</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-left text-[11px] font-mono text-zinc-300 space-y-1">
                    <p className="text-zinc-500">// Base L2 Verified Hook</p>
                    <p className="text-emerald-400">contract.executeAction()</p>
                  </div>
                  <button
                    onClick={() => {
                      setLastActionToast('Transaction Executed on Base L2!');
                      setTimeout(() => setLastActionToast(null), 2000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                    style={{ background: theme.buttonGradient }}
                  >
                    ⚡ Execute Action
                  </button>
                </div>
              )}

              {/* Toast feedback */}
              {lastActionToast && (
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] text-center font-mono animate-fade-in">
                  {lastActionToast}
                </div>
              )}

              {/* Bottom Nav / Footer */}
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Audited & Verified
                </span>
                <span className="font-mono">${app.token?.symbol || 'SHIP'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP WEB FRAME */
          <div className="desktop-device-frame relative w-full max-w-2xl text-white select-none shadow-2xl">
            {/* Browser Header Bar */}
            <div className="browser-header justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              {/* Mock URL Bar */}
              <div className="flex-1 max-w-md mx-3 py-1 px-3 rounded-md bg-black/40 border border-white/10 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>https://{app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.shipyard.app</span>
                <span className="text-[10px] text-emerald-400">SSL 🔒</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Desktop App Canvas */}
            <div className={`p-6 min-h-[360px] ${theme.bg} space-y-6`}>
              {/* Navigation in Desktop */}
              <div className={`pb-4 border-b ${theme.accentBorder} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ background: theme.buttonGradient }}
                  >
                    {app.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{app.name}</h4>
                    <p className={`text-[10px] ${theme.accent}`}>Base Mainnet Enterprise App</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-xs">0x71C...a89F</span>
                  </button>
                </div>
              </div>

              {/* Desktop 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h2 className="text-xl font-bold tracking-tight">{app.name}</h2>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {app.idea}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Token: ${app.token?.symbol || 'SHIP'}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      ERC-20 Royalty Splitter
                    </span>
                  </div>
                </div>

                {/* Right Interactive Card */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  {isGame ? (
                    <div className="text-center space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Score</span>
                        <span className={`text-xl font-mono font-bold ${theme.accent}`}>{score}</span>
                      </div>
                      <button
                        onClick={handleGameTap}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm cursor-pointer shadow-lg active:scale-95 transition"
                        style={{ background: theme.buttonGradient }}
                      >
                        🕹️ Play Interactive Run
                      </button>
                    </div>
                  ) : isTip ? (
                    <div className="text-center space-y-3">
                      <p className="text-xs text-zinc-300">Direct Creator Tipping</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['0.001', '0.005', '0.02'].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setSelectedTip(amt)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                              selectedTip === amt ? 'bg-white/20 text-white border border-white/40' : 'bg-white/5 text-zinc-400'
                            }`}
                          >
                            {amt} ETH
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleSendTip}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition"
                        style={{ background: theme.buttonGradient }}
                      >
                        Send Tip to Creator
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs flex justify-between text-zinc-300">
                        <span>Base Network Gas</span>
                        <span className="font-mono text-emerald-400">0.0001 ETH</span>
                      </div>
                      <button
                        onClick={() => {
                          setLastActionToast('Transaction confirmed in block #1948291');
                          setTimeout(() => setLastActionToast(null), 2000);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition"
                        style={{ background: theme.buttonGradient }}
                      >
                        ⚡ Execute Onchain Action
                      </button>
                    </div>
                  )}

                  {lastActionToast && (
                    <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-mono">
                      {lastActionToast}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
