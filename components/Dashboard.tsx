
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
  const loaderRef = useRef<HTMLDivElement>(null);

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

    // Scroll to loader
    setTimeout(() => {
      loaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

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

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-32 pb-40">
      {/* Hero Section */}
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

      {loading && (
        <div ref={loaderRef} className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-6"></div>
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em]">Synthesizing Strategy...</p>
        </div>
      )}

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

      {/* Feature Sections */}
      <div className="space-y-48">
        {/* ATS Optimization Lab */}
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-left-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Architecture Suite</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">ATS <span className="gold-text-gradient">Optimization Lab</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
               <button onClick={() => setActiveTab?.('Resume Scorer')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Start Architecture Audit</button>
            </div>
          </div>
          
          {/* HIGH FIDELITY SCREENSHOT: Resume Audit View */}
          <div className="flex-1 w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[48px] p-2 shadow-3xl rotate-1 hover:rotate-0 transition-all duration-700 relative group overflow-hidden border-b-8 border-zinc-900/50">
             <div className="bg-zinc-900/50 rounded-[44px] overflow-hidden border border-zinc-800">
                <div className="h-10 bg-zinc-950 flex items-center px-6 gap-2 border-b border-zinc-900">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  <div className="mx-auto bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800 text-[8px] font-black text-zinc-600 uppercase tracking-widest">EXECUTIVE_AUDIT_PROTOCOL_v4.1</div>
                </div>

                <div className="p-8 space-y-8 relative">
                   <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-500 shadow-[0_0_20px_#eab308] z-20 animate-[scan_4s_linear_infinite]"></div>
                   
                   <div className="space-y-6">
                        {/* Recruitment Score Header */}
                        <div className="flex items-center gap-10 p-8 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-inner">
                           <div className="relative w-24 h-24 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="42" className="stroke-zinc-900 fill-none" strokeWidth="8" />
                                <circle cx="50%" cy="50%" r="42" className="stroke-yellow-500 fill-none" strokeWidth="8" strokeDasharray="264" strokeDashoffset="92" strokeLinecap="round" />
                              </svg>
                              <span className="absolute text-3xl font-black text-yellow-500 tracking-tighter">65%</span>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[12px] font-black text-zinc-100 uppercase tracking-[0.2em]">Recruitment Impact Score</p>
                              <div className="flex gap-2">
                                <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase">Critical Deficiencies Detected</span>
                              </div>
                           </div>
                        </div>

                        {/* Red/Green/Why List Visual */}
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Structural Decomposition</h5>
                           
                           {/* Row 1 */}
                           <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] overflow-hidden">
                              <div className="grid grid-cols-1 md:grid-cols-2">
                                 <div className="p-6 bg-red-500/[0.03] border-r border-zinc-900 space-y-2">
                                    <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Deficiency</span>
                                    <p className="text-[10px] text-zinc-500 italic line-through decoration-red-500/30">Responsible for managing day-to-day software updates and team tasks.</p>
                                 </div>
                                 <div className="p-6 bg-green-500/[0.03] space-y-2 relative">
                                    <div className="absolute top-2 right-4 text-[7px] font-black text-green-500 uppercase">Optimized</div>
                                    <p className="text-[11px] text-zinc-200 font-bold uppercase tracking-tight">Accomplished **100% On-Time Deployment** as measured by **4 Successive Sprint Cycles**, by leading **12 Engineers**.</p>
                                 </div>
                              </div>
                              <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-3">
                                 <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Logic:</span>
                                 <p className="text-[9px] text-zinc-500 font-medium">Rebuilt using Google XYZ formula to quantify professional velocity.</p>
                              </div>
                           </div>

                           {/* Row 2 */}
                           <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] overflow-hidden opacity-80">
                              <div className="grid grid-cols-1 md:grid-cols-2">
                                 <div className="p-6 bg-red-500/[0.03] border-r border-zinc-900 space-y-2">
                                    <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Deficiency</span>
                                    <p className="text-[10px] text-zinc-500 italic line-through decoration-red-500/30">Worked closely with sales to help close new business deals.</p>
                                 </div>
                                 <div className="p-6 bg-green-500/[0.03] space-y-2 relative">
                                    <div className="absolute top-2 right-4 text-[7px] font-black text-green-500 uppercase">Optimized</div>
                                    <p className="text-[11px] text-zinc-200 font-bold uppercase tracking-tight">Generated **$2.4M in Pipeline Revenue** as measured by **CRM Data**, by engineering **Strategic Solutions** for Sales.</p>
                                 </div>
                              </div>
                              <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-3">
                                 <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Logic:</span>
                                 <p className="text-[9px] text-zinc-500 font-medium">Mapped qualitative contribution to bottom-line financial impact.</p>
                              </div>
                           </div>
                        </div>
                   </div>
                </div>
             </div>
             <style>{`@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(500px); opacity: 0; } }`}</style>
          </div>
        </div>

        {/* Career DNA Mapping */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-right-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Market Intelligence</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Career <span className="gold-text-gradient">DNA Mapping</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Map personality vectors to global talent shifts. Get deep market signals, city topography, business hub analysis, and precise salary benchmarks.</p>
            <button onClick={() => setActiveTab?.('Career Path')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Discover Your Path</button>
          </div>
          
          {/* HIGH FIDELITY SCREENSHOT: DNA Visualization */}
          <div className="flex-1 w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[56px] p-2 shadow-3xl -rotate-2 hover:rotate-0 transition-all duration-700 relative overflow-hidden">
             <div className="bg-[#0c0c0e] rounded-[52px] border border-zinc-800 overflow-hidden">
                <div className="h-12 bg-zinc-950 flex items-center px-6 justify-between border-b border-zinc-900">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                     <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">NEURAL_DNA_VECTOR_LOCKED</span>
                   </div>
                   <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest italic">RIASEC: S-I-R</span>
                   </div>
                </div>

                <div className="p-10 flex flex-col items-center">
                   <div className="relative w-72 h-72 mb-10 group/radar">
                      {/* Radar Chart Visual with RIASEC Labels */}
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <defs>
                           <radialGradient id="dna-glow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="rgba(234, 179, 8, 0.3)" />
                              <stop offset="100%" stopColor="transparent" />
                           </radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="80" className="stroke-zinc-800/50 fill-none" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="60" className="stroke-zinc-800/50 fill-none" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="40" className="stroke-zinc-800/50 fill-none" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="20" className="stroke-zinc-800/50 fill-none" strokeWidth="0.5" />
                        
                        {/* Axial Lines */}
                        {[0, 60, 120, 180, 240, 300].map(deg => (
                           <line key={deg} x1="100" y1="100" x2={100 + 80 * Math.cos(deg * Math.PI / 180)} y2={100 + 80 * Math.sin(deg * Math.PI / 180)} className="stroke-zinc-800" strokeWidth="0.5" />
                        ))}

                        {/* Personality Vector Polygon */}
                        <polygon points="100,40 160,100 130,160 70,140 40,80" className="fill-yellow-500/10 stroke-yellow-500 animate-pulse" strokeWidth="2.5" />
                        <circle cx="100" cy="40" r="4" fill="#eab308" className="shadow-lg" />
                        <circle cx="160" cy="100" r="4" fill="#eab308" />
                        <circle cx="130" cy="160" r="4" fill="#eab308" />
                        <circle cx="70" cy="140" r="4" fill="#eab308" />
                        <circle cx="40" cy="80" r="4" fill="#eab308" />

                        {/* RIASEC Labels */}
                        <text x="100" y="30" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Realistic</text>
                        <text x="175" y="100" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Investigative</text>
                        <text x="145" y="175" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Artistic</text>
                        <text x="55" y="175" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Social</text>
                        <text x="25" y="100" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Enterprising</text>
                        <text x="100" y="175" textAnchor="middle" className="text-[7px] font-black fill-zinc-500 uppercase tracking-widest">Conventional</text>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-32 h-32 bg-yellow-500/5 blur-[40px] animate-pulse"></div>
                      </div>
                   </div>

                   <div className="w-full space-y-4">
                      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Dominant Sequence</p>
                            <p className="text-lg font-black text-zinc-100 uppercase tracking-tight">Social Architect</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Market Affinity</p>
                            <p className="text-lg font-black text-blue-500 uppercase tracking-tight">PREMIUM</p>
                         </div>
                      </div>

                      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex flex-col gap-4">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Hub Intelligence Signal: Bengaluru</p>
                         </div>
                         <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Salary Range</p>
                               <p className="text-xl font-black text-zinc-100">₹32L - ₹48L</p>
                            </div>
                            <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                               <div className="h-full w-3/4 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Outreach Architect */}
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-left-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Outreach Suite</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Outreach <span className="gold-text-gradient">Architect</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">High-conversion protocols for cold networking. We research company trajectory in real-time to craft messages that guarantee engagement.</p>
            <button onClick={() => setActiveTab?.('Outreach Architect')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Initialize Outreach Protocol</button>
          </div>
          
          {/* HIGH FIDELITY SCREENSHOT: Outreach Protocol Generation */}
          <div className="flex-1 w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[48px] p-2 shadow-3xl rotate-1 hover:rotate-0 transition-all duration-700 relative group overflow-hidden border-b-8 border-zinc-900/50">
             <div className="bg-zinc-900/50 rounded-[44px] overflow-hidden border border-zinc-800">
                <div className="h-10 bg-zinc-950 flex items-center px-6 justify-between border-b border-zinc-900">
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                     <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Conversation_Forge_Protocol</span>
                   </div>
                   <div className="flex gap-1.5">
                     <div className="w-2 h-2 rounded-sm bg-zinc-800"></div>
                     <div className="w-2 h-2 rounded-sm bg-zinc-800"></div>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                         <KryptoLogo size={20} />
                      </div>
                      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-[32px] rounded-tl-none flex-1 space-y-4 shadow-xl">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-[8px] font-black text-yellow-500 uppercase tracking-[0.3em]">AI Outreach Protocol Generated</span>
                           <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">Score: 94% Engagement Probability</span>
                         </div>
                         <div className="space-y-3">
                           <p className="text-[11px] text-zinc-200 font-medium leading-relaxed italic">"Hi Jensen, I noticed NVIDIA's recent advancement in Blackwell architecture—it's a massive leap for real-time generative physics..."</p>
                           <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl border-l-4 border-l-yellow-500">
                              <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mb-1">Strategic Hook Detection</p>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">System identified current company milestone via real-time Google Search Study.</p>
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 mt-8">
                      <div className="px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-[9px] font-black text-zinc-500 uppercase tracking-widest cursor-default">
                        Copy Template
                      </div>
                      <div className="px-5 py-3 bg-yellow-500 text-zinc-950 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/10 animate-pulse">
                        Execute High-Conversion
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Interview Simulation Lab */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-right-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Simulation Lab</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Interview <span className="gold-text-gradient">Simulation Lab</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Battle-test your responses in specific technical and behavioral environments. Neural feedback on your hiring bar readiness.</p>
            <button onClick={() => setActiveTab?.('Interview Lab')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Enter Simulation Lab</button>
          </div>
          
          {/* HIGH FIDELITY SCREENSHOT: Interview Simulation Session */}
          <div className="flex-1 w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[48px] p-2 shadow-3xl -rotate-1 hover:rotate-0 transition-all duration-700 relative group overflow-hidden border-b-8 border-zinc-900/50">
             <div className="bg-[#0c0c0e] rounded-[44px] overflow-hidden border border-zinc-800">
                <div className="h-10 bg-zinc-950 flex items-center px-6 justify-between border-b border-zinc-900">
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Simulation_Lab_In_Session</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em]">Session_Timer: 12:44</span>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 text-[7px] font-black uppercase tracking-widest">Question 3 / 10</span>
                        <div className="h-px bg-zinc-900 flex-1"></div>
                      </div>
                      <h4 className="text-lg font-black text-zinc-100 uppercase tracking-tight leading-tight italic">"Describe a situation where you had to pivot a product strategy based on conflicting market signals."</h4>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-4 text-center">
                        <div className="relative w-24 h-24 mx-auto">
                           <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                              <circle cx="50" cy="50" r="40" className="stroke-zinc-900 fill-none" strokeWidth="8" />
                              <circle cx="50" cy="50" r="40" className="stroke-blue-500 fill-none" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round" />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-black text-zinc-100">80%</span>
                           </div>
                        </div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tone Stability</p>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Hiring Bar Insights</span>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[7px] font-black text-zinc-500 uppercase tracking-widest"><span>Clarity</span><span className="text-zinc-300">High</span></div>
                           <div className="h-1 bg-zinc-900 rounded-full"><div className="h-full w-4/5 bg-blue-500"></div></div>
                           <div className="flex justify-between items-center text-[7px] font-black text-zinc-500 uppercase tracking-widest"><span>Quantification</span><span className="text-zinc-300">Med</span></div>
                           <div className="h-1 bg-zinc-900 rounded-full"><div className="h-full w-2/4 bg-blue-500"></div></div>
                        </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Battle-Tested Protocol</p>
                      <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[8px] font-black text-zinc-500 uppercase tracking-widest hover:text-blue-500 hover:border-blue-500/30 transition-all">
                        Request Expert Answer
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
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
    </div>
  );
};

export default Dashboard;
