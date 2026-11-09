import React, { useState } from 'react';
import { ShipyardApp } from '../types';
import { LiveAppModal } from './LiveAppModal';
import { Play } from 'lucide-react';

interface ExploreViewProps {
  apps: ShipyardApp[];
  onSelectApp: (app: ShipyardApp) => void;
}

export function ExploreView({ apps, onSelectApp }: ExploreViewProps) {
  const [sandboxApp, setSandboxApp] = useState<ShipyardApp | null>(null);

  const liveApps = apps.filter((a) => a.isPublic && a.status === 'LIVE');
  const trending = [...liveApps].sort((a, b) => b.opens - a.opens).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <section>
        <h2 className="mb-2 font-semibold text-lg">Just shipped</h2>
        {liveApps.length === 0 ? (
          <p className="card text-center text-zinc-500 py-8">Nothing live yet.</p>
        ) : (
          <Grid apps={liveApps} onSelectApp={onSelectApp} onOpenSandbox={setSandboxApp} />
        )}
      </section>

      {trending.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-lg">Trending</h2>
          <Grid apps={trending} onSelectApp={onSelectApp} onOpenSandbox={setSandboxApp} />
        </section>
      )}

      {sandboxApp && (
        <LiveAppModal
          app={sandboxApp}
          isOpen={true}
          onClose={() => setSandboxApp(null)}
        />
      )}
    </div>
  );
}

function Grid({
  apps,
  onSelectApp,
  onOpenSandbox,
}: {
  apps: ShipyardApp[];
  onSelectApp: (app: ShipyardApp) => void;
  onOpenSandbox: (app: ShipyardApp) => void;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {apps.map((a) => (
        <li key={a.id}>
          <div
            onClick={() => onSelectApp(a)}
            className="card block hover:border-brand-500 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{a.name}</h3>
              {a.liveUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSandbox(a);
                  }}
                  className="chip chip-btn text-[10px] py-0.5"
                  title="Test miniapp"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Try
                </button>
              )}
            </div>
            <p className="line-clamp-2 text-sm text-zinc-500">{a.idea}</p>
            <p className="mt-2 text-xs text-zinc-400 font-mono">
              {a.opens.toLocaleString()} opens
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ExploreView;
