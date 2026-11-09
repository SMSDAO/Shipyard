import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ShipyardApp, User, Org, FeatureFlag, AuditLog, ApiKey, Webhook 
} from './types';
import { 
  INITIAL_APPS, INITIAL_USERS, INITIAL_ORGS, INITIAL_FEATURE_FLAGS, 
  INITIAL_API_KEYS, INITIAL_WEBHOOKS, INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { CreateAppView } from './components/CreateAppView';
import { MyAppsView } from './components/MyAppsView';
import { AppDetailView } from './components/AppDetailView';
import { ExploreView } from './components/ExploreView';
import { TokensView } from './components/TokensView';
import { OrgView } from './components/OrgView';
import { AdminView } from './components/AdminView';
import { TopUpModal } from './components/TopUpModal';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { RealAdaptersHub } from './components/RealAdaptersHub';
import { ProfileView } from './components/ProfileView';
import { 
  loadOfflineState, 
  saveOfflineState, 
  getSyncQueue, 
  addToSyncQueue, 
  clearSyncQueue, 
  processSyncQueue, 
  isEffectiveOnline, 
  getSimulatedOffline, 
  setSimulatedOffline, 
  SyncQueueItem 
} from './lib/offlineSync';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'apps' | 'explore' | 'tokens' | 'org' | 'admin' | 'profile' | 'appDetail'>('create');
  const [selectedAppId, setSelectedAppId] = useState<string>('app_pixel_arcade');
  
  // Load initial state from local storage cache if available for instant offline hydration
  const cachedState = typeof window !== 'undefined' ? loadOfflineState() : null;

  const [apps, setApps] = useState<ShipyardApp[]>(cachedState?.apps || INITIAL_APPS);
  const [users, setUsers] = useState<User[]>(cachedState?.users || INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(cachedState?.currentUser || INITIAL_USERS[0]);
  const [orgs, setOrgs] = useState<Org[]>(cachedState?.orgs || INITIAL_ORGS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(cachedState?.webhooks || INITIAL_WEBHOOKS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(cachedState?.apiKeys || INITIAL_API_KEYS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(cachedState?.auditLogs || INITIAL_AUDIT_LOGS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(cachedState?.featureFlags || INITIAL_FEATURE_FLAGS);

  // Connectivity & Sync state
  const [isOnline, setIsOnline] = useState<boolean>(() => isEffectiveOnline());
  const [isSimulated, setIsSimulated] = useState<boolean>(() => getSimulatedOffline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => getSyncQueue());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(cachedState?.lastSavedAt || null);

  // Top up modal state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [defaultTopUpPack, setDefaultTopUpPack] = useState(500);

  // Real Adapters Hub modal state
  const [isAdaptersOpen, setIsAdaptersOpen] = useState(false);

  // Toast notifications matching sonner / attachment richColors
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3200);
  };

  // Automatically persist all state changes to local storage cache
  useEffect(() => {
    saveOfflineState({
      apps,
      users,
      currentUser,
      orgs,
      webhooks,
      apiKeys,
      auditLogs,
      featureFlags,
    });
  }, [apps, users, currentUser, orgs, webhooks, apiKeys, auditLogs, featureFlags]);

  // Sync state from server when online
  const syncFromServer = useCallback(async () => {
    if (!isEffectiveOnline()) return;

    try {
      const [appsRes, authRes, orgsRes, keysRes, adminRes] = await Promise.all([
        fetch('/api/apps').catch(() => null),
        fetch('/api/auth/me').catch(() => null),
        fetch('/api/orgs').catch(() => null),
        fetch('/api/api-keys').catch(() => null),
        fetch('/api/admin/stats').catch(() => null),
      ]);

      if (appsRes?.ok) {
        const data = await appsRes.json();
        if (data.apps) setApps(data.apps);
      }
      if (authRes?.ok) {
        const data = await authRes.json();
        if (data.user) setCurrentUser(data.user);
        if (data.users) setUsers(data.users);
      }
      if (orgsRes?.ok) {
        const data = await orgsRes.json();
        if (data.orgs) setOrgs(data.orgs);
      }
      if (keysRes?.ok) {
        const data = await keysRes.json();
        if (data.keys) setApiKeys(data.keys);
      }
      if (adminRes?.ok) {
        const data = await adminRes.json();
        if (data.flags) setFeatureFlags(data.flags);
        if (data.logs) setAuditLogs(data.logs);
      }
      setLastSyncedAt(new Date().toISOString());
    } catch {
      // Retain offline cached data
    }
  }, []);

  // Sync queue processor
  const triggerSync = useCallback(async () => {
    if (!isEffectiveOnline() || isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await processSyncQueue();
      setSyncQueue(getSyncQueue());

      if (result.syncedCount > 0) {
        showToast(`Synced ${result.syncedCount} offline change${result.syncedCount > 1 ? 's' : ''}!`, 'success');
        addAuditLog('sync.reconnect', `Synced ${result.syncedCount} actions`);
      }
      setLastSyncedAt(new Date().toISOString());
      await syncFromServer();
    } catch {
      showToast('Sync error. Pending actions saved to retry later.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncFromServer]);

  // Browser online/offline listener
  useEffect(() => {
    const handleOnline = () => {
      const eff = isEffectiveOnline();
      setIsOnline(eff);
      if (eff) {
        showToast('Connection restored — Syncing data...', 'info');
        triggerSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Network disconnected — Offline mode enabled', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (isEffectiveOnline()) {
      syncFromServer();
      if (getSyncQueue().length > 0) {
        triggerSync();
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncFromServer, triggerSync]);

  // Toggle simulated offline mode
  const handleToggleSimulated = () => {
    const next = !isSimulated;
    setSimulatedOffline(next);
    setIsSimulated(next);
    const eff = isEffectiveOnline();
    setIsOnline(eff);

    if (next) {
      showToast('Simulated Offline Mode enabled (Testing mode)', 'info');
    } else {
      showToast('Simulated Offline Mode disabled — Reconnecting...', 'info');
      triggerSync();
    }
  };

  const handleClearQueue = () => {
    clearSyncQueue();
    setSyncQueue([]);
    showToast('Offline sync queue cleared', 'info');
  };

  const handleAddCredits = async (amount: number) => {
    // Optimistic local update
    setCurrentUser((prev) => ({ ...prev, credits: prev.credits + amount }));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, credits: u.credits + amount } : u))
    );

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'TOP_UP',
        description: `Top up +${amount} credits`,
        url: '/api/credits',
        method: 'POST',
        payload: { pack: String(amount) },
      });
      setSyncQueue(getSyncQueue());
      showToast(`Added ${amount} credits (Queued to sync)`, 'info');
      addAuditLog('credits.topup', `+${amount} Credits (Offline)`);
      return;
    }

    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: String(amount) }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser((prev) => ({ ...prev, credits: data.credits }));
        showToast(`Added ${amount} credits`, 'success');
        addAuditLog('credits.topup', `+${amount} Credits`);
        syncFromServer();
      }
    } catch {
      addToSyncQueue({
        type: 'TOP_UP',
        description: `Top up +${amount} credits`,
        url: '/api/credits',
        method: 'POST',
        payload: { pack: String(amount) },
      });
      setSyncQueue(getSyncQueue());
      showToast(`Added ${amount} credits (Saved offline)`, 'info');
    }
  };

  const handleDeductCredits = (amount: number): boolean => {
    if (currentUser.credits < amount) {
      showToast(`Insufficient credits (${currentUser.credits} < ${amount}). Top up needed.`, 'error');
      setIsTopUpOpen(true);
      return false;
    }
    setCurrentUser((prev) => ({ ...prev, credits: prev.credits - amount }));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, credits: u.credits - amount } : u))
    );
    return true;
  };

  const handleAppCreated = (newApp: ShipyardApp) => {
    setApps([newApp, ...apps]);
    setSelectedAppId(newApp.id);
    setActiveTab('appDetail');

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'CREATE_APP',
        description: `Create app "${newApp.name}"`,
        url: '/api/apps',
        method: 'POST',
        payload: {
          name: newApp.name,
          idea: newApp.idea,
          launchToken: !!newApp.token,
          tokenSymbol: newApp.token?.symbol,
        },
      });
      setSyncQueue(getSyncQueue());
      addAuditLog('app.create', `${newApp.name} (Offline)`);
      showToast(`Created "${newApp.name}" (Queued for sync)`, 'info');
      return;
    }

    showToast(`Created app "${newApp.name}"`, 'success');
    addAuditLog('app.create', newApp.name);

    fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newApp.name,
        idea: newApp.idea,
        launchToken: !!newApp.token,
        tokenSymbol: newApp.token?.symbol,
      }),
    }).catch(() => {
      addToSyncQueue({
        type: 'CREATE_APP',
        description: `Create app "${newApp.name}"`,
        url: '/api/apps',
        method: 'POST',
        payload: {
          name: newApp.name,
          idea: newApp.idea,
          launchToken: !!newApp.token,
          tokenSymbol: newApp.token?.symbol,
        },
      });
      setSyncQueue(getSyncQueue());
    });
  };

  const handleUpdateApp = (updatedFields: Partial<ShipyardApp>) => {
    setApps((prev) =>
      prev.map((a) => (a.id === selectedAppId ? { ...a, ...updatedFields } : a))
    );

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'UPDATE_APP',
        description: `Update app fields for ${selectedAppId}`,
        url: `/api/apps/${selectedAppId}`,
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
      return;
    }

    fetch(`/api/apps/${selectedAppId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(() => {
      addToSyncQueue({
        type: 'UPDATE_APP',
        description: `Update app fields for ${selectedAppId}`,
        url: `/api/apps/${selectedAppId}`,
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
    });
  };

  const handleUpdateAppById = (appId: string, updatedFields: Partial<ShipyardApp>) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...updatedFields } : a))
    );

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'UPDATE_APP',
        description: `Update app fields for ${appId}`,
        url: `/api/apps/${appId}`,
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
      return;
    }

    fetch(`/api/apps/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(() => {
      addToSyncQueue({
        type: 'UPDATE_APP',
        description: `Update app fields for ${appId}`,
        url: `/api/apps/${appId}`,
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
    });
  };

  const handleDeleteApp = (appId: string) => {
    const target = apps.find((a) => a.id === appId);
    const targetName = target?.name || 'App';

    setApps((prev) => {
      const remaining = prev.filter((a) => a.id !== appId);
      if (selectedAppId === appId && remaining.length > 0) {
        setSelectedAppId(remaining[0].id);
      }
      return remaining;
    });

    addAuditLog('app.delete', targetName);
    showToast(`"${targetName}" deleted`, 'info');

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'DELETE_APP',
        description: `Delete app "${targetName}" (${appId})`,
        url: `/api/apps/${appId}`,
        method: 'DELETE',
      });
      setSyncQueue(getSyncQueue());
      return;
    }

    fetch(`/api/apps/${appId}`, {
      method: 'DELETE',
    }).catch(() => {
      addToSyncQueue({
        type: 'DELETE_APP',
        description: `Delete app "${targetName}" (${appId})`,
        url: `/api/apps/${appId}`,
        method: 'DELETE',
      });
      setSyncQueue(getSyncQueue());
    });
  };

  const handleSelectApp = (app: ShipyardApp) => {
    setSelectedAppId(app.id);
    setActiveTab('appDetail');
  };

  const handleSwitchUser = async (u: User) => {
    setCurrentUser(u);
    showToast(`Signed in as ${u.handle}`, 'info');

    if (isEffectiveOnline()) {
      try {
        await fetch('/api/auth/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: u.email }),
        });
      } catch {
        // continue
      }
    }
  };

  const handleUpdateProfile = async (updatedFields: Partial<User>) => {
    const updatedUser: User = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    addAuditLog('user.profile_update', `${updatedUser.displayName || updatedUser.handle} profile settings saved`);
    showToast('Profile and settings updated!', 'success');

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'UPDATE_PROFILE',
        description: `Update profile for ${currentUser.handle}`,
        url: '/api/auth/profile',
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
        }
      }
    } catch {
      addToSyncQueue({
        type: 'UPDATE_PROFILE',
        description: `Update profile for ${currentUser.handle}`,
        url: '/api/auth/profile',
        method: 'PATCH',
        payload: updatedFields,
      });
      setSyncQueue(getSyncQueue());
    }
  };

  const addAuditLog = (action: string, target?: string) => {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      target,
      actorEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      orgId: orgs[0]?.id,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleToggleFeatureFlag = (key: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
    showToast(`Feature flag "${key}" toggled`, 'info');

    if (!isEffectiveOnline()) {
      addToSyncQueue({
        type: 'TOGGLE_FLAG',
        description: `Toggle feature flag ${key}`,
        url: `/api/admin/flags/${key}`,
        method: 'PATCH',
      });
      setSyncQueue(getSyncQueue());
      return;
    }

    fetch(`/api/admin/flags/${key}`, { method: 'PATCH' }).catch(() => {
      addToSyncQueue({
        type: 'TOGGLE_FLAG',
        description: `Toggle feature flag ${key}`,
        url: `/api/admin/flags/${key}`,
        method: 'PATCH',
      });
      setSyncQueue(getSyncQueue());
    });
  };

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];

  return (
    <div className="min-h-screen">
      {/* Animated Aurora Backdrop */}
      <div className="aurora" aria-hidden="true">
        <i />
      </div>

      {/* Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenTopUp={(pack?: unknown) => {
          if (typeof pack === 'number' && [100, 500, 2000].includes(pack)) {
            setDefaultTopUpPack(pack);
          } else {
            setDefaultTopUpPack(500);
          }
          setIsTopUpOpen(true);
        }}
        onOpenAdapters={() => setIsAdaptersOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6 mb-16 md:mb-6">
        {/* Offline & Sync Status Banner */}
        <OfflineSyncBanner
          isOnline={isOnline}
          isSimulated={isSimulated}
          isSyncing={isSyncing}
          queue={syncQueue}
          onToggleSimulated={handleToggleSimulated}
          onTriggerSync={triggerSync}
          onClearQueue={handleClearQueue}
          lastSyncedAt={lastSyncedAt}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <CreateAppView
                currentUser={currentUser}
                onAppCreated={handleAppCreated}
                onDeductCredits={handleDeductCredits}
                onOpenTopUp={() => setIsTopUpOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'apps' && (
            <motion.div
              key="apps"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <MyAppsView
                apps={apps}
                currentUser={currentUser}
                onSelectApp={handleSelectApp}
                onCreateNew={() => setActiveTab('create')}
                onOpenTopUp={(pack?: unknown) => {
                  if (typeof pack === 'number' && [100, 500, 2000].includes(pack)) {
                    setDefaultTopUpPack(pack);
                  } else {
                    setDefaultTopUpPack(500);
                  }
                  setIsTopUpOpen(true);
                }}
                onUpdateApp={handleUpdateAppById}
                onDeleteApp={handleDeleteApp}
              />
            </motion.div>
          )}

          {activeTab === 'appDetail' && selectedApp && (
            <motion.div
              key={`appDetail-${selectedApp.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <AppDetailView
                app={selectedApp}
                currentUser={currentUser}
                onBack={() => setActiveTab('apps')}
                onUpdateApp={handleUpdateApp}
                isOnline={isOnline}
              />
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <ExploreView apps={apps} onSelectApp={handleSelectApp} />
            </motion.div>
          )}

          {activeTab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <TokensView
                apps={apps}
                currentUser={currentUser}
                onSelectApp={handleSelectApp}
                onUpdateApp={handleUpdateAppById}
              />
            </motion.div>
          )}

          {activeTab === 'org' && (
            <motion.div
              key="org"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <OrgView
                orgs={orgs}
                currentUser={currentUser}
                onUpdateOrgs={setOrgs}
                webhooks={webhooks}
                onUpdateWebhooks={setWebhooks}
                apiKeys={apiKeys}
                onUpdateApiKeys={setApiKeys}
                auditLogs={auditLogs}
                onAddAuditLog={addAuditLog}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <AdminView
                currentUser={currentUser}
                featureFlags={featureFlags}
                onToggleFlag={handleToggleFeatureFlag}
                auditLogs={auditLogs}
                apps={apps}
                users={users}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <ProfileView
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                appsCount={apps.filter((a) => a.ownerId === currentUser.id).length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Credit Top-Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        defaultPack={defaultTopUpPack}
        onClose={() => setIsTopUpOpen(false)}
        onAddCredits={handleAddCredits}
      />

      {/* Real Adapters Verification Hub Modal */}
      <RealAdaptersHub
        isOpen={isAdaptersOpen}
        onClose={() => setIsAdaptersOpen(false)}
      />

      {/* Toast Notification matching Toaster top-center from shipyard layout */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 card py-2 px-4 shadow-xl text-xs font-medium border-brand-500/40 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
