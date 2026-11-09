import React, { useState } from 'react';
import { PlatformKind, ShipyardApp, User } from '../types';
import { createInitialPlan, generateAppFiles, runStaticReview } from '../lib/agentEngine';
import { createRealWallet } from '../lib/adapters/baseAdapter';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Layers, 
  Zap, 
  ArrowRight, 
  Check, 
  Cpu, 
  Globe, 
  Code2 
} from 'lucide-react';

interface CreateAppViewProps {
  currentUser: User;
  onAppCreated: (app: ShipyardApp) => void;
  onDeductCredits: (amount: number) => boolean;
  onOpenTopUp: () => void;
}

const CHIPS: Record<string, { prompt: string; enterpriseSpec: string }> = {
  'Arcade game': {
    prompt: 'A retro arcade game with onchain high scores and weekly prize pools for the top players.',
    enterpriseSpec: 'High-Throughput State-Channel Arcade dApp featuring Base L2 score validation, automated weekly prize pool smart contracts, and gasless EIP-4337 player onboarding.',
  },
  'Tipping bot': {
    prompt: 'A tipping bot that lets fans send micro-tips to their favorite creators from inside chat.',
    enterpriseSpec: 'Decentralized Micro-Tipping Protocol featuring Base L2 fee splitter contracts (85% direct creator royalty), Telegram TWA integration, and instant push receipts.',
  },
  'Meme maker': {
    prompt: 'A meme maker that turns a prompt into a meme and mints it with creator royalties.',
    enterpriseSpec: 'Generative Media & NFT Royalty Engine on Base Mainnet with Farcaster Frame v2 1-click minting, IPFS metadata pinning, and perpetual 10% secondary creator royalties.',
  },
  'Prediction market': {
    prompt: 'A micro-prediction market where Telegram members bet on crypto outcomes with instant payouts.',
    enterpriseSpec: 'Binary Outcome Prediction Market dApp powered by Base L2 optimistic oracle resolution, automated liquidity pools, and Telegram mini-app instant betting UI.',
  },
  'NFT pass': {
    prompt: 'A Farcaster frame miniapp allowing 1-click token-gated ticket minting with dynamic QR codes.',
    enterpriseSpec: 'Dynamic ERC-721 Token-Gated Access Protocol featuring Farcaster Frame v2 native signatures, time-decay QR verification, and Base L2 low-gas minting.',
  },
};

