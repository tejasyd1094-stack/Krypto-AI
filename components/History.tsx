
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-zinc-900 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl">
          <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-zinc-100">Empty Blueprint Vault</h2>
        <p className="text-zinc-500 max-w-sm mx-auto font-medium leading-relaxed">
          Your saved strategies and market insights will appear here for future reference.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h2 className="text-4xl font-black gold-text-gradient tracking-tight uppercase">Saved Intelligence</h2>
        <p className="text-zinc-500 font-medium">Your historical strategy and market insights vault.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List side */}
        <div className="space-y-4">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`w-full text-left p-6 rounded-[32px] border transition-all ${
                selectedItem?.id === item.id
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                  item.type === 'strategy' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {item.type}
                </span>
                <span className="text-[8px] font-black text-zinc-600 tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-sm font-black text-zinc-100 leading-tight mb-2">{item.title}</h3>
              <p className="text-[10px] text-zinc-500 font-medium truncate">Goal: {item.inputs.careerGoal || item.title}</p>
            </button>
          ))}
        </div>

        {/* View side */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-zinc-900">
                <div>
                  <h3 className="text-2xl font-black text-zinc-100 tracking-tight">{selectedItem.title}</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Generated: {selectedItem.date}</p>
                </div>
                <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-[9px] font-black uppercase tracking-widest">
                  {selectedItem.type.replace('-', ' ')}
                </div>
              </div>

              {/* Inputs Summary */}
              <div className="mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Strategy Constraints</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedItem.inputs).map(([key, val]) => (
                    <div key={key} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                      <p className="text-[8px] font-black text-yellow-500/60 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xs font-bold text-zinc-300">{val || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result Content */}
              <div className="prose-krypto text-zinc-300 text-sm sm:text-base leading-relaxed">
                <ReactMarkdown>{selectedItem.result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#0c0c0e]/50 border-2 border-dashed border-zinc-900 rounded-[48px] text-zinc-700">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-sm font-black uppercase tracking-widest">Select an intelligence report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
