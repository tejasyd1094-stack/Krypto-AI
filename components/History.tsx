import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HistoryItem, ChatHistoryItem } from '../types';
import { KryptoLogo } from './Branding';
import SimulationFeedbackDashboard from './SimulationFeedbackDashboard';

interface ParsedInterviewFeedback {
  score: number;
  strengths: { title: string; desc: string }[];
  competencies: { name: string; score: number; comment: string }[];
  development: { title: string; action: string }[];
}

const parseInterviewFeedback = (text: string): ParsedInterviewFeedback => {
  const result: ParsedInterviewFeedback = {
    score: 85, // Default fallback
    strengths: [],
    competencies: [],
    development: []
  };

  try {
    // 1. Extract Overall Score
    const scoreMatch = text.match(/OVERALL SCORE:\s*(\d+)%/i);
    if (scoreMatch) {
      result.score = parseInt(scoreMatch[1], 10);
    }

    // 2. Sections splitting
    const strengthsSection = text.split(/STRENGTHS/i)[1]?.split(/COMPETENCIES/i)[0] || "";
    const competenciesSection = text.split(/COMPETENCIES/i)[1]?.split(/DEVELOPMENT PLAN|REFINEMENTS/i)[0] || "";
    const devSection = text.split(/DEVELOPMENT PLAN|REFINEMENTS/i)[1] || "";

    // Helper to parse list lines
    const parseLines = (sectionText: string) => {
      const lines = sectionText.split('\n');
      const items: { title: string; value: string }[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          // Match * **Title**: desc
          const match = trimmed.match(/^[\*\-]\s*\*\*(.*?)\*\*:\s*(.*)$/);
          if (match) {
            items.push({ title: match[1].trim(), value: match[2].trim() });
          } else {
            // Alternately match * **Title** - desc or * Title: desc
            const secondMatch = trimmed.match(/^[\*\-]\s*(.*?):\s*(.*)$/);
            if (secondMatch) {
              items.push({ title: secondMatch[1].replace(/\*\*/g, '').trim(), value: secondMatch[2].trim() });
            }
          }
        }
      }
      return items;
    };

    // Strengths
    const rawStrengths = parseLines(strengthsSection);
    result.strengths = rawStrengths.map(item => ({
      title: item.title,
      desc: item.value
    }));

    // Competencies
    const rawCompetencies = parseLines(competenciesSection);
    result.competencies = rawCompetencies.map(item => {
      const scorePctMatch = item.value.match(/^(\d+)%\s*-\s*(.*)$/);
      if (scorePctMatch) {
        return {
          name: item.title,
          score: parseInt(scorePctMatch[1], 10),
          comment: scorePctMatch[2].trim()
        };
      }
      const altMatch = item.value.match(/^(\d+)%\s*(.*)$/);
      if (altMatch) {
        return {
          name: item.title,
          score: parseInt(altMatch[1], 10),
          comment: altMatch[2].trim()
        };
      }
      return {
        name: item.title,
        score: 80,
        comment: item.value
      };
    });

    // Development
    const rawDev = parseLines(devSection);
    result.development = rawDev.map(item => ({
      title: item.title,
      action: item.value
    }));
  } catch (err) {
    console.warn("Feedback processing note: falling back to defaults due to parse drift", err);
  }

  // Ensure fallback items if anything is missing to keep UI robust
  if (result.strengths.length === 0) {
    result.strengths = [
      { title: "Execution Quality", desc: "Demonstrated refined execution of situational frameworks under structural stress." },
      { title: "Quantifiable Metrics", desc: "Aligned key performance indicators clearly with clear business metric impacts." }
    ];
  }
  if (result.competencies.length === 0) {
    result.competencies = [
      { name: "Technical Rigor", score: 85, comment: "Demonstrates strong performance architecture awareness." },
      { name: "Cross-Functional Synergy", score: 80, comment: "Keeps business milestones and team motivations aligned cleanly." }
    ];
  }
  if (result.development.length === 0) {
    result.development = [
      { title: "Narrative Density", action: "Speed up high-level absorption by streamlining your initial history setups." }
    ];
  }

  return result;
};

interface InterviewSimulationFeedbackProps {
  result: string;
}