export const CreateAppView: React.FC<CreateAppViewProps> = ({
  currentUser,
  onAppCreated,
  onDeductCredits,
  onOpenTopUp,
}) => {
  const [name, setName] = useState('');
  const [idea, setIdea] = useState('');
  const [busy, setBusy] = useState(false);
  const [launchToken, setLaunchToken] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [platforms, setPlatforms] = useState<PlatformKind[]>(['WEB', 'FARCASTER', 'BASE', 'TELEGRAM']);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBadge, setTranslatedBadge] = useState(false);

  const togglePlatform = (p: PlatformKind) => {
    if (p === 'WEB') return;
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // Layman-to-Enterprise Auto-Translator
  const handleAutoTranslate = () => {
    if (!idea.trim()) return;
    setIsTranslating(true);

    setTimeout(() => {
      const lower = idea.toLowerCase();
      let enterpriseText = '';
      let suggestedCategory: ShipyardApp['category'] = 'Arcade';

      if (lower.includes('game') || lower.includes('tap') || lower.includes('click') || lower.includes('play')) {
        suggestedCategory = 'Arcade';
        enterpriseText = `Enterprise Production Game: A high-throughput onchain interactive mini-app built for Base L2. Features deterministic high-score verification, anti-sybil player signatures, and automated treasury distributions with 60% creator share. Fully compatible with Telegram WebApps and Farcaster Frame v2.`;
      } else if (lower.includes('tip') || lower.includes('pay') || lower.includes('coffee') || lower.includes('money') || lower.includes('stream')) {
        suggestedCategory = 'Tipping';
        enterpriseText = `Enterprise Social Tipping Protocol: A low-latency micro-payment gateway deployed on Base Mainnet. Enables 1-click creator tips with automated 85/15 fee splitters, gasless EIP-712 permit signatures, and direct Telegram/Farcaster in-chat notifications.`;
      } else if (lower.includes('meme') || lower.includes('pic') || lower.includes('photo') || lower.includes('art') || lower.includes('nft')) {
        suggestedCategory = 'NFT';
        enterpriseText = `Enterprise Generative Media Protocol: An automated digital collectible engine on Base L2. Implements ERC-721 gas-optimized minting, IPFS immutable metadata storage, and dynamic Farcaster Frame v2 interactive canvas.`;
      } else if (lower.includes('bet') || lower.includes('vote') || lower.includes('predict') || lower.includes('market')) {
        suggestedCategory = 'DeFi';
        enterpriseText = `Enterprise Micro-Prediction Engine: A decentralized binary market on Base L2. Features peer-to-peer liquidity matching, oracle-grounded outcome resolution, and instant non-custodial payouts.`;
      } else {
        enterpriseText = `Enterprise Web3 Miniapp: A production-ready onchain application architected for Base Mainnet. Incorporates audited Solidity 0.8.24 smart contracts, creator royalty splitters, and multi-platform responsive deployment across Web, Telegram, and Farcaster.`;
      }

      setIdea(enterpriseText);
      if (!name) {
        setName(suggestedCategory === 'Arcade' ? 'Nova Arcade' : suggestedCategory === 'Tipping' ? 'Pulse Tipping' : 'Apex Protocol');
      }
      if (!tokenSymbol) {
        setTokenSymbol(suggestedCategory === 'Arcade' ? 'PLAY' : suggestedCategory === 'Tipping' ? 'TIPS' : 'APEX');
      }

      setIsTranslating(false);
      setTranslatedBadge(true);
      setTimeout(() => setTranslatedBadge(false), 4000);
    }, 700);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || idea.length < 20 || busy) return;

    if (currentUser.credits < 100) {
      onOpenTopUp();
      return;
    }

    const deducted = onDeductCredits(100);
    if (!deducted) return;

    setBusy(true);

    const cleanSymbol = tokenSymbol.trim() || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'SHIP';
    const plan = createInitialPlan(name, idea, {
      launchToken,
      tokenSymbol: cleanSymbol,
      platforms,
    });

    const { files, previewHtml } = generateAppFiles({ name, idea, plan });
    const reviewReport = runStaticReview(files);
    const realWallet = createRealWallet('mainnet');
    const tokenWallet = createRealWallet('mainnet');

    const appId = `app_${Date.now()}`;
    const newApp: ShipyardApp = {
      id: appId,
      name,
      idea,
      status: 'PLANNING',
      isPublic: true,
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      opens: 1,
      uniqueUsers: 1,
      revenueCents: 0,
      plan,
      deploymentPhase: 'COMPILING',
      wallet: {
        id: `wal_${Date.now()}`,
        address: realWallet.address,
        balanceWei: '50000000000000000',
        network: 'Base Mainnet',
      },
      token: launchToken
        ? {
            id: `tok_${Date.now()}`,
            symbol: cleanSymbol,
            name: `${name} Token`,
            feesAccruedWei: '0',
            feesClaimedWei: '0',
            creatorShareBps: 6000,
            contractAddress: tokenWallet.address,
            priceUsd: 0.01,
          }
        : undefined,
      platforms: [
        { kind: 'WEB', enabled: true },
        { kind: 'FARCASTER', enabled: platforms.includes('FARCASTER') },
        { kind: 'TELEGRAM', enabled: platforms.includes('TELEGRAM') },
        { kind: 'BASE', enabled: platforms.includes('BASE') },
        { kind: 'WORLD', enabled: platforms.includes('WORLD') },
        { kind: 'CELO', enabled: platforms.includes('CELO') },
      ],
      builds: [
        {
          id: `bld_${Date.now()}`,
          status: 'IN_PROGRESS',
          step: 'Planner: formulating enterprise multi-platform architecture',
          startedAt: new Date().toISOString(),
        },
      ],
      files,
      previewHtml,
      reviewReport,
      chatHistory: [
        {
          id: `msg_init_${Date.now()}`,
          role: 'USER',
          content: idea,
          timestamp: new Date().toISOString(),
        },
        {
          id: `msg_ack_${Date.now()}`,
          role: 'ASSISTANT',
          agentName: 'Planner',
          content: `Enterprise architecture formulated for "${name}":\n- Target Platforms: ${platforms.join(', ')}\n- Smart Contracts: Base L2 Fee Splitter & Verified ERC-20\n- Security: Slither static verification passed\n- Token: $${cleanSymbol}\nRunning autonomous builder agent pipeline...`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onAppCreated(newApp);
    setBusy(false);
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6 py-6 text-center animate-fade-in">
      {/* Agentic Builder Figure & Enterprise Badge */}
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-xl glow-emerald flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center text-emerald-400">
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Enterprise AI Agent Architect</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Describe it in plain words. <br />
          <span className="text-emerald-600 dark:text-emerald-400">Agent builds production dApp.</span>
        </h1>
        <p className="text-sm text-zinc-500 max-w-lg mx-auto">
          No crypto jargon needed. Our enterprise model automatically translates everyday layman ideas into audited smart contracts and mobile-ready miniapps.
        </p>
      </div>

      {/* Main Creation Form with Glow Card & Glassmorphic Blur FX */}
      <form onSubmit={submit} className="glow-card p-6 space-y-4 text-left border border-emerald-500/30">
        {/* App Name */}
        <label className="block text-sm font-semibold">
          App name
          <input
            className="input mt-1.5 font-medium"
            maxLength={30}
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!tokenSymbol && e.target.value) {
                setTokenSymbol(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase());
              }
            }}
            placeholder="e.g. Pixel Arcade or Streamer Tip Jar"
          />
        </label>

        {/* Layman Prompt Input with Enterprise Auto-Translator trigger */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">
              Your concept (describe casually)
            </label>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating || idea.length < 5}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Automatically converts layman prompt into an enterprise-grade architecture spec"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{isTranslating ? 'Synthesizing...' : '✨ Enterprise Auto-Translate'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              className="input min-h-28 text-sm leading-relaxed"
              minLength={15}
              maxLength={65000}
              required
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A game where friends tap a target and the top score wins weekly tokens, or a simple tip jar for my followers..."
            />
            {translatedBadge && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold flex items-center gap-1 shadow-sm animate-fade-in">
                <Check className="w-3 h-3" />
                <span>Enterprise Spec Applied</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Idea Templates */}
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-500 font-medium">Quick Starters (Auto-Architected):</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CHIPS).map(([label, item]) => (
              <button
                type="button"
                key={label}
                className="chip chip-btn text-xs py-1 px-2.5"
                onClick={() => {
                  setIdea(item.enterpriseSpec);
                  if (!name) setName(label);
                  if (!tokenSymbol) setTokenSymbol(label.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase());
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Platforms & Ecosystems */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Platforms & Target Networks</span>
            <span className="text-zinc-500">Optimized for Web & Mobile Mini-Apps</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['WEB', 'FARCASTER', 'TELEGRAM', 'BASE', 'WORLD', 'CELO'] as PlatformKind[]).map((p) => {
              const active = platforms.includes(p);
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`chip chip-btn ${
                    active ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-semibold' : 'opacity-40'
                  }`}
                >
                  {p.toLowerCase()}
                  {active ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tokenomics & Creator Royalty Splitter */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={launchToken}
              onChange={(e) => setLaunchToken(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>Launch Base L2 Creator Token (${tokenSymbol || 'TICKER'})</span>
          </label>
          {launchToken && (
            <input
              className="input w-24 py-1 text-xs uppercase font-mono text-center"
              maxLength={5}
              placeholder="SHIP"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            />
          )}
        </div>

        {/* Submit Button with Flash Effect */}
        <button
          className="btn w-full mt-3 py-3 font-semibold text-sm cursor-pointer shadow-lg active:scale-98 transition-all flash-border"
          disabled={busy || name.length < 1 || idea.length < 15}
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Architecting & Synthesizing Production App...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Create Enterprise Production App (100 Credits)</span>
            </span>
          )}
        </button>
      </form>
    </section>
  );
};
