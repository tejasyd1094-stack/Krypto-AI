
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getOutreachMessage } from '../services/geminiService';
import { HistoryItem } from '../types';

const OUTREACH_STEPS = [
  "Synthesizing Professional Persona...",
  "Analyzing Company Trajectory...",
  "Identifying Engagement Hooks...",
  "Architecting Narrative Flow...",
  "Finalizing High-Conversion Suite..."
];

interface OutreachArchitectProps {
  userCredits: number;
  onUse: (amt: number) => boolean;
  onSaveHistory: (item: HistoryItem) => void;
  onNavigatePricing: () => void;
}

const OutreachArchitect: React.FC<OutreachArchitectProps> = ({ userCredits, onUse, onSaveHistory, onNavigatePricing }) => {
  const [inputs, setInputs] = useState({ 
    company: '', 
    role: '', 
    contactPerson: '', 
    tone: 'Professional', 
    context: '',
    website: ''
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotData, setScreenshotData] = useState<{ data: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [grounding, setGrounding] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + (Math.random() * 0.6 + 0.3); 
          return next > 99 ? 99 : next;
        });
        setAnalysisStep(p => (p < OUTREACH_STEPS.length - 1 && loadingProgress > (p + 1) * 19 ? p + 1 : p));
      }, 150);
    } else {
      setLoadingProgress(0);
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingProgress]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setScreenshotData({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCredits < 5) { onNavigatePricing(); return; }
    
    setLoading(true);
    setResult(null);
    setGrounding([]);

    try {
      const { text, grounding: chunks } = await getOutreachMessage(inputs, screenshotData || undefined);
      
      if (text.includes('[REFUSAL]')) {
        setResult(text.replace('[REFUSAL]', '').trim());
        setLoading(false);
      } else {
        onUse(5);
        setLoadingProgress(100);
        setTimeout(() => {
          setResult(text);
          if (chunks) setGrounding(chunks);
          onSaveHistory({
            id: Math.random().toString(36).substr(2, 9),
            type: 'outreach',
            title: `Expert Outreach: ${inputs.company} (${inputs.role})`,
            date: new Date().toLocaleDateString(),
            inputs: { ...inputs, hasScreenshot: !!screenshot ? 'Yes' : 'No' } as any,
            result: text
          });
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700 text-zinc-100 pb-40">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
          Hyper-Personalization Engine v2.0
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Outreach <span className="gold-text-gradient">Architect</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          Engineer messages that stop the scroll. Our engine researches company advancements in real-time to guarantee engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Company</label>
                <input required value={inputs.company} onChange={e => setInputs({...inputs, company: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. NVIDIA" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role / Designation</label>
                <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. VP Engineering" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Contact Person Name</label>
                <input required value={inputs.contactPerson} onChange={e => setInputs({...inputs, contactPerson: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. Jensen Huang" />
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
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Company Website URL</label>
              <input value={inputs.website} onChange={e => setInputs({...inputs, website: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold text-zinc-100" placeholder="https://company.com" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Company Advancement / Exciting News</label>
              <div className="flex flex-col gap-4">
                <textarea 
                  value={inputs.context} 
                  onChange={e => setInputs({...inputs, context: e.target.value})} 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-[32px] px-8 py-6 text-sm focus:border-yellow-500/50 outline-none min-h-[120px] font-medium text-zinc-100" 
                  placeholder="Tell us what excites you about their current path, or upload a screenshot below..." 
                />
                
                <div className="flex items-center gap-4">
                   <button 
                     type="button" 
                     onClick={() => fileInputRef.current?.click()}
                     className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${screenshot ? 'border-green-500/50 bg-green-500/5 text-green-500' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-500'}`}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {screenshot ? screenshot.name : 'Upload Screenshot of Advancement'}
                     </span>
                   </button>
                   {screenshot && (
                     <button type="button" onClick={() => { setScreenshot(null); setScreenshotData(null); }} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2 italic">
                  For pro results, consider uploading the screenshot of advancement or website.
                </p>
              </div>
            </div>

            <button disabled={loading} className="w-full py-6 bg-zinc-100 text-zinc-950 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-zinc-300">
              {loading ? "Initializing Personalized Engine..." : "Generate Hyper-Personalized Suite (5 Credits)"}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-32 space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="relative w-48 h-12 mx-auto bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden shadow-2xl">
               <div 
                 className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" 
                 style={{ width: `${loadingProgress}%` }}
               ></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
               </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{OUTREACH_STEPS[analysisStep]}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div ref={resultRef} className="bg-[#0c0c0e] border border-yellow-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 scroll-mt-24 shadow-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-100">Expert Architecture Results</h3>
              </div>
              {grounding.length > 0 && (
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Powered by Real-Time Intelligence</span>
              )}
            </div>
            
            <div className="prose-krypto text-zinc-300">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            {grounding.length > 0 && (
              <div className="mt-12 pt-10 border-t border-zinc-900">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Verification Sources (Study Material)</p>
                 <div className="flex flex-wrap gap-3">
                   {grounding.map((chunk, i) => chunk.web && (
                     <a 
                       key={i} 
                       href={chunk.web.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black text-zinc-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all truncate max-w-[200px]"
                     >
                       {chunk.web.title || 'Source'}
                     </a>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachArchitect;
