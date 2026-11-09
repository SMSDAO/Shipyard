import { ShipyardApp, User, Org, FeatureFlag, ApiKey, Webhook, AuditLog } from '../types';

export interface OfflineState {
  apps: ShipyardApp[];
  currentUser: User;
  users: User[];
  orgs: Org[];
  webhooks: Webhook[];
  apiKeys: ApiKey[];
  auditLogs: AuditLog[];
  featureFlags: FeatureFlag[];
  lastSavedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: 
    | 'CREATE_APP' 
    | 'UPDATE_APP' 
    | 'DELETE_APP'
    | 'TOP_UP' 
    | 'WITHDRAW' 
    | 'CLAIM_FEES' 
    | 'AGENT_TURN' 
    | 'TOGGLE_FLAG' 
    | 'CREATE_ORG' 
    | 'INVITE_MEMBER' 
    | 'CREATE_WEBHOOK' 
    | 'DELETE_WEBHOOK' 
    | 'CREATE_API_KEY' 
    | 'REVOKE_API_KEY'
    | 'UPDATE_PROFILE';
  description: string;
  url: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload?: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  retryCount: number;
  error?: string;
}

const STORAGE_KEY_STATE = 'shipyard_offline_state_v1';
const STORAGE_KEY_QUEUE = 'shipyard_sync_queue_v1';
const STORAGE_KEY_SIMULATE_OFFLINE = 'shipyard_simulate_offline_v1';

// Save all app data to local storage
export function saveOfflineState(state: Omit<OfflineState, 'lastSavedAt'>): void {
  try {
    const data: OfflineState = {
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save offline state to localStorage:', err);
  }
}

// Load cached offline state
export function loadOfflineState(): OfflineState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineState;
  } catch (err) {
    console.warn('Failed to read offline state from localStorage:', err);
    return null;
  }
}

// Get the pending synchronization queue
export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw) as SyncQueueItem[];
  } catch {
    return [];
  }
}

// Save the queue
function saveSyncQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to save sync queue:', err);
  }
}

// Add an action to the sync queue
export function addToSyncQueue(
  action: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
): SyncQueueItem {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    ...action,
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    retryCount: 0,
  };
  queue.push(newItem);
  saveSyncQueue(queue);
  return newItem;
}

// Remove an item from the sync queue
export function removeFromSyncQueue(id: string): void {
  const queue = getSyncQueue().filter((item) => item.id !== id);
  saveSyncQueue(queue);
}

// Clear the entire queue
export function clearSyncQueue(): void {
  saveSyncQueue([]);
}

// Simulated offline mode state
export function getSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SIMULATE_OFFLINE) === 'true';
  } catch {
    return false;
  }
}

export function setSimulatedOffline(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SIMULATE_OFFLINE, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

// Check effective online status (considering both real browser online & simulated offline)
export function isEffectiveOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (getSimulatedOffline()) return false;
  return navigator.onLine;
}

// Process the synchronization queue against the backend
export async function processSyncQueue(
  onProgress?: (syncedItem: SyncQueueItem, remaining: number) => void
): Promise<{ success: boolean; syncedCount: number; failedCount: number }> {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0 };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const remainingQueue: SyncQueueItem[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    item.status = 'SYNCING';

    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Shipyard-Offline-Sync': 'true',
          'X-Shipyard-Sync-Id': item.id,
        },
        body: item.payload ? JSON.stringify(item.payload) : undefined,
      });

      if (!response.ok && response.status !== 404) {
        // If server returns error, mark failed and retry later
        item.status = 'FAILED';
        item.retryCount += 1;
        item.error = `HTTP ${response.status}`;
        remainingQueue.push(item);
        failedCount++;
      } else {
        item.status = 'SYNCED';
        syncedCount++;
        if (onProgress) {
          onProgress(item, queue.length - (i + 1));
        }
      }
    } catch (err) {
      item.status = 'FAILED';
      item.retryCount += 1;
      item.error = (err as Error).message;
      remainingQueue.push(item);
      failedCount++;
    }
  }

  saveSyncQueue(remainingQueue);
  return { success: failedCount === 0, syncedCount, failedCount };
}
