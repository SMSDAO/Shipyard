import React, { useState } from 'react';
import { Org, OrgMember, OrgRole, Webhook, ApiKey, AuditLog, User } from '../types';

const EVENTS = ['app.live', 'build.failed', 'token.launched', 'funds.withdrawn'];

interface OrgViewProps {
  orgs: Org[];
  currentUser: User;
  onUpdateOrgs: (orgs: Org[]) => void;
  webhooks: Webhook[];
  onUpdateWebhooks: (webhooks: Webhook[]) => void;
  apiKeys: ApiKey[];
  onUpdateApiKeys: (keys: ApiKey[]) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, target?: string) => void;
}

export function OrgView({
  orgs,
  currentUser,
  onUpdateOrgs,
  webhooks,
  onUpdateWebhooks,
  apiKeys,
  onUpdateApiKeys,
  auditLogs,
  onAddAuditLog,
}: OrgViewProps) {
  const [orgId, setOrgId] = useState(orgs[0]?.id || '');
  const [secret, setSecret] = useState<{ label: string; value: string } | null>(null);

  const org = orgs.find((o) => o.id === orgId) || orgs[0];
  const canManage = org?.role === 'OWNER' || org?.role === 'ADMIN' || currentUser.isSuperAdmin;

  function createOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name'));
    const slug = String(f.get('slug'));
    if (!name || !slug) return;

    const newOrg: Org = {
      id: `org_${Date.now()}`,
      name,
      slug,
      role: 'OWNER',
      members: [
        {
          userId: currentUser.id,
          email: currentUser.email,
          handle: currentUser.handle,
          role: 'OWNER',
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    onUpdateOrgs([...orgs, newOrg]);
    setOrgId(newOrg.id);
    onAddAuditLog('org.create', name);
    e.currentTarget.reset();
  }

  function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email'));
    const role = (f.get('role') as OrgRole) || 'BUILDER';
    if (!email) return;

    const inviteUrl = `${window.location.origin}/invite/inv_${Math.random().toString(36).substring(2, 10)}`;
    const newMember: OrgMember = {
      userId: `usr_${Date.now()}`,
      email,
      handle: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString(),
    };

    const nextOrgs = orgs.map((o) =>
      o.id === org.id ? { ...o, members: [...o.members, newMember] } : o
    );
    onUpdateOrgs(nextOrgs);
    setSecret({
      label: 'Invite link (email not configured — share it manually)',
      value: inviteUrl,
    });
    onAddAuditLog('member.invite', `${email} (${role})`);
    e.currentTarget.reset();
  }

  function addHook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const url = String(f.get('url'));
    const chosenEvents = f.getAll('events').map(String);
    if (!url) return;

    const hookSecret = `whsec_${Math.random().toString(16).substring(2, 14)}`;
    const newHook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events: chosenEvents.length > 0 ? chosenEvents : ['app.live'],
      secret: hookSecret,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onUpdateWebhooks([...webhooks, newHook]);
    setSecret({
      label: 'Signing secret (shown once)',
      value: hookSecret,
    });
    onAddAuditLog('webhook.create', url);
    e.currentTarget.reset();
  }

  function addKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name'));
    const readOnly = f.get('readOnly') === 'on';
    if (!name) return;

    const rawKey = `sk_live_${Math.random().toString(36).substring(2, 16)}${Math.random().toString(36).substring(2, 16)}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      prefix: rawKey.slice(0, 10),
      readOnly,
      createdAt: new Date().toISOString(),
    };

    onUpdateApiKeys([...apiKeys, newKey]);
    setSecret({
      label: 'API key (shown once)',
      value: rawKey,
    });
    onAddAuditLog('api_key.create', name);
    e.currentTarget.reset();
  }

  function exportAuditCSV() {
    let csv = 'id,createdAt,action,target,actorEmail\n';
    for (const l of auditLogs) {
      csv += `"${l.id}","${l.createdAt}","${l.action}","${l.target || ''}","${l.actorEmail}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipyard-audit-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Revealed Secret Banner matching shipyard/src/components/OrgAdmin.tsx */}
      {secret && (
        <div className="card border-amber-400">
          <p className="text-sm font-medium">{secret.label}</p>
          <code className="block break-all rounded bg-zinc-100 p-2 text-xs dark:bg-zinc-800 my-2">
            {secret.value}
          </code>
          <button
            className="btn-ghost mt-2"
            onClick={() => {
              navigator.clipboard.writeText(secret.value);
              setSecret(null);
            }}
          >
            Copy & dismiss
          </button>
        </div>
      )}

      {/* Workspace Selector Bar */}
      <div className="card flex flex-wrap items-center gap-2">
        <select
          className="input w-auto"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        >
          {orgs.length === 0 && <option value="">No workspaces yet</option>}
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.role.toLowerCase()})
            </option>
          ))}
        </select>
        <form onSubmit={createOrg} className="ml-auto flex gap-2">
          <input
            className="input w-36"
            name="name"
            placeholder="New workspace"
            required
            minLength={2}
          />
          <input
            className="input w-28"
            name="slug"
            placeholder="slug"
            required
            pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]"
          />
          <button className="btn">Create</button>
        </form>
      </div>

      {/* Members Section Card */}
      {org && (
        <section className="card space-y-2">
          <h2 className="font-semibold text-base">Members</h2>
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {org.members.map((m) => (
              <li key={m.userId} className="flex items-center gap-2 py-2">
                <span className="flex-1 truncate">{m.email ?? m.handle ?? m.userId}</span>
                <select
                  className="input w-auto"
                  disabled={!canManage}
                  value={m.role}
                  onChange={(e) => {
                    const nextRole = e.target.value as OrgRole;
                    const nextOrgs = orgs.map((o) => {
                      if (o.id !== org.id) return o;
                      return {
                        ...o,
                        members: o.members.map((x) =>
                          x.userId === m.userId ? { ...x, role: nextRole } : x
                        ),
                      };
                    });
                    onUpdateOrgs(nextOrgs);
                    onAddAuditLog('member.role', `${m.handle} -> ${nextRole}`);
                  }}
                >
                  {(['OWNER', 'ADMIN', 'BUILDER', 'VIEWER'] as OrgRole[]).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {canManage && m.userId !== currentUser.id && (
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      const nextOrgs = orgs.map((o) => {
                        if (o.id !== org.id) return o;
                        return {
                          ...o,
                          members: o.members.filter((x) => x.userId !== m.userId),
                        };
                      });
                      onUpdateOrgs(nextOrgs);
                      onAddAuditLog('member.remove', m.handle);
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          {canManage && (
            <form onSubmit={invite} className="flex flex-wrap gap-2 pt-2">
              <input
                className="input flex-1"
                name="email"
                type="email"
                placeholder="teammate@company.com"
                required
              />
              <select className="input w-auto" name="role" defaultValue="BUILDER">
                {['ADMIN', 'BUILDER', 'VIEWER'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button className="btn">Invite</button>
            </form>
          )}
        </section>
      )}

      {/* Webhooks Section Card */}
      {org && canManage && (
        <section className="card space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Webhooks</h2>
            <button className="btn-ghost" onClick={exportAuditCSV}>
              Export audit log (CSV)
            </button>
          </div>
          <ul className="space-y-1 text-sm">
            {webhooks.map((h) => (
              <li key={h.id} className="flex items-center gap-2 py-1">
                <span className="flex-1 truncate">
                  {h.url}{' '}
                  <span className="text-xs text-zinc-500">
                    ({h.events.join(', ')})
                  </span>
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    onUpdateWebhooks(webhooks.filter((x) => x.id !== h.id));
                    onAddAuditLog('webhook.delete', h.url);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
            {webhooks.length === 0 && <li className="text-zinc-500">No endpoints.</li>}
          </ul>
          <form onSubmit={addHook} className="space-y-2 pt-2">
            <input
              className="input"
              name="url"
              type="url"
              placeholder="https://example.com/hooks/shipyard"
              required
            />
            <div className="flex flex-wrap gap-3 text-xs">
              {EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    name="events"
                    value={ev}
                    defaultChecked={ev === 'app.live'}
                    className="accent-brand-600"
                  />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
            <button className="btn">Add endpoint</button>
          </form>
        </section>
      )}

      {/* API Keys Section Card */}
      <section className="card space-y-2">
        <h2 className="font-semibold text-base">Your API keys</h2>
        <ul className="space-y-1 text-sm">
          {apiKeys.map((k) => (
            <li key={k.id} className="flex items-center gap-2 py-1">
              <span className="flex-1">
                {k.name} <code className="text-xs text-zinc-500">{k.prefix}…</code>{' '}
                {k.readOnly && <span className="chip">read-only</span>}
              </span>
              <button
                className="btn-ghost"
                onClick={() => {
                  onUpdateApiKeys(apiKeys.filter((x) => x.id !== k.id));
                  onAddAuditLog('api_key.revoke', k.name);
                }}
              >
                Revoke
              </button>
            </li>
          ))}
          {apiKeys.length === 0 && <li className="text-zinc-500">No keys.</li>}
        </ul>
        <form onSubmit={addKey} className="flex flex-wrap items-center gap-2 pt-2">
          <input
            className="input flex-1"
            name="name"
            placeholder="Key name (e.g. CI)"
            required
            maxLength={60}
          />
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" name="readOnly" className="accent-brand-600" />
            <span>read-only</span>
          </label>
          <button className="btn">Create key</button>
        </form>
      </section>
    </div>
  );
}

export default OrgView;
