
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenKeySelector = async () => {
    // Fix: Access window.aistudio using any cast to resolve TypeScript error
    const win = window as any;
    if (win.aistudio && typeof win.aistudio.openSelectKey === 'function') {
      await win.aistudio.openSelectKey();
    } else {
      alert("API Key selection is only available in the AI Studio environment.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black gold-text-gradient">System Settings</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* API Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">
                Model Configuration
              </label>
              <div className="p-6 bg-zinc-950 rounded-[28px] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-200">API Key Access</p>
                    <p className="text-xs text-zinc-500">Required for Pro features & image generation.</p>
                  </div>
                  <button 
                    onClick={handleOpenKeySelector}
                    className="px-4 py-2 bg-yellow-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
                  >
                    Select Key
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 italic">
                  Note: For high-quality generation, ensure you use a key from a paid GCP project. 
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-500/50 hover:text-yellow-500 ml-1">Learn more about billing.</a>
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">
                User Profile
              </label>
              <div className="flex items-center gap-4 p-6 bg-zinc-950 rounded-[28px] border border-zinc-800">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                  <img src="https://picsum.photos/48/48" alt="Profile" />
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-200">Guest Architect</p>
                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Premium Beta Access</p>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="pt-6 border-t border-zinc-800 flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <span>Krypto AI v2.4.0</span>
              <span className="text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
