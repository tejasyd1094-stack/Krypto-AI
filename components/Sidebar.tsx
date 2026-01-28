import React from 'react';
import { TabType, UserStatus, PlanId } from '../types';
import { supabase } from '../lib/supabase';
import { KryptoLogo } from './Branding';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: UserStatus;
  onLogout: () => void;
  newHistoryCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, user, onLogout, newHistoryCount }) => {
  const navItems: { label: TabType; icon: React.ReactNode }[] = [
    { 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      label: 'Profile & Roadmap', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
    { 
      label: 'Resume Scorer', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) 
    },
    { 
      label: 'Career Path', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      label: 'Outreach Architect', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      label: 'Interview Lab', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ) 
    },
    { 
      label: 'History', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
    { 
      label: 'Pricing', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
  ];

  const getPlanName = (id: PlanId) => {
    switch (id) {
      case 'ultra-pro': return 'Ultra Pro';
      case 'pro': return 'Professional';
      case 'starter': return 'Starter';
      default: return 'Free Architect';
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}/>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 mb-10">
            <KryptoLogo className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
            <h1 className="text-xl font-black tracking-tighter gold-text-gradient uppercase">Krypto AI</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { setActiveTab(item.label); setIsOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest transition-all group uppercase whitespace-nowrap overflow-hidden relative ${
                  activeTab === item.label 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <span className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.label ? 'text-yellow-500' : 'text-zinc-600'}`}>
                  {item.icon}
                </span>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.label === 'History' && newHistoryCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-yellow-500 text-zinc-950 text-[10px] font-black rounded-full animate-in zoom-in">
                    {newHistoryCount}
                  </span>
                )}
                <span className="ml-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">→</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Architect Plan</span>
              <span className="text-[8px] font-black uppercase text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 tracking-widest">
                {getPlanName(user.planId)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-zinc-400">Ledger Credits</span>
                <span className="text-zinc-100">{user.credits}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (user.credits / 1000) * 100)}%` }}/>
              </div>
            </div>
          </div>

          {/* Logout Trigger */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest text-red-500/70 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all group uppercase mt-2"
          >
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;