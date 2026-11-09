import React from 'react';
import { FeatureFlag, AuditLog, ShipyardApp, User } from '../types';

interface AdminViewProps {
  currentUser: User;
  featureFlags: FeatureFlag[];
  onToggleFlag: (key: string) => void;
  auditLogs: AuditLog[];
  apps: ShipyardApp[];
  users: User[];
}

export function AdminView({
  featureFlags,
  onToggleFlag,
  auditLogs,
  apps,
  users,
}: AdminViewProps) {
  const liveCount = apps.filter((a) => a.status === 'LIVE').length;
  const rate = apps.length > 0 ? Math.round((liveCount / apps.length) * 100) : 100;
  const spent = 4250;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 4 Stat Cards matching shipyard/src/app/admin/page.tsx */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Users', users.length + 3],
          ['Apps', apps.length],
          ['Build success', `${rate}%`],
          ['Credits spent', spent],
        ].map(([l, v]) => (
          <div key={String(l)} className="card text-center">
            <p className="text-xs text-zinc-500">{l}</p>
            <p className="text-xl font-semibold mt-0.5">{v}</p>
          </div>
        ))}
      </div>

      {/* Feature Flags Card */}
      <div className="card">
        <h2 className="mb-2 font-semibold text-base">Feature flags</h2>
        <ul className="text-sm space-y-2">
          {featureFlags.map((f) => (
            <li
              key={f.key}
              className="flex items-center justify-between py-1 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
            >
              <span>
                <span className="font-mono text-xs">{f.key}</span>
                <span className="text-zinc-500 ml-2 text-xs hidden sm:inline">
                  ({f.description})
                </span>
              </span>
              <button
                onClick={() => onToggleFlag(f.key)}
                className={`chip chip-btn ${f.enabled ? '' : 'opacity-40'}`}
              >
                {f.enabled ? 'on ✓' : 'off'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Audit Log Card */}
      <div className="card">
        <h2 className="mb-2 font-semibold text-base">Audit log</h2>
        <ul className="space-y-1.5 font-mono text-xs text-zinc-500 max-h-72 overflow-y-auto pr-1">
          {auditLogs.map((l) => (
            <li key={l.id} className="truncate">
              {new Date(l.createdAt).toISOString()} · {l.action} {l.target ?? ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminView;
