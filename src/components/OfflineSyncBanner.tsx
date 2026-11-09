import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock, AlertTriangle, List, Trash2, ArrowRight } from 'lucide-react';
import { SyncQueueItem } from '../lib/offlineSync';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  isSimulated: boolean;
  isSyncing: boolean;
  queue: SyncQueueItem[];
  onToggleSimulated: () => void;
  onTriggerSync: () => void;
  onClearQueue: () => void;
  lastSyncedAt?: string | null;
}

export function OfflineSyncBanner({
  isOnline,
  isSimulated,
  isSyncing,
  queue,
  onToggleSimulated,
  onTriggerSync,
  onClearQueue,
  lastSyncedAt,
}: OfflineSyncBannerProps) {
  const [showQueueModal, setShowQueueModal] = useState(false);
  const pendingCount = queue.length;

  return (
    <>
      {/* Top Banner / Pill */}
      <div className="w-full mb-3 animate-fade-in">
        <div
          className={`card py-2.5 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 transition-all duration-200 ${
            !isOnline
              ? 'border-amber-500/50 bg-amber-950/40 text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.12)]'
              : pendingCount > 0
              ? 'border-brand-500/50 bg-brand-950/40 text-brand-200'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-400'
          }`}
        >
          {/* Status info */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              ) : isSyncing ? (
                <RefreshCw className="w-4 h-4 text-brand-400 shrink-0 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4 text-brand-500 shrink-0" />
              )}

              <span className="font-semibold text-white">
                {!isOnline ? (
                  <span>
                    Offline Mode {isSimulated ? '(Simulated)' : ''}
                  </span>
                ) : isSyncing ? (
                  <span>Syncing with Base & Shipyard...</span>
                ) : (
                  <span className="text-zinc-300">Online & Connected</span>
                )}
              </span>
            </div>

            <span className="text-zinc-500 hidden sm:inline">|</span>

            <span className="text-xs">
              {!isOnline ? (
                <span>All apps & data cached locally. Changes queue to sync when reconnected.</span>
              ) : pendingCount > 0 ? (
                <span className="text-brand-300 font-medium">
                  {pendingCount} action{pendingCount > 1 ? 's' : ''} queued to sync
                </span>
              ) : (
                <span className="text-zinc-500">
                  {lastSyncedAt ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Real-time cache active'}
                </span>
              )}
            </span>
          </div>

          {/* Controls & Queue button */}
          <div className="flex items-center gap-2 ml-auto">
            {pendingCount > 0 && (
              <button
                onClick={() => setShowQueueModal(true)}
                className="chip chip-btn text-xs py-1 px-2.5 flex items-center gap-1 font-mono"
              >
                <List className="w-3 h-3" />
                <span>{pendingCount} Queued</span>
              </button>
            )}

            {isOnline && pendingCount > 0 && (
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="btn text-xs py-1 px-2.5 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}

            {/* Offline Simulator Switch */}
            <button
              onClick={onToggleSimulated}
              className={`chip chip-btn text-xs py-1 px-2.5 flex items-center gap-1.5 transition ${
                isSimulated
                  ? 'border-amber-400 text-amber-300 bg-amber-950/60 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Test offline mode by simulating connection loss"
            >
              <span>{isSimulated ? 'Exit Offline Sim' : 'Simulate Offline'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Details Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="card w-full max-w-lg space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Offline Sync Queue</h3>
                <span className="chip text-[10px]">{pendingCount} pending</span>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="text-zinc-500 hover:text-white text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              These actions were saved offline while disconnected. They will automatically replay in chronological order when connectivity is restored.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      #{idx + 1} {item.description}
                    </span>
                    <span className="chip text-[10px] font-mono">{item.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>{item.method} {item.url}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}

              {queue.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  Sync queue is empty. All actions are in sync!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onClearQueue();
                  setShowQueueModal(false);
                }}
                className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Queue</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="btn-ghost text-xs py-1.5 px-3"
                >
                  Close
                </button>
                {isOnline && (
                  <button
                    onClick={() => {
                      onTriggerSync();
                      setShowQueueModal(false);
                    }}
                    disabled={isSyncing || pendingCount === 0}
                    className="btn text-xs py-1.5 px-3 font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All Now</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OfflineSyncBanner;
