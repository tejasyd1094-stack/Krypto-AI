
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getOutreachMessage } from '../services/geminiService';
import { HistoryItem } from '../types';

interface OutreachArchitectProps {
  /**
   * Added userCredits to fix scope error where it was being accessed in handleSubmit
   */
  userCredits: number;
  onUse: (amt: number) => boolean;
  onSaveHistory: (item: HistoryItem) => void;
  onNavigatePricing: () => void;
}

const OutreachArchitect: React.FC<OutreachArchitectProps> = ({ userCredits, onUse, onSaveHistory, onNavigatePricing }) => {
  const [inputs, setInputs] = useState({ company: '', role: '', contactPerson: '', tone: 'Professional', context: '' });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    /**
     * userCredits is now provided via props to fix "Cannot find name 'userCredits'"
     */
    if (userCredits < 5) { onNavigatePricing(); return; }
    
    setLoading(true);
    try {
      const msg = await getOutreachMessage(inputs);
      
      // If refusal detected, don't charge
      if (msg.includes('[REFUSAL]')) {
        setResult(msg.replace('[REFUSAL]', '').trim());
      } else {
        onUse(5);
        setResult(msg);
        onSaveHistory({
          id: Math.random().toString(36).substr(2, 9),
          type: 'outreach',
          title: `Outreach: ${inputs.company} (${inputs.role})`,
          date: new Date().toLocaleDateString(),
          inputs,
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
          Conversion Engine v1.0
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Outreach <span className="gold-text-gradient">Architect</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          Generate high-conversion cold messages that get you noticed by decision makers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Company</label>
                <input required value={inputs.company} onChange={e => setInputs({...inputs, company: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. OpenAI" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role</label>
                <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. Senior PM" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Contact Name (Optional)</label>
                <input value={inputs.contactPerson} onChange={e => setInputs({...inputs, contactPerson: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. Sam Altman" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Communication Tone</label>
                <select value={inputs.tone} onChange={e => setInputs({...inputs, tone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold uppercase text-zinc-100">
                  <option>Professional</option>
                  <option>Bold & Visionary</option>
                  <option>Curiosity-Based</option>
                  <option>Direct & Results-Oriented</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Extra Context / Why you love them?</label>
              <textarea value={inputs.context} onChange={e => setInputs({...inputs, context: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-[32px] px-8 py-6 text-sm focus:border-yellow-500/50 outline-none min-h-[140px] font-medium text-zinc-100" placeholder="e.g. I saw they just launched the new Sora model..." />
            </div>
            <button disabled={loading} className="w-full py-6 bg-zinc-100 text-zinc-950 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-zinc-300">
              {loading ? "Engineering Message..." : "Generate Outreach Suite (5 Credits)"}
            </button>
          </form>
        </div>

        {result && (
          <div ref={resultRef} className="bg-[#0c0c0e] border border-yellow-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 scroll-mt-24">
            <div className="flex items-center gap-3 mb-10 text-zinc-100">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 uppercase">Analysis Results</h3>
            </div>
            <div className="prose-krypto text-zinc-300 uppercase">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachArchitect;
