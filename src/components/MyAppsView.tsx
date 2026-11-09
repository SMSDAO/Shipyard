import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Coins, 
  Globe, 
  Lock, 
  Tag, 
  Sparkles,
  ExternalLink,
  MoreVertical,
  Layers
} from 'lucide-react';
import { ShipyardApp, User, AppStatus } from '../types';

interface MyAppsViewProps {
  apps: ShipyardApp[];
  currentUser: User;
  onSelectApp: (app: ShipyardApp) => void;
  onCreateNew: () => void;
  onOpenTopUp: (pack?: number) => void;
  onUpdateApp?: (appId: string, updatedFields: Partial<ShipyardApp>) => void;
  onDeleteApp?: (appId: string) => void;
}

const CATEGORIES: Array<NonNullable<ShipyardApp['category']>> = [
  'Arcade',
  'Tipping',
  'Meme',
  'DeFi',
  'Social',
  'NFT',
];

const STATUS_OPTIONS: AppStatus[] = [
  'DRAFT',
  'PLANNING',
  'DESIGNING',
  'CODING',
  'REVIEWING',
  'DEPLOYING',
  'LIVE',
];

export const MyAppsView: React.FC<MyAppsViewProps> = ({
  apps,
  currentUser,
  onSelectApp,
  onCreateNew,
  onOpenTopUp,
  onUpdateApp,
  onDeleteApp,
}) => {
  const [editingApp, setEditingApp] = useState<ShipyardApp | null>(null);
  const [deletingApp, setDeletingApp] = useState<ShipyardApp | null>(null);
  const [mobileMenuOpenAppId, setMobileMenuOpenAppId] = useState<string | null>(null);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editIdea, setEditIdea] = useState('');
  const [editCategory, setEditCategory] = useState<ShipyardApp['category'] | ''>('');
  const [editStatus, setEditStatus] = useState<AppStatus>('PLANNING');
  const [editIsPublic, setEditIsPublic] = useState(true);

  const userApps = apps.filter(
    (a) => a.ownerId === currentUser.id || currentUser.isSuperAdmin
  );

  const ethFormatted = (wei?: string) => {
    if (!wei) return '—';
    return `${(Number(wei) / 1e18).toFixed(3)} ETH`;
  };

  const handleOpenEdit = (app: ShipyardApp, e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileMenuOpenAppId(null);
    setEditingApp(app);
    setEditName(app.name);
    setEditIdea(app.idea);
    setEditCategory(app.category || 'Arcade');
    setEditStatus(app.status);
    setEditIsPublic(app.isPublic);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editName.trim()) return;

    onUpdateApp?.(editingApp.id, {
      name: editName.trim(),
      idea: editIdea.trim(),
      category: editCategory ? (editCategory as ShipyardApp['category']) : undefined,
      status: editStatus,
      isPublic: editIsPublic,
    });

    setEditingApp(null);
  };

  const handleOpenDelete = (app: ShipyardApp, e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileMenuOpenAppId(null);
    setDeletingApp(app);
  };

  const handleConfirmDelete = () => {
    if (!deletingApp) return;
    onDeleteApp?.(deletingApp.id);
    setDeletingApp(null);
  };

  const toggleMobileMenu = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileMenuOpenAppId((cur) => (cur === appId ? null : appId));
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Credit Balance Card */}
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 font-medium">Credit balance</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">{currentUser.credits}</span>
            <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['100', '500', '2000'].map((p) => (
            <button
              key={p}
              className="btn-ghost text-xs px-3 py-1.5 font-medium hover:border-emerald-500/40 hover:text-emerald-400"
              onClick={() => onOpenTopUp(Number(p))}
            >
              +{p}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-semibold">Your Mini-Apps</h2>
          <p className="text-xs text-zinc-500">
            {userApps.length} {userApps.length === 1 ? 'application' : 'applications'} managed
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="btn text-xs px-3 py-1.5 font-medium flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm shadow-emerald-600/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New App</span>
        </button>
      </div>

      {/* Apps Grid */}
      {userApps.length === 0 ? (
        <div className="card text-center text-zinc-500 py-12 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-zinc-400">No applications found in this workspace</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Build viral crypto mini-apps for Base, Farcaster, and Telegram with multi-agent orchestration.
          </p>
          <div>
            <button
              onClick={onCreateNew}
              className="btn text-xs px-4 py-2 font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
            >
              Create your first app
            </button>
          </div>
        </div>
      ) : (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {userApps.map((a) => {
              const isMobileMenuOpen = mobileMenuOpenAppId === a.id;
              return (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => onSelectApp(a)}
                    className="card group relative block hover:border-emerald-500/60 cursor-pointer transition-all duration-200 overflow-hidden"
                  >
                    {/* Top Row: App Name, Status Chip, and Quick Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base truncate group-hover:text-emerald-400 transition-colors">
                            {a.name}
                          </h3>
                          {a.token && (
                            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              ${a.token.symbol}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Status Chip */}
                        <span
                          className={`chip text-[11px] font-medium ${
                            a.status === 'LIVE'
                              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40'
                              : a.status === 'CODING' || a.status === 'DEPLOYING'
                              ? 'text-blue-400 bg-blue-500/15 border-blue-500/40 animate-pulse'
                              : 'text-amber-400 bg-amber-500/15 border-amber-500/40'
                          }`}
                        >
                          {a.status}
                        </span>

                        {/* Mobile Quick Action Menu Toggle (visible on touch/small devices) */}
                        <button
                          type="button"
                          aria-label="Open actions menu"
                          onClick={(e) => toggleMobileMenu(a.id, e)}
                          className="sm:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Floating Bar on Hover (Desktop) */}
                    <div className="hidden sm:flex items-center gap-1 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto bg-zinc-900/90 backdrop-blur-md px-1.5 py-1 rounded-xl border border-zinc-700/80 shadow-xl z-10">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(a, e)}
                        title="Edit Details"
                        className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800/90 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-medium">Edit</span>
                      </button>

                      <div className="w-[1px] h-3.5 bg-zinc-700/60" />

                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(a, e)}
                        title="Delete App"
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/15 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>

                    {/* Mobile Quick Action Dropdown Menu */}
                    <AnimatePresence>
                      {isMobileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="sm:hidden absolute top-12 right-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1 z-20 flex flex-col gap-1 min-w-[130px]"
                        >
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(a, e)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg text-left"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(a, e)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/15 rounded-lg text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Delete App</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Idea / Description */}
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400 leading-relaxed">
                      {a.idea}
                    </p>

                    {/* Tags & Meta */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {a.category && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                          <Tag className="w-3 h-3 text-emerald-400" />
                          {a.category}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/50">
                        {a.isPublic ? (
                          <>
                            <Globe className="w-3 h-3 text-zinc-400" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-zinc-400" />
                            Private
                          </>
                        )}
                      </span>
                    </div>

                    {/* Card Footer: Wallet & Timestamp */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-[11px]">
                          {ethFormatted(a.wallet?.balanceWei)}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-400">Base</span>
                      </div>

                      <span className="text-[11px] text-zinc-500 shrink-0">
                        {new Date(a.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Edit Details Modal */}
      <AnimatePresence>
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingApp(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Edit App Details</h3>
                    <p className="text-xs text-zinc-500">Update configuration for {editingApp.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingApp(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                {/* App Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Application Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Pixel Arcade"
                    className="input"
                  />
                </div>

                {/* Idea / Prompt */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={editIdea}
                    onChange={(e) => setEditIdea(e.target.value)}
                    placeholder="Describe functionality, smart contract rules, and platform targets"
                    className="input resize-none"
                  />
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Category Tag
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = editCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                              : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AppStatus)}
                    className="input bg-zinc-800/90 text-sm"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-zinc-200">Public Marketplace Visibility</p>
                    <p className="text-[11px] text-zinc-500">
                      Allow other builders to discover and clone this application
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsPublic}
                      onChange={(e) => setEditIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="btn-ghost text-xs px-4 py-2 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-xs px-4 py-2 font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingApp(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              {/* Header with warning icon */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-zinc-100">Delete Application</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>

              {/* Explanatory Warning */}
              <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs space-y-2">
                <p className="text-zinc-300">
                  Are you sure you want to delete <span className="font-semibold text-white">"{deletingApp.name}"</span>?
                </p>
                <ul className="text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Generated frontend files and preview bundles will be removed.</li>
                  <li>Base L2 smart wallet config and agent history will be purged.</li>
                  {deletingApp.token && (
                    <li>Token metadata (${deletingApp.token.symbol}) will be detached.</li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingApp(null)}
                  className="btn-ghost text-xs px-4 py-2 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn text-xs px-4 py-2 font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm shadow-red-600/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Application</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
