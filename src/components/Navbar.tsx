import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  Coins, Sparkles, Rocket, Compass, Layers, Users, ShieldAlert, 
  ChevronDown, Check, User as UserIcon, Settings, ExternalLink, Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'create' | 'apps' | 'explore' | 'tokens' | 'org' | 'admin' | 'profile' | 'appDetail';
  setActiveTab: (tab: 'create' | 'apps' | 'explore' | 'tokens' | 'org' | 'admin' | 'profile') => void;
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onOpenTopUp: () => void;
  onOpenAdapters?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSwitchUser,
  onOpenTopUp,
  onOpenAdapters,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nav = [
    { id: 'create', label: 'Create', icon: Sparkles },
    { id: 'apps', label: 'My Apps', icon: Rocket },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'tokens', label: 'Tokens', icon: Layers },
    { id: 'org', label: 'Team', icon: Users },
  ] as const;

  const getInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return (user.handle || 'U').slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Top Header Bar matching shipyard layout */}
      <header className="glass sticky top-0 z-30 rounded-none border-x-0 border-t-0">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm">
          {/* Brand */}
          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 font-semibold text-brand-600 cursor-pointer shrink-0 transition hover:opacity-90"
          >
            <img src="/icon.svg" alt="Shipyard" width={24} height={24} className="rounded-md" />
            <span className="tracking-tight">Shipyard</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">
            {nav.map((item) => {
              const isActive = activeTab === item.id || (activeTab === 'appDetail' && item.id === 'apps');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap transition cursor-pointer text-sm ${
                    isActive
                      ? 'text-brand-600 font-semibold opacity-100'
                      : 'opacity-70 hover:text-brand-600 hover:opacity-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side: Real Adapters + Credits + User Profile & Persona Switcher + Admin */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Real Adapters Hub Trigger */}
            {onOpenAdapters && (
              <button
                onClick={onOpenAdapters}
                className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                title="Real Base L2, Telegram, GitHub & Gemini Adapters"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold hidden sm:inline">Real Adapters</span>
              </button>
            )}

            {/* Credit Counter & Quick Top-Up */}
            <button
              onClick={() => onOpenTopUp()}
              className="chip cursor-pointer text-xs flex items-center gap-1.5 transition hover:brightness-105"
              title="Click to top up credits"
            >
              <Coins className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold">{currentUser.credits}</span>
              <span className="opacity-70 hidden sm:inline">credits</span>
            </button>

            {/* User Profile & Persona Switcher Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`btn-ghost text-xs py-1 px-2 flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'profile' ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400' : ''
                }`}
                title="Account, profile & settings"
              >
                {/* User Avatar thumbnail */}
                <div className="w-6 h-6 rounded-full overflow-hidden bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-brand-500/40">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(currentUser)}</span>
                  )}
                </div>

                <span className="font-medium truncate max-w-[85px] sm:max-w-[120px]">
                  {currentUser.displayName || currentUser.handle}
                </span>
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="card absolute right-0 mt-2 w-64 z-50 p-2 text-xs space-y-1.5 shadow-2xl animate-fade-in border-zinc-200/90 dark:border-zinc-800/90">
                  {/* Current User Snapshot & Profile Button */}
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-750">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-500/40">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(currentUser)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {currentUser.displayName || currentUser.handle}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono truncate">
                          @{currentUser.handle}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="mt-2.5 w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Edit Profile & Settings</span>
                    </button>
                  </div>

                  {/* Switch Persona Header */}
                  <div className="px-2 pt-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Switch Persona ({users.length})
                  </div>

                  {/* Persona Options */}
                  <div className="space-y-0.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition ${
                          u.id === currentUser.id
                            ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{getInitials(u)}</span>
                            )}
                          </div>
                          <span className="truncate">{u.displayName || u.handle}</span>
                          <span className="text-[10px] opacity-60">({u.role.toLowerCase()})</span>
                        </div>
                        {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Admin Direct Access */}
                  <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-400"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-brand-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Profile Tab Link (Desktop) */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-1.5 rounded-lg transition cursor-pointer text-sm hidden sm:flex items-center gap-1 ${
                activeTab === 'profile'
                  ? 'text-brand-600 font-semibold bg-brand-500/10'
                  : 'opacity-70 hover:text-brand-600 hover:opacity-100'
              }`}
              title="Profile & Settings"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Profile</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile App Style Bottom Navigation Bar */}
      <nav className="md:hidden glass fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 py-2 px-2 flex items-center justify-around shadow-[0_-8px_24px_rgba(4,120,87,0.08)]">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab === 'appDetail' && item.id === 'apps');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 opacity-70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
        
        {/* Mobile Profile Link */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'profile'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 opacity-70'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Profile</span>
        </button>

        {/* Mobile Admin Link */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'admin'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 opacity-70'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Admin</span>
        </button>
      </nav>
    </>
  );
};
