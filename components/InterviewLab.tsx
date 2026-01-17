import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { getMockInterviewSession } from '../services/geminiService';
import { HistoryItem } from '../types';

const SIMULATION_STEPS = [
  "Scouring Organization Intel...",
  "Analyzing Job Architecture...",
  "Benchmarking Market Bar...",
  "Calibrating Stress Vectors...",
  "Finalizing Simulation Logic..."
];

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
    website: '',
    role: '', 
    type: 'behavioral' as 'behavioral' | 'technical' | 'cultural',
    location: userLocation || '',
    difficulty: 'standard' as 'entry' | 'standard' | 'stress-test',
    length: 'medium' as 'short' | 'medium' | 'exhaustive'
  });
  
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdData, setJdData] = useState<string | { data: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [jdError, setJdError] = useState<string | null>(null);
  
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
        setAnalysisStep(p => (p < SIMULATION_STEPS.length - 1 && loadingProgress > (p + 1) * 19 ? p + 1 : p));
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
    setJdFile(file);
    setJdError(null);

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setJdData(mammothResult.value);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        setJdData({ data: base64, mimeType: file.type });
      } else {
        const text = await file.text();
        setJdData(text);
      }
    } catch (err) {
      console.error("JD processing error", err);
      setJdError("Failed to parse document. Please try a different format.");
    }
  };

  const removeJdFile = () => {
    setJdFile(null);
    setJdData(null);
    setJdError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCredits < 15) { onNavigatePricing(); return; }
    
    setLoading(true);
    setJdError(null);
    setResult(null);

    try {
      const msg = await getMockInterviewSession(inputs, jdData || undefined);
      
      if (msg.includes('[INVALID_JD]')) {
        setJdError("System Alert: The provided Job Description appears invalid or lacks clear responsibilities. Please upload a legitimate JD for exact results.");
        setResult(msg.replace('[INVALID_JD]', '').trim());
        setLoading(false);
      } else if (msg.includes('[REFUSAL]')) {
        setResult(msg.replace('[REFUSAL]', '').trim());
        setLoading(false);
      } else {
        onUse(15);
        setLoadingProgress(100);
        setTimeout(() => {
          setResult(msg);
          setLoading(false);
          onSaveHistory({
            id: Math.random().toString(36).substr(2, 9),
            type: 'interview-prep',
            title: `Mock Session: ${inputs.company} (${inputs.role})`,
            date: new Date().toLocaleDateString(),
            inputs: {
              ...inputs,
              difficulty: inputs.difficulty.toUpperCase(),
              length: inputs.length.toUpperCase(),
              hasJD: jdFile ? 'Yes' : 'No'
            } as any,
            result: msg
          });
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700 text-zinc-100 pb-40">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-yellow-500/20">
          Simulation Lab v3.0 Active
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Interview <span className="gold-text-gradient">Lab</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          High-precision behavioral and technical battle-testing. We analyze company websites and JDs to simulate real-world hiring bars.
        </p>
      </div>

      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl mb-12">
        <form onSubmit={handleStartSession} className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Organization Name</label>
              <input required value={inputs.company} onChange={e => setInputs({...inputs, company: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Google" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Organization Website (Optional)</label>
              <input value={inputs.website} onChange={e => setInputs({...inputs, website: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="https://google.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role / Designation</label>
              <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Senior Product Manager" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Geography</label>
              <input value={inputs.location} onChange={e => setInputs({...inputs, location: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Mumbai, India" />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Job Description Architecture (Optional but Recommended)</label>
             <div className="relative">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-4 px-8 py-6 rounded-3xl border-2 border-dashed transition-all ${jdFile ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-500'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {jdFile ? jdFile.name : 'Upload JD Protocol (PDF, DOCX, Image)'}
                  </span>
                </button>
                {jdFile && (
                   <button type="button" onClick={removeJdFile} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                )}
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,image/*" />
             {jdError && (
               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{jdError}</p>
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Session Protocol</label>
              <div className="flex flex-wrap gap-3">
                {['behavioral', 'technical', 'cultural'].map(t => (
                  <button key={t} type="button" onClick={() => setInputs({...inputs, type: t as any})} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inputs.type === t ? 'bg-yellow-500 text-zinc-950 shadow-xl' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Complexity Vector</label>
              <div className="flex flex-wrap gap-3">
                {['entry', 'standard', 'stress-test'].map(d => (
                  <button key={d} type="button" onClick={() => setInputs({...inputs, difficulty: d as any})} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inputs.difficulty === d ? 'bg-yellow-500 text-zinc-950 shadow-xl' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
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
                  <button key={l.id} type="button" onClick={() => setInputs({...inputs, length: l.id as any})} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inputs.length === l.id ? 'bg-yellow-500 text-zinc-950 shadow-xl' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full py-7 bg-yellow-500 text-zinc-950 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-yellow-700">
            {loading ? "Initializing Neural Interface..." : "Initialize Simulation (15 Credits)"}
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
            <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{SIMULATION_STEPS[analysisStep]}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
            </div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div ref={resultRef} className="bg-[#0c0c0e] border border-yellow-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 scroll-mt-24 text-zinc-100 shadow-3xl">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]"></span>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400">Simulation Report</h3>
            </div>
            <div className="flex gap-4">
               {inputs.location && (
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Localized Intel: {inputs.location}</span>
               )}
               <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{inputs.difficulty} protocol</span>
            </div>
          </div>
          <div className="prose-krypto text-zinc-300">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewLab;