
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getMockInterviewSession } from '../services/geminiService';
import { HistoryItem } from '../types';

interface InterviewLabProps {
  userCredits: number;
  userLocation?: string;
  onUse: (amt: number) => boolean;
  onSaveHistory: (item: HistoryItem) => void;
  onNavigatePricing: () => void;
}

const InterviewLab: React.FC<InterviewLabProps> = ({ userCredits, userLocation, onUse, onSaveHistory, onNavigatePricing }) => {
  const [inputs, setInputs] = useState({ 
    company: '', 
    role: '', 
    type: 'behavioral' as 'behavioral' | 'technical' | 'cultural',
    location: userLocation || '',
    difficulty: 'standard' as 'entry' | 'standard' | 'stress-test',
    length: 'medium' as 'short' | 'medium' | 'exhaustive'
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCredits < 15) { onNavigatePricing(); return; }
    
    setLoading(true);
    try {
      const msg = await getMockInterviewSession(inputs);
      
      if (msg.includes('[REFUSAL]')) {
        setResult(msg.replace('[REFUSAL]', '').trim());
      } else {
        onUse(15);
        setResult(msg);
        onSaveHistory({
          id: Math.random().toString(36).substr(2, 9),
          type: 'interview-prep',
          title: `Mock Session: ${inputs.company} (${inputs.role})`,
          date: new Date().toLocaleDateString(),
          inputs: {
            ...inputs,
            difficulty: inputs.difficulty.toUpperCase(),
            length: inputs.length.toUpperCase()
          } as any,
          result: msg
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700 text-zinc-100">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
          Simulation Active
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Interview <span className="gold-text-gradient">Lab</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          Company-specific behavioral and technical battle-testing with localized market intelligence.
        </p>
      </div>

      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl mb-12">
        <form onSubmit={handleStartSession} className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Company</label>
              <input required value={inputs.company} onChange={e => setInputs({...inputs, company: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Google" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role</label>
              <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Cloud Engineer" />
            </div>
            <div className="space-y-3 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Geography</label>
              <div className="relative">
                 <input 
                   value={inputs.location} 
                   onChange={e => setInputs({...inputs, location: e.target.value})} 
                   className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold pr-12 text-zinc-100 placeholder:text-zinc-800" 
                   placeholder="e.g. Mumbai, India or Silicon Valley, CA" 
                 />
                 <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Session Protocol</label>
              <div className="flex flex-wrap gap-3">
                {['behavioral', 'technical', 'cultural'].map(t => (
                  <button key={t} type="button" onClick={() => setInputs({...inputs, type: t as any})} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputs.type === t ? 'bg-yellow-500 text-zinc-950 shadow-lg' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Complexity Vector</label>
              <div className="flex flex-wrap gap-3">
                {['entry', 'standard', 'stress-test'].map(d => (
                  <button key={d} type="button" onClick={() => setInputs({...inputs, difficulty: d as any})} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputs.difficulty === d ? 'bg-blue-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {d.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Protocol Length</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'short', label: 'Short (3 Qs)' },
                  { id: 'medium', label: 'Medium (5 Qs)' },
                  { id: 'exhaustive', label: 'Exhaustive (10 Qs)' }
                ].map(l => (
                  <button key={l.id} type="button" onClick={() => setInputs({...inputs, length: l.id as any})} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputs.length === l.id ? 'bg-green-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full py-6 bg-zinc-100 text-zinc-950 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-zinc-300">
            {loading ? "Calibrating Neural Simulation..." : "Initialize Prep Session (15 Credits)"}
          </button>
        </form>
      </div>

      {result && (
        <div ref={resultRef} className="bg-[#0c0c0e] border border-blue-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 scroll-mt-24 text-zinc-100">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 uppercase">Analysis Results</h3>
            </div>
            <div className="flex gap-4">
               {inputs.location && (
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Localized for {inputs.location}</span>
               )}
               <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{inputs.difficulty} protocol</span>
            </div>
          </div>
          <div className="prose-krypto text-zinc-300 uppercase">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewLab;
