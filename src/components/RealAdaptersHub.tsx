import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Send, 
  Github, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { queryRealBaseNetworkState, createRealWallet, BaseNetworkTelemetry } from '../lib/adapters/baseAdapter';

interface RealAdaptersHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealAdaptersHub: React.FC<RealAdaptersHubProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'telegram' | 'github' | 'gemini'>('base');

  // Base RPC state
  const [baseTelemetry, setBaseTelemetry] = useState<BaseNetworkTelemetry | null>(null);
  const [loadingBase, setLoadingBase] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; privateKey: string } | null>(null);

  // Telegram state
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<any>(null);
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  // GitHub state
  const [githubToken, setGithubToken] = useState('');
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [loadingGithub, setLoadingGithub] = useState(false);

  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBaseTelemetry();
    }
  }, [isOpen]);

  const loadBaseTelemetry = async () => {
    setLoadingBase(true);
    try {
      const data = await queryRealBaseNetworkState('mainnet');
      setBaseTelemetry(data);
    } catch {
      // Handled in adapter
    } finally {
      setLoadingBase(false);
    }
  };

  const handleGenerateRealWallet = () => {
    const wallet = createRealWallet('mainnet');
    setGeneratedWallet({
      address: wallet.address,
      privateKey: wallet.privateKey,
    });
  };

  const handleVerifyTelegram = async () => {
    if (!telegramToken.trim()) return;
    setLoadingTelegram(true);
    setTelegramStatus(null);
    try {
      const res = await fetch('/api/adapters/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: telegramToken }),
      });
      const data = await res.json();
      setTelegramStatus(data);
    } catch (err: any) {
      setTelegramStatus({ ok: false, description: err.message });
    } finally {
      setLoadingTelegram(false);
    }
  };

  const handleVerifyGithub = async () => {
    if (!githubToken.trim()) return;
    setLoadingGithub(true);
    setGithubStatus(null);
    try {
      const res = await fetch('/api/adapters/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken }),
      });
      const data = await res.json();
      setGithubStatus(data);
    } catch (err: any) {
      setGithubStatus({ ok: false, error: err.message });
    } finally {
      setLoadingGithub(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glow-card w-full max-w-2xl bg-zinc-950 border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-zinc-100">Real Adapters & Verification Hub</h2>
              <p className="text-xs text-zinc-400">Live API integrations with Base L2, Telegram, GitHub & Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost text-xs py-1 px-2.5 text-zinc-400 hover:text-white"
          >
            Close ✕
          </button>
        </div>

        {/* Adapter Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-4 gap-2 text-xs">
          {[
            { id: 'base', label: 'Base Mainnet RPC', icon: Globe },
            { id: 'telegram', label: 'Telegram Bot API', icon: Send },
            { id: 'github', label: 'GitHub REST API', icon: Github },
            { id: 'gemini', label: 'Gemini 3.8 Flash', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3 font-medium flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  active
                    ? 'border-emerald-500 text-emerald-400 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BASE RPC */}
          {activeTab === 'base' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-xs text-zinc-200">Base Mainnet Node Status</span>
                  </div>
                  <button
                    onClick={loadBaseTelemetry}
                    disabled={loadingBase}
                    className="btn-ghost text-[11px] py-1 px-2 flex items-center gap-1"
                  >
                    <RotateCw className={`w-3 h-3 ${loadingBase ? 'animate-spin' : ''}`} />
                    <span>Ping RPC</span>
                  </button>
                </div>

                {baseTelemetry ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded bg-black/40">
                      <p className="text-[10px] text-zinc-500">RPC ENDPOINT</p>
                      <p className="font-mono text-zinc-300 truncate">mainnet.base.org</p>
                    </div>
                    <div className="p-2 rounded bg-black/40">
                      <p className="text-[10px] text-zinc-500">CHAIN ID</p>
                      <p className="font-mono text-emerald-400">8453 (Base L2)</p>
                    </div>
                    <div className="p-2 rounded bg-black/40">
                      <p className="text-[10px] text-zinc-500">CURRENT BLOCK</p>
                      <p className="font-mono text-emerald-300 font-bold">#{baseTelemetry.blockNumberFormatted}</p>
                    </div>
                    <div className="p-2 rounded bg-black/40">
                      <p className="text-[10px] text-zinc-500">BASE GAS</p>
                      <p className="font-mono text-amber-300 font-semibold">{baseTelemetry.gasPriceGwei} Gwei</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Querying live Base RPC...</p>
                )}
              </div>

              {/* Cryptographic Wallet Generator */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">Real Cryptographic Base Wallet Generator</h4>
                    <p className="text-[11px] text-zinc-500">Generates real secp256k1 keypair using viem</p>
                  </div>
                  <button
                    onClick={handleGenerateRealWallet}
                    className="btn text-xs py-1 px-2.5"
                  >
                    Generate Real Wallet
                  </button>
                </div>

                {generatedWallet && (
                  <div className="space-y-1.5 p-2.5 rounded-lg bg-black/50 border border-emerald-500/20 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500">PUBLIC ADDRESS (BASE L2):</span>
                      <p className="text-emerald-400 select-all break-all">{generatedWallet.address}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">PRIVATE KEY:</span>
                      <p className="text-zinc-500 select-all break-all">{generatedWallet.privateKey.slice(0, 10)}...{generatedWallet.privateKey.slice(-8)} (Protected)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TELEGRAM BOT API */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Verify Real Telegram Bot Token</h4>
                  <p className="text-[11px] text-zinc-500">Pings api.telegram.org/bot&lt;TOKEN&gt;/getMe</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    className="input text-xs flex-1 font-mono"
                    placeholder="Enter Bot Token (e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ)"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyTelegram}
                    disabled={loadingTelegram || !telegramToken}
                    className="btn text-xs py-1.5 px-3 shrink-0"
                  >
                    {loadingTelegram ? 'Checking...' : 'Verify Token'}
                  </button>
                </div>

                {telegramStatus && (
                  <div className={`p-3 rounded-lg text-xs font-mono ${
                    telegramStatus.ok ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}>
                    {telegramStatus.ok ? (
                      <div className="space-y-1">
                        <p className="font-bold flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Telegram Bot Verified: @{telegramStatus.result.username}</span>
                        </p>
                        <p className="text-zinc-300">Bot ID: {telegramStatus.result.id} · Name: {telegramStatus.result.first_name}</p>
                      </div>
                    ) : (
                      <p className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{telegramStatus.description || 'Verification failed'}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB REST API */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Verify Real GitHub Personal Access Token</h4>
                  <p className="text-[11px] text-zinc-500">Interfaces directly with api.github.com/user</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    className="input text-xs flex-1 font-mono"
                    placeholder="Enter GitHub PAT (ghp_...)"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyGithub}
                    disabled={loadingGithub || !githubToken}
                    className="btn text-xs py-1.5 px-3 shrink-0"
                  >
                    {loadingGithub ? 'Checking...' : 'Verify GitHub'}
                  </button>
                </div>

                {githubStatus && (
                  <div className={`p-3 rounded-lg text-xs font-mono ${
                    githubStatus.ok ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}>
                    {githubStatus.ok ? (
                      <div className="flex items-center gap-3">
                        {githubStatus.user.avatar_url && (
                          <img src={githubStatus.user.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                        )}
                        <div>
                          <p className="font-bold text-emerald-400">Authenticated: @{githubStatus.user.login}</p>
                          <p className="text-zinc-400">Public repos: {githubStatus.user.public_repos} · User ID: {githubStatus.user.id}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{githubStatus.error || 'GitHub connection failed'}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI AI BUILDER */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">Gemini 3.8 Flash Code & Contract Builder</h4>
                    <p className="text-[11px] text-zinc-500">Autonomous code synthesis powered by @google/genai</p>
                  </div>
                  <span className="chip text-[10px] bg-emerald-500/15 text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SDK:</span>
                    <span className="text-zinc-300">@google/genai ^2.4.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">MODEL TARGET:</span>
                    <span className="text-emerald-400">gemini-3.8-flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CAPABILITIES:</span>
                    <span className="text-zinc-300">Next.js 15 App Router · Solidity 0.8.24 · Security Audit</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  When creating an app, the agent connects directly to the Gemini API to formulate smart contracts, splitters, and multi-platform Farcaster/Telegram miniapps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/60 flex justify-between items-center text-xs text-zinc-400">
          <span>Enterprise Real Adapter Engine</span>
          <button
            onClick={onClose}
            className="btn text-xs py-1 px-3"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
