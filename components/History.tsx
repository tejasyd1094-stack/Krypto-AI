import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HistoryItem, ChatHistoryItem } from '../types';
import { KryptoLogo } from './Branding';

interface HistoryProps { 
  history: HistoryItem[]; 
  chatHistory: ChatHistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history, chatHistory }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | ChatHistoryItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  if (history.length === 0 && chatHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-zinc-900 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl">
          <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-zinc-100">Empty Intelligence Vault</h2>
        <p className="text-zinc-500 max-w-sm mx-auto font-medium leading-relaxed">
          Your saved blueprints and chat sessions will appear here for future reference.
        </p>
      </div>
    );
  }

  const stripMarkdown = (text: string): string => {
    return text.replace(/#{1,6}\s?/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/>\s?/g, '').replace(/---/g, '\n').trim();
  };

  const handleDownloadDoc = () => {
    if (!selectedItem || !('result' in selectedItem)) return;
    const content = (selectedItem as HistoryItem).optimizedResult || (selectedItem as HistoryItem).result;
    setIsDownloading(true);
    
    try {
      const htmlContent = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/gim, '<br />');

      const fullHtml = `<html><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
      const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KryptoAI_Blueprint_${selectedItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!selectedItem || !('result' in selectedItem)) return;
    const content = (selectedItem as HistoryItem).optimizedResult || (selectedItem as HistoryItem).result;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(stripMarkdown(content));
      alert("Clean Executive Blueprint captured from vault.");
    } finally {
      setIsCopying(false);
    }
  };

  const getScoreColors = (score: number) => score <= 35 ? { s: 'stroke-red-500', t: 'text-red-500' } : score <= 75 ? { s: 'stroke-yellow-500', t: 'text-yellow-500' } : { s: 'stroke-green-500', t: 'text-green-500' };
  
  const isFeatureItem = selectedItem && 'result' in selectedItem;
  const isChatItem = selectedItem && 'messages' in selectedItem;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 pb-24">
      <div className="mb-12">
        <h2 className="text-4xl font-black gold-text-gradient tracking-tight uppercase">Intelligence Vault</h2>
        <p className="text-zinc-500 font-medium">Your historical strategy, chat archives, and market insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4 space-y-12">
          {/* Blueprint Vault */}
          <div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 px-2">Blueprint Vault</h3>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {history.length > 0 ? history.map(item => (
                <button key={item.id} onClick={() => setSelectedItem(item)} className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${selectedItem?.id === item.id ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="flex items-center justify-between mb-3"><span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.type === 'resume-audit' ? 'bg-yellow-500/10 text-yellow-500' : item.type === 'strategy' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>{item.type.replace('-', ' ')}</span><span className="text-[8px] font-black text-zinc-600 tracking-widest">{item.date}</span></div>
                  <h3 className="text-sm font-black text-zinc-100 leading-tight mb-2 uppercase tracking-tight line-clamp-2">{item.title}</h3>
                  {item.score !== undefined && <div className="flex items-center gap-2 mt-2"><div className={`w-1.5 h-1.5 rounded-full ${getScoreColors(item.score).t} bg-current`}></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score: {item.score}%</span></div>}
                </button>
              )) : <div className="p-6 text-center text-zinc-600 text-xs font-bold uppercase">No blueprints saved.</div>}
            </div>
          </div>

          {/* Chat Archive */}
          <div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 px-2">Chat Archive</h3>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {chatHistory.length > 0 ? chatHistory.map(item => (
                <button key={item.id} onClick={() => setSelectedItem(item)} className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${selectedItem?.id === item.id ? 'bg-zinc-800/50 border-zinc-700' : 'bg-[#0c0c0e] border-zinc-900 hover:border-zinc-800'}`}>
                  <p className="text-xs font-black text-zinc-100 leading-tight mb-2 uppercase tracking-tight line-clamp-2">{item.title}</p>
                  <span className="text-[9px] font-black text-zinc-600 tracking-widest">{item.date}</span>
                </button>
              )) : <div className="p-6 text-center text-zinc-600 text-xs font-bold uppercase">No chats archived.</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 min-h-[500px]">
          {selectedItem ? (
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-900">
                <h3 className="text-2xl font-black text-zinc-100 tracking-tight uppercase leading-none">{selectedItem.title}</h3>
                {/* FIX: Replaced empty SVG tags with actual icons for copy and download actions. */}
                {isFeatureItem && <div className="flex gap-3"><button onClick={handleCopy} disabled={isCopying} className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg></button><button onClick={handleDownloadDoc} disabled={isDownloading} className="px-4 py-2.5 bg-yellow-500 text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button></div>}
              </div>
              
              <div className="max-h-[70vh] overflow-y-auto pr-4">
                {isChatItem ? (
                  <div className="space-y-6">
                    {(selectedItem as ChatHistoryItem).messages.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0"><KryptoLogo size={16} /></div>}
                        <div className={`max-w-md p-4 rounded-[24px] ${msg.role === 'user' ? 'bg-yellow-500 text-zinc-950 rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                          <div className={`${msg.role === 'user' ? '' : 'prose-krypto'} prose-sm text-inherit`}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose-krypto text-zinc-300">
                    <ReactMarkdown>{(selectedItem as HistoryItem).optimizedResult || (selectedItem as HistoryItem).result}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-900 rounded-[48px] p-12 text-zinc-700 text-center animate-pulse"><div><div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6"><svg className="w-8 h-8 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div><p className="text-[10px] font-black uppercase tracking-[0.4em]">Select an intelligence entry to view details</p></div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
