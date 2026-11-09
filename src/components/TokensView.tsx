import React from 'react';
import { ShipyardApp, User } from '../types';

interface TokensViewProps {
  apps: ShipyardApp[];
  currentUser: User;
  onSelectApp: (app: ShipyardApp) => void;
  onUpdateApp: (appId: string, updated: Partial<ShipyardApp>) => void;
}

export function TokensView({ apps, onSelectApp }: TokensViewProps) {
  const tokenApps = apps.filter((a) => a.token);

  if (tokenApps.length === 0) {
    return <p className="card text-center text-zinc-500 py-8">No tokens launched yet.</p>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-semibold">Miniapp Tokens</h1>
      <ul className="space-y-2">
        {tokenApps.map((a) => {
          const t = a.token!;
          return (
            <li key={t.id}>
              <div
                onClick={() => onSelectApp(a)}
                className="card flex items-center justify-between hover:border-brand-500 cursor-pointer transition-all duration-200"
              >
                <span>
                  <b className="text-brand-600 dark:text-brand-400 font-bold">${t.symbol}</b>{' '}
                  <span className="text-sm text-zinc-500">· {a.name}</span>
                </span>
                <span className="text-sm text-zinc-500 font-mono">
                  {(Number(t.feesAccruedWei) / 1e18).toFixed(3)} ETH fees
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TokensView;
