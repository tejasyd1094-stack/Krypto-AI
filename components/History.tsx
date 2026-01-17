
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from '../types';

interface HistoryProps { history: HistoryItem[]; }

/**
 * History Component
 * Displays the vault of historical career strategies, resume audits, and market insights.
 */
const History: React.FC<HistoryProps> = ({ history }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

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

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s?/g, '') 
      .replace(/__/g, '')        
      .replace(/\*/g, '•')       
      .replace(/•{2,}/g, (match) => match.length === 2 ? '**' : match) 
      .replace(/_{1,2}/g, '')     
      .replace(/>\s?/g, '')      
      .replace(/---/g, '========================================') 
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();
  };

  /**
   * Generates a Word-compatible file using a simple HTML wrapper.
   * Word/Google Docs can open .doc files containing HTML and render them correctly.
   */
  const handleDownloadDoc = () => {
    if (!selectedItem?.optimizedResult && !selectedItem?.result) return;
    const content = selectedItem.optimizedResult || selectedItem.result;
    setIsDownloading(true);
    
    try {
      // Basic Markdown to HTML conversion for Word compatibility
      const htmlContent = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/gim, '<br />');

      const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Krypto AI Export</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = selectedItem.title.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `KryptoAI_Blueprint_${safeTitle}.doc`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);
    } catch (err) {
      console.error("Download Error:", err);
      alert("Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!selectedItem?.optimizedResult && !selectedItem?.result) return;
    const content = selectedItem.optimizedResult || selectedItem.result;
    setIsCopying(true);
    try {
      const cleanText = stripMarkdown(content);
      await navigator.clipboard.writeText(cleanText);
      alert("Clean Executive Blueprint captured from vault.");
    } catch (err) {
      console.error("Copy Error:", err);
    } finally {
      setIsCopying(false);
    }
  };

  const getScoreColors = (score: number) => {
    if (score <= 35) return { stroke: 'stroke-red-500', text: 'text-red-500' };
    if (score <= 75) return { stroke: 'stroke-yellow-500', text: 'text-yellow-500' };
    return { stroke: 'stroke-green-500', text: 'text-green-500' };
  };

  const radius = 25;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-24">
      <div className="mb-12">
        <h2 className="text-4xl font-black gold-text-gradient tracking-tight uppercase">Saved Intelligence</h2>
        <p className="text-zinc-500 font-medium">Your historical strategy and market insights vault.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${
                selectedItem?.id === item.id
                  ? 'bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/20'
                  : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                  item.type === 'resume-audit' ? 'bg-yellow-500/10 text-yellow-500' :
                  item.type === 'strategy' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {item.type.replace('-', ' ')}
                </span>
                <span className="text-[8px] font-black text-zinc-600 tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-sm font-black text-zinc-100 leading-tight mb-2 uppercase tracking-tight line-clamp-2">{item.title}</h3>
              {item.score !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${getScoreColors(item.score).text} bg-current`}></div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score: {item.score}%</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 min-h-[500px]">
          {selectedItem ? (
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-900">
                <div className="flex items-center gap-6">
                  {selectedItem.score !== undefined && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                       <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none" strokeWidth="4" />
                        <circle 
                          cx="50%" cy="50%" r={radius} 
                          className={`fill-none transition-all duration-1000 ${getScoreColors(selectedItem.score).stroke}`} 
                          strokeWidth="4" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference - (selectedItem.score / 100) * circumference} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[10px] font-black ${getScoreColors(selectedItem.score).text}`}>{selectedItem.score}%</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-zinc-100 tracking-tight uppercase leading-none">{selectedItem.title}</h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Archived Protocol: {selectedItem.date}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={handleCopy} disabled={isCopying} className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2">
                      {isCopying ? "..." : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                      Copy
                   </button>
                   <button onClick={handleDownloadDoc} disabled={isDownloading} className="px-4 py-2.5 bg-yellow-500 text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 flex items-center gap-2">
                      {isDownloading ? "..." : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                      Export .doc
                   </button>
                </div>
              </div>
              <div className="prose-krypto text-zinc-300">
                <ReactMarkdown>{selectedItem.optimizedResult || selectedItem.result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-900 rounded-[48px] p-12 text-zinc-700 text-center animate-pulse">
               <div>
                  <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select an intelligence entry to view details</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