const InterviewSimulationFeedback: React.FC<InterviewSimulationFeedbackProps> = ({ result }) => {
  const parsed = parseInterviewFeedback(result);
  
  const scoreBadgeBg = parsed.score >= 85 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : parsed.score >= 70 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-red-500/10 border-red-500/20 text-red-400';

  return (
    <div className="space-y-12 animate-in fade-in duration-500 select-text">
      {/* 1. Verdict card with Circular Score */}
      <div className={`p-8 rounded-[36px] border flex flex-col md:flex-row items-center justify-between gap-6 ${scoreBadgeBg}`}>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20 mb-2">
            Interactive Performance Audit
          </div>
          <h4 className="text-3xl font-black uppercase tracking-tight text-white leading-none">Readiness Verdict</h4>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mt-2 font-medium">
            Based on active performance mapping against real organization benchmarks and simulated situational constraints.
          </p>
        </div>
        
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-28 h-28 flex items-center justify-center bg-zinc-950 rounded-full border border-zinc-800 shadow-2xl">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="48" className="stroke-zinc-900 fill-none" strokeWidth="6" />
              <circle cx="50%" cy="50%" r="48" className={`fill-none ${parsed.score >= 85 ? 'stroke-emerald-500' : parsed.score >= 70 ? 'stroke-yellow-500' : 'stroke-red-500'}`} strokeWidth="6" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (parsed.score / 100) * (2 * Math.PI * 48)} strokeLinecap="round" />
            </svg>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{parsed.score}%</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-zinc-500">RATING</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Competencies List */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-550 mb-6 font-semibold">Execution Competencies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parsed.competencies.map((comp, idx) => (
            <div key={idx} className="p-6 bg-[#09090b] border border-zinc-900 rounded-[24px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200 font-semibold">{comp.name}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${comp.score >= 85 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : comp.score >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{comp.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className={`h-full ${comp.score >= 85 ? 'bg-emerald-500' : comp.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${comp.score}%` }} />
              </div>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">{comp.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Speech Logs as Chat Bubbles */}
      <div className="space-y-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-550 font-semibold">Interviewer Assessment Notes</h4>
        <div className="space-y-8">
          
          {/* Strengths Lane */}
          <div className="space-y-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500 px-1 font-semibold">Performance Highlights</div>
            {parsed.strengths.map((str, idx) => (
              <div key={idx} className="flex gap-4 items-start max-w-2xl animate-in slide-in-from-left-2 duration-350">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 rounded-tl-none flex-1 text-zinc-300 relative shadow-xl">
                  <p className="text-xs font-black text-white uppercase tracking-wider mb-2 font-semibold">{str.title}</p>
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed">{str.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Development Lane */}
          <div className="space-y-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#f59e0b] px-1 font-semibold">Constructive Development Points</div>
            {parsed.development.map((dev, idx) => (
              <div key={idx} className="flex gap-4 items-start max-w-2xl animate-in slide-in-from-left-2 duration-350">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center flex-shrink-0 text-yellow-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 rounded-tl-none flex-1 text-zinc-300 relative shadow-xl">
                  <p className="text-xs font-black text-white uppercase tracking-wider mb-2 font-semibold">Growth Focus: {dev.title}</p>
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed">{dev.action}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

interface HistoryProps { 
  history: HistoryItem[]; 
  chatHistory: ChatHistoryItem[];
  onDeleteHistory?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, chatHistory, onDeleteHistory, onDeleteChat }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | ChatHistoryItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'blueprint' | 'chat' } | null>(null);

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

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'blueprint') {
        onDeleteHistory?.(itemToDelete.id);
    } else {
        onDeleteChat?.(itemToDelete.id);
    }
    if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
    }
    setItemToDelete(null);
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
                <div key={item.id} className="group relative">
                    <button onClick={() => setSelectedItem(item)} className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${selectedItem?.id === item.id ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="flex items-center justify-between mb-3"><span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.type === 'resume-audit' ? 'bg-yellow-500/10 text-yellow-500' : item.type === 'strategy' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>{item.type.replace('-', ' ')}</span><span className="text-[8px] font-black text-zinc-600 tracking-widest">{item.date}</span></div>
                    <h3 className="text-sm font-black text-zinc-100 leading-tight mb-2 uppercase tracking-tight line-clamp-2">{item.title}</h3>
                    {item.score !== undefined && <div className="flex items-center gap-2 mt-2"><div className={`w-1.5 h-1.5 rounded-full ${getScoreColors(item.score).t} bg-current`}></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score: {item.score}%</span></div>}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: item.id, type: 'blueprint' }); }}
                        className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
              )) : <div className="p-6 text-center text-zinc-600 text-xs font-bold uppercase">No blueprints saved.</div>}
            </div>
          </div>

          {/* Chat Archive */}
          <div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 px-2">Chat Archive</h3>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {chatHistory.length > 0 ? chatHistory.map(item => (
                <div key={item.id} className="group relative">
                    <button onClick={() => setSelectedItem(item)} className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${selectedItem?.id === item.id ? 'bg-zinc-800/50 border-zinc-700' : 'bg-[#0c0c0e] border-zinc-900 hover:border-zinc-800'}`}>
                    <p className="text-xs font-black text-zinc-100 leading-tight mb-2 uppercase tracking-tight line-clamp-2">{item.title}</p>
                    <span className="text-[9px] font-black text-zinc-600 tracking-widest">{item.date}</span>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: item.id, type: 'chat' }); }}
                        className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
              )) : <div className="p-6 text-center text-zinc-600 text-xs font-bold uppercase">No chats archived.</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 min-h-[500px]">
          {selectedItem ? (
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-900">
                <h3 className="text-2xl font-black text-zinc-100 tracking-tight uppercase leading-none">{selectedItem.title}</h3>
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
                ) : (selectedItem as HistoryItem).type === 'interview-simulation' ? (
                  <SimulationFeedbackDashboard 
                    result={(selectedItem as HistoryItem).result} 
                    company={(selectedItem as HistoryItem).inputs?.company || 'Target Organization'} 
                    role={(selectedItem as HistoryItem).inputs?.role || 'Applicant Role'} 
                    difficulty={(selectedItem as HistoryItem).inputs?.difficulty || 'Standard'} 
                    location={(selectedItem as HistoryItem).inputs?.location || 'Global'} 
                  />
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

      {/* Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] shadow-3xl max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="space-y-2">
                <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Confirm Deletion</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">Are you sure you want to permanently delete this intelligence entry? This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all shadow-lg shadow-red-500/20">Delete Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;