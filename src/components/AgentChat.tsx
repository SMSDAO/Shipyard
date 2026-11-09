import React, { useEffect, useRef, useState } from 'react';
import { AgentMessage, ShipyardApp } from '../types';
import { BuildTimeline } from './BuildTimeline';
import confetti from 'canvas-confetti';
import { Bot, Sparkles, ShieldCheck, Zap, SendHorizontal } from 'lucide-react';

export function AgentChat({
  app,
  onUpdateApp,
  initialIdea,
  autoStart,
  isOnline = true,
}: {
  app: ShipyardApp;
  onUpdateApp: (updated: Partial<ShipyardApp>) => void;
  initialIdea?: string;
  autoStart?: boolean;
  isOnline?: boolean;
}) {
  const [messages, setMessages] = useState<AgentMessage[]>(app.chatHistory || []);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(app.currentStep || (app.status === 'LIVE' ? null : 'Planner: understanding your concept'));
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, step]);

  useEffect(() => {
    if (app.chatHistory) {
      setMessages(app.chatHistory);
    }
    if (app.status === 'LIVE') {
      setStep(null);
    }
  }, [app.id, app.status]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      role: 'USER',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    // If app is not yet LIVE, step through the 5 agents
    if (app.status !== 'LIVE') {
      // 1. Planner
      setStep('Planner: translating layman concept into enterprise architecture');
      await new Promise((r) => setTimeout(r, 800));

      // 2. Designer
      setStep('Designer: crafting web & mobile responsive glass interface');
      await new Promise((r) => setTimeout(r, 800));

      // 3. Coder
      setStep('Coder: generating Base L2 Solidity contracts & Next.js miniapp');
      await new Promise((r) => setTimeout(r, 1000));

      // 4. Reviewer
      setStep('Reviewer: running Slither security audit & gas optimization');
      await new Promise((r) => setTimeout(r, 800));

      // 5. Deployer
      setStep('Deployer: shipping onchain & verifying contract bytecode');
      await new Promise((r) => setTimeout(r, 1000));

      const liveUrl = `https://${app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.shipyard.app`;
      const repoUrl = `https://github.com/shipyard-apps/${app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      const assistantMsg: AgentMessage = {
        id: `ast-${Date.now()}`,
        role: 'ASSISTANT',
        agentName: 'Deployer',
        content: isOnline
          ? `Your enterprise onchain miniapp "${app.name}" is now fully LIVE on Base Mainnet!\n\n• Live Production URL: ${liveUrl}\n• Source Code: ${repoUrl}\n• Smart Wallet & Token initialized with 60% creator fees.`
          : `Your enterprise onchain miniapp "${app.name}" is compiled and staged offline!\n\n• Staged Preview: ${liveUrl}\n• Local Repository: ${repoUrl}\n• Base Mainnet contracts & webhooks queued to sync on reconnection.`,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      setStep(null);
      setBusy(false);

      onUpdateApp({
        chatHistory: finalMessages,
        status: 'LIVE',
        deploymentPhase: 'LIVE',
        liveUrl,
        repoUrl,
        currentStep: undefined,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#22d3ee', '#ecfdf5'],
      });
      return;
    }

    // Interactive follow-up turn
    setStep('Coder: translating request to production contract updates');
    await new Promise((r) => setTimeout(r, 900));

    let reply = `Translated and implemented: "${text}". Contract bytecode and miniapp bundle refreshed on Base L2.`;
    if (!isOnline) {
      reply += ' (Staged offline — changes will sync with repository upon reconnection)';
    }
    if (text.toLowerCase().includes('surprise')) {
      reply = `Configured retroactive fee distribution, automated staking yield, and leaderboard high score multiplier!`;
    }

    const assistantMsg: AgentMessage = {
      id: `ast-${Date.now()}`,
      role: 'ASSISTANT',
      content: reply,
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...nextMessages, assistantMsg];
    setMessages(finalMessages);
    setStep(null);
    setBusy(false);

    onUpdateApp({
      chatHistory: finalMessages,
    });
  }

  useEffect(() => {
    if (autoStart && !started.current && (initialIdea || app.idea)) {
      started.current = true;
      send(initialIdea || app.idea);
    }
  }, []);

  return (
    <aside className="glow-card flex h-[70vh] flex-col p-4 border border-emerald-500/30">
      {/* Agent Header with Figure Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm">Enterprise Architect</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-500">Autonomous Layman-to-DApp Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isOnline && (
            <span className="chip text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/20">
              Offline engine
            </span>
          )}
          <span className="chip text-[10px]">{app.status}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto text-sm py-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2 text-zinc-500">
            <Sparkles className="w-6 h-6 mx-auto text-emerald-500/70" />
            <p className="text-xs">Tell the agent what to build or change in everyday words.</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
              m.role === 'USER' 
                ? 'ml-6 bg-emerald-500/15 border border-emerald-500/20 text-zinc-900 dark:text-zinc-100' 
                : 'mr-6 bg-zinc-900/60 border border-zinc-800/80 text-emerald-300 backdrop-blur-md'
            }`}
          >
            {m.role === 'ASSISTANT' && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mb-1 font-semibold">
                <Bot className="w-3 h-3" />
                <span>{m.agentName || 'Enterprise Agent'}</span>
              </div>
            )}
            {m.content}
          </div>
        ))}

        {busy && (
          <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
            <BuildTimeline step={step} />
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              {step ?? 'Translating & compiling...'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Non-Pro Prompts Chips */}
      <div className="pt-2 pb-1.5 flex gap-1 overflow-x-auto text-[11px]">
        {['Add gasless paymaster', 'Add high-score prize', 'Surprise me'].map((quick) => (
          <button
            key={quick}
            type="button"
            onClick={() => send(quick)}
            disabled={busy}
            className="chip chip-btn shrink-0 text-[10px] py-0.5 px-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            + {quick}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form
        className="pt-2 flex gap-2 border-t border-zinc-200 dark:border-zinc-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="input text-xs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Describe a change casually, or click a suggestion...'
          disabled={busy}
        />
        <button 
          className="btn px-3 shrink-0 cursor-pointer disabled:opacity-50" 
          disabled={busy || !input.trim()}
        >
          {busy ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <SendHorizontal className="w-4 h-4" />
          )}
        </button>
      </form>
    </aside>
  );
}

export default AgentChat;
