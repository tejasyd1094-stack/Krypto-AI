
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { getCareerAdvice } from '../services/geminiService';
import { KryptoLogo } from './Branding';
import { TabType } from '../types';

interface DashboardProps {
  priority?: boolean;
  userCredits: number;
  onUse: (amount: number) => boolean;
  onNavigatePricing: () => void;
  setActiveTab?: (tab: TabType) => void;
}

const PLACEHOLDERS = [
  "How to negotiate a 30% salary hike?",
  "Analyze this job description for keywords...",
  "Draft a cold email for a FAANG recruiter.",
  "What are the top skills for AI Engineering in 2025?",
  "Analyze my attached cover letter...",
  "Explain the RIASEC model for career growth."
];

const Dashboard: React.FC<DashboardProps> = ({ priority, userCredits, onUse, onNavigatePricing, setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [promotionTarget, setPromotionTarget] = useState<TabType | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (advice && adviceRef.current) {
      adviceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [advice]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setFileData(mammothResult.value);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        setFileData({ data: base64, mimeType: file.type });
      } else {
        const text = await file.text();
        setFileData(text);
      }
    } catch (err) {
      console.error("File processing error", err);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !attachedFile) return;
    if (userCredits < 2) { onNavigatePricing(); return; }
    
    setLoading(true);
    setAdvice(null);
    setPromotionTarget(null);

    try {
      const result = await getCareerAdvice(query, fileData);
      
      let finalAdvice = result;
      let isRefusal = false;
      let isPromotion = false;

      if (result.includes('[REFUSAL]')) {
        finalAdvice = result.replace('[REFUSAL]', '').trim();
        isRefusal = true;
      } 
      
      const promotionMatch = result.match(/\[PROMOTION:(.*?)\]/);
      if (promotionMatch) {
        const target = promotionMatch[1] as TabType;
        setPromotionTarget(target);
        finalAdvice = result.replace(/\[PROMOTION:.*?\]/, '').trim();
        isPromotion = true;
      }

      if (!isRefusal && !isPromotion) {
        onUse(2);
      }

      setAdvice(finalAdvice);
    } catch (error) {
      setAdvice("Execution Error: The neural engine is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  // Gauge constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const score = 65;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-32 pb-40">
      <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none text-zinc-100 uppercase">
          Welcome, <br /><span className="gold-text-gradient">Career Architect!</span>
        </h2>
        <p className="text-zinc-500 text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
          The recruitment engine for high-performance professionals. 
          Map your DNA, audit your assets, and dominate the market.
        </p>
        
        <div className="max-w-3xl mx-auto relative mt-12">
          <form 
            onSubmit={handleSubmit} 
            className="bg-zinc-900/40 border border-zinc-800 rounded-[40px] p-2 flex flex-col focus-within:border-yellow-500/40 focus-within:ring-[12px] focus-within:ring-yellow-500/5 transition-all shadow-3xl backdrop-blur-2xl overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            
            {attachedFile && (
              <div className="px-6 pt-4 flex items-center gap-3 relative z-10">
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1.5 animate-in slide-in-from-left-4">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest truncate max-w-[200px]">{attachedFile.name}</span>
                  <button type="button" onClick={removeFile} className="ml-1 hover:text-white text-yellow-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 p-4 relative z-10">
              <div className="flex-1 flex items-center gap-4 w-full">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-zinc-500 hover:text-yellow-500 transition-all bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-yellow-500/30 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="w-full bg-transparent border-none focus:outline-none text-zinc-100 text-lg font-medium py-3 placeholder:transition-opacity placeholder:duration-500"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || (!query.trim() && !attachedFile)} 
                className="w-full sm:w-auto px-10 py-5 bg-yellow-500 text-zinc-950 rounded-[28px] font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl shadow-yellow-500/20 disabled:opacity-30 flex items-center justify-center gap-3 border-b-4 border-yellow-700"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Ask Krypto AI (2 Credits)
                  </>
                )}
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.docx,.txt,image/*" 
            />
          </form>

          {!advice && !loading && (
            <div className="mt-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
               <div className="flex items-center gap-4 justify-center">
                  <div className="h-px bg-zinc-900 flex-1"></div>
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Neural Shortcuts</span>
                  <div className="h-px bg-zinc-900 flex-1"></div>
               </div>
               <div className="flex flex-wrap justify-center gap-3">
                 {PLACEHOLDERS.slice(0, 4).map((p, i) => (
                   <button 
                     key={i} 
                     onClick={() => setQuery(p)} 
                     className="px-5 py-2.5 bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded-2xl text-[10px] font-black text-yellow-500 hover:text-yellow-400 uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-xl shadow-yellow-500/[0.02]"
                   >
                     {p.length > 32 ? p.substring(0, 29) + '...' : p}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {advice && (
        <div ref={adviceRef} className="max-w-4xl mx-auto p-12 bg-[#0c0c0e] border border-yellow-500/10 rounded-[56px] shadow-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
           <div className="prose-krypto text-zinc-300 text-lg leading-relaxed"><ReactMarkdown>{advice}</ReactMarkdown></div>
           
           {promotionTarget && (
             <div className="flex flex-col items-center pt-8 border-t border-zinc-900 animate-in slide-in-from-bottom-4 duration-1000">
                <button 
                  onClick={() => setActiveTab?.(promotionTarget)}
                  className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-2xl flex items-center gap-3 group"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  Switch to {promotionTarget} Module
                </button>
                <p className="mt-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Precision tools optimized for this specific request.</p>
             </div>
           )}
        </div>
      )}

      {/* Feature Previews Section */}
      <div className="space-y-48">
        {/* Resume Scorer Preview */}
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-left-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Architecture Suite</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">ATS <span className="gold-text-gradient">Optimization Lab</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
               <button onClick={() => setActiveTab?.('Resume Scorer')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Start Architecture Audit</button>
               <div className="flex items-center gap-2 px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Fully Optimized Export Included</span>
               </div>
            </div>
          </div>
          
          {/* High-Fidelity UI Simulation Card */}
          <div className="flex-1 w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-[48px] p-10 shadow-3xl rotate-1 hover:rotate-0 transition-all duration-700 relative group overflow-hidden border-b-4 border-zinc-800">
             {/* Professional Scanning Loader Overlay */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_15px_#eab308] z-20 animate-[scan_3s_linear_infinite]"></div>
             <style>{`
               @keyframes scan {
                 0% { transform: translateY(0); opacity: 0; }
                 10% { opacity: 1; }
                 90% { opacity: 1; }
                 100% { transform: translateY(500px); opacity: 0; }
               }
             `}</style>

             <div className="space-y-8 relative z-10">
                {/* Score Section */}
                <div className="flex items-center gap-10 bg-zinc-900/40 p-8 rounded-[40px] border border-zinc-800/50">
                   <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-yellow-500/50 rounded-tl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-yellow-500/50 rounded-br-lg"></div>
                      
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none" strokeWidth="8" />
                        <circle cx="50%" cy="50%" r={radius} className="stroke-yellow-500 fill-none" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-4xl font-black text-zinc-100 tracking-tighter leading-none">65%</span>
                         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Baseline</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">Strategic Handshake: <span className="text-yellow-500">Low</span></h5>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full w-[65%] bg-yellow-500"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Keywords</span>
                         <span className="text-[9px] font-black text-zinc-400">42/100</span>
                      </div>
                   </div>
                </div>

                {/* Audit Section */}
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2">Discrepancy Audit</p>
                   <div className="space-y-4">
                      {/* Deficiency Item */}
                      <div className="p-6 bg-zinc-900/40 rounded-[32px] border border-zinc-800/50 space-y-3">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Deficiency Detected</p>
                         </div>
                         <p className="text-xs text-zinc-500 italic line-through uppercase tracking-tight leading-relaxed">"Led a small team to complete project on time."</p>
                      </div>
                      
                      {/* Solution Item */}
                      <div className="p-6 bg-zinc-900/40 rounded-[32px] border border-green-500/10 space-y-3">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Krypto Architected (XYZ Formula)</p>
                         </div>
                         <p className="text-xs text-zinc-100 font-black uppercase tracking-tight leading-relaxed">"Managed 12 cross-functional engineers as measured by 100% on-time deployment across 4 sprint cycles, by implementing Agile-K Architecture."</p>
                      </div>
                   </div>
                </div>

                <div className="pt-2 text-center">
                   <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em]">Executive Blueprint V4.1 Engine</span>
                </div>
             </div>
          </div>
        </div>

        {/* Career DNA Preview */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-right-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Market Intelligence</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Career <span className="gold-text-gradient">DNA Mapping</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Map personality vectors to global talent shifts. Get deep market signals, city topography, business hub analysis, and precise salary benchmarks.</p>
            <button onClick={() => setActiveTab?.('Career Path')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Discover Your Path</button>
          </div>
          <div className="flex-1 w-full max-w-xl bg-[#0c0c0e] border border-zinc-800 rounded-[56px] p-12 shadow-3xl -rotate-2 hover:rotate-0 transition-all duration-700">
             <div className="space-y-8 text-center">
                <div className="w-44 h-44 bg-blue-500/5 rounded-full mx-auto border border-blue-500/10 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-blue-500/5 blur-3xl animate-pulse"></div>
                   <KryptoLogo size={80} />
                </div>
                <div className="space-y-4">
                   <p className="text-sm font-black text-zinc-100 uppercase tracking-[0.3em]">GEOGRAPHY: MUMBAI, INDIA</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl">
                         <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Dominant Hub</p>
                         <p className="text-[10px] text-zinc-300 font-bold uppercase">BKC (Financial Dist.)</p>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl">
                         <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Market Signal</p>
                         <p className="text-[10px] text-zinc-300 font-bold uppercase">Strong Growth</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Outreach & Interview Previews (Stacked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="bg-zinc-900/40 border border-zinc-800 p-12 rounded-[56px] space-y-8 hover:border-yellow-500/30 transition-all group">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h5 className="text-3xl font-black uppercase tracking-tight text-zinc-100">Outreach <br />Architect</h5>
              <p className="text-zinc-500 font-medium leading-relaxed">High-conversion protocols for cold networking. Stop being ignored and start being interviewed.</p>
              <button onClick={() => setActiveTab?.('Outreach Architect')} className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] hover:text-yellow-400 transition-colors">Launch Protocol →</button>
           </div>
           <div className="bg-zinc-900/40 border border-zinc-800 p-12 rounded-[56px] space-y-8 hover:border-blue-500/30 transition-all group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h5 className="text-3xl font-black uppercase tracking-tight text-zinc-100">Interview <br />Simulation Lab</h5>
              <p className="text-zinc-500 font-medium leading-relaxed">Battle-test your responses in specific technical and behavioral environments. Neural feedback on your answers.</p>
              <button onClick={() => setActiveTab?.('Interview Lab')} className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] hover:text-blue-400 transition-colors">Enter Simulation →</button>
           </div>
        </div>
      </div>

      {/* Testimonials / Reviews Section */}
      <div className="pt-32 border-t border-zinc-900">
        <div className="text-center mb-24">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Executive Testimonials</span>
          <h3 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Trusted by <br /><span className="gold-text-gradient">Global Career Architects</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: "Sarah L.", role: "Senior Director @ TechCorp", text: "The XYZ formula alone increased my interview requests by 400%. Krypto is game-changing." },
             { name: "Rajiv M.", role: "VP of Engineering", text: "The city-specific topography insights pinpointed exactly where I needed to network. Incredible precision." },
             { name: "Elena K.", role: "Product Strategist", text: "Outreach messages that actually convert. I landed my current role using the Architect's Bold protocol." }
           ].map((r, i) => (
             <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[48px] space-y-8 hover:bg-zinc-900/60 transition-all">
                <div className="flex text-yellow-500 gap-1">{'★★★★★'.split('').map((s, idx) => <span key={idx}>{s}</span>)}</div>
                <p className="text-zinc-400 text-base italic font-medium leading-relaxed">"{r.text}"</p>
                <div className="pt-6 border-t border-zinc-800 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-[10px] text-zinc-500 uppercase">{r.name[0]}</div>
                  <div>
                    <p className="text-zinc-100 font-black text-[10px] uppercase tracking-widest">{r.name}</p>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{r.role}</p>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* Final Call to Action */}
      <div className="text-center pt-20">
         <div className="inline-flex items-center gap-4 px-8 py-4 bg-zinc-900/50 border border-zinc-800 rounded-full animate-bounce">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">System Ready for Deployment</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
