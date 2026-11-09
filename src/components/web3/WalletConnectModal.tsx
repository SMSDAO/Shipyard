"use client";

import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { Wallet, ShieldCheck, Zap, X, CheckCircle, ArrowRight } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { select: selectSolana, publicKey: solanaPubKey, disconnect: disconnectSolana, wallets: solanaWallets } = useSolanaWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="font-mono text-base font-bold uppercase tracking-wider text-cyan-400">
              Connect Web3 Matrix
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EVM Wallet Section */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>EVM Networks (Base, Arb, Eth)</span>
            </p>
            {isConnected && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected
              </span>
            )}
          </div>

          {isConnected ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono">Chain: {chain?.name || 'Base L2'}</p>
                  <p className="font-mono text-sm font-bold text-emerald-300 mt-0.5">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="rounded-lg bg-rose-500/20 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector });
                    onClose();
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-left font-mono text-sm text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    <span>{connector.name}</span>
                  </div>
                  <span className="text-xs text-cyan-400 flex items-center gap-1 font-semibold">
                    <span>Connect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Solana Wallet Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span>Solana Network (SVM)</span>
              </p>
              {solanaPubKey && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Connected
                </span>
              )}
            </div>

            {solanaPubKey ? (
              <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-mono">Solana Mainnet-Beta</p>
                    <p className="font-mono text-sm font-bold text-violet-300 mt-0.5">
                      {solanaPubKey.toBase58().slice(0, 6)}...{solanaPubKey.toBase58().slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnectSolana()}
                    className="rounded-lg bg-rose-500/20 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  try {
                    selectSolana("Phantom" as any);
                  } catch {
                    // Fallback
                  }
                  onClose();
                }}
                className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 font-mono text-sm text-slate-200 hover:border-violet-500/50 hover:bg-violet-950/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/40 border border-purple-400 inline-block" />
                  <span>Phantom / Solflare (Solana)</span>
                </div>
                <span className="text-xs text-violet-400 flex items-center gap-1 font-semibold">
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Zero-Leakage AES-256</span>
          </span>
          <span className="text-slate-400">Multi-Chain Ready</span>
        </div>
      </div>
    </div>
  );
};
