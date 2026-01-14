
import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { analyzeResume, generateFormattedResume } from '../services/geminiService';
import { ResumeScoreResponse, HistoryItem } from '../types';
import ReactMarkdown from 'react-markdown';
import { KryptoLogo } from './Branding';

const LOADING_STEPS = [
  "Typographic Grid Initialization...",
  "Syntactic Grammar Audit...",
  "Applying Google XYZ Formula...",
  "Polishing Executive Summaries...",
  "Rendering Professional Blueprint..."
];

const MAX_FILE_SIZE = 15 * 1024 * 1024;

interface ResumeScorerProps {
  userCredits: number;
  onUse: (amount: number) => boolean;
  maxImprovements: number;
  onNavigatePricing: () => void;
  onSaveHistory: (item: HistoryItem) => void;
  persistedData: {
    file: File | null;
    result: ResumeScoreResponse | null;
    formattedResume: string | null;
    resumeData: { data: string, mimeType: string } | string | null;
  };
  setPersistedData: {
    setFile: (file: File | null) => void;
    setResult: (res: ResumeScoreResponse | null) => void;
    setFormattedResume: (res: string | null) => void;
    setResumeData: (data: { data: string, mimeType: string } | string | null) => void;
  };
}

const ResumeScorer: React.FC<ResumeScorerProps> = ({ 
  userCredits, 
  onUse, 
  maxImprovements, 
  onNavigatePricing, 
  onSaveHistory,
  persistedData,
  setPersistedData
}) => {
  const { file, result, formattedResume, resumeData } = persistedData;
  const { setFile, setResult, setFormattedResume, setResumeData } = setPersistedData;

  const [isArchitecting, setIsArchitecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isHoveringScore, setIsHoveringScore] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const architectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (loading || isArchitecting) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + (Math.random() * 0.5 + 0.3); 
          return next > 99 ? 99 : next;
        });
        setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 && loadingProgress > (prev + 1) * 19 ? prev + 1 : prev));
      }, 150);
    } else {
      setLoadingProgress(0);
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, isArchitecting, loadingProgress]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const validateAndSetFile = async (selectedFile: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Document Rejected: Please upload PDF, DOCX, or Image.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Document Rejected: File exceeds 15MB.");
      return;
    }
    try {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setResumeData(mammothResult.value);
        setFile(selectedFile);
      } else {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(selectedFile);
        });
        const base64 = await base64Promise;
        setResumeData({ data: base64, mimeType: selectedFile.type });
        setFile(selectedFile);
      }
    } catch (err) {
      setError("Processing failed.");
    }
  };

  const handleScore = async () => {
    if (!resumeData) return;
    if (userCredits < 10) { onNavigatePricing(); return; }
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeResume(resumeData);
      if (!analysis.refused) onUse(10);
      setLoadingProgress(100);
      setResult(analysis);
    } catch (e) {
      setError("Analysis Engine timed out.");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleArchitectResume = async () => {
    if (!result || !resumeData) return;
    if (userCredits < 15) { onNavigatePricing(); return; }
    setIsArchitecting(true);
    setLoadingProgress(0);
    try {
      const improvementsText = result.improvements.map(i => `${i.category}: ${i.suggestion}`).join('\n');
      const architected = await generateFormattedResume(resumeData, improvementsText);
      onUse(15);
      setLoadingProgress(100);
      setFormattedResume(architected);
      setTimeout(() => architectRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsArchitecting(false), 800);
    }
  };

  const handleSaveToVault = () => {
    if (!formattedResume) return;
    setIsSaving(true);
    onSaveHistory({
      id: Math.random().toString(36).substr(2, 9),
      type: 'strategy',
      title: `Blueprint: ${file?.name || 'Resume'}`,
      date: new Date().toLocaleDateString(),
      inputs: { context: 'Executive Blueprint Reconstruction' },
      result: formattedResume
    });
    setTimeout(() => { 
      setIsSaving(false); 
      alert("Optimized Asset archived in vault."); 
    }, 600);
  };

  const handleSaveAuditToVault = () => {
    if (!result) return;
    setIsSaving(true);
    
    const auditContent = `# Audit Report: ${file?.name || 'Resume'}\n\n` +
      `**Overall Score: ${result.score}%**\n\n` +
      `### Professional Summary\n${result.formattingRecommendations}\n\n` +
      `### Score Breakdown\n` +
      `- **Impact Quantization:** ${result.breakdown.impact}%\n` +
      `- **Keyword Alignment:** ${result.breakdown.keywords}%\n` +
      `- **Readability:** ${result.breakdown.readability}%\n` +
      `- **ATS Parsability:** ${result.breakdown.ats}%\n\n` +
      `### Critical Refinements\n` +
      result.improvements.map(imp => `- **${imp.category}:** ${imp.suggestion}\n  - *Why:* ${imp.why}`).join('\n');

    onSaveHistory({
      id: Math.random().toString(36).substr(2, 9),
      type: 'strategy',
      title: `Audit: ${file?.name || 'Resume'}`,
      date: new Date().toLocaleDateString(),
      inputs: { role: 'Professional Audit' },
      result: auditContent
    });
    
    setTimeout(() => {
      setIsSaving(false);
      alert("Audit Findings archived in vault.");
    }, 500);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setFormattedResume(null);
    setResumeData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const getScoreColors = (score: number) => {
    if (score <= 35) return { stroke: 'stroke-red-500', text: 'text-red-500', bg: 'bg-red-500' };
    if (score <= 75) return { stroke: 'stroke-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { stroke: 'stroke-green-500', text: 'text-green-500', bg: 'bg-green-500' };
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-40">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] border border-yellow-500/20">
          Audit Protocol Active
        </div>
        <h2 className="text-4xl sm:text-7xl font-black tracking-tight uppercase text-zinc-100">
          ATS <span className="gold-text-gradient">Optimization Lab</span>
        </h2>
        <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Reconstruct your professional identity using high-precision semantic mapping and quantify your impact.
        </p>
      </div>

      <div className="space-y-12">
        {!result && !loading && !formattedResume && (
          <div className="max-w-3xl mx-auto">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if(f) validateAndSetFile(f); }}
              className={`relative min-h-[400px] bg-[#0c0c0e] border-2 rounded-[64px] flex flex-col items-center justify-center p-12 transition-all duration-700 shadow-3xl overflow-hidden ${
                isDragging ? 'border-yellow-500 bg-yellow-500/5 scale-[1.01]' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-bl-full pointer-events-none"></div>
              
              {file ? (
                <div className="text-center space-y-10 relative z-10">
                  <div className="relative w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto border border-yellow-500/20 group animate-in zoom-in">
                    <KryptoLogo size={40} className="text-yellow-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-zinc-100 uppercase tracking-tight truncate max-w-sm">{file.name}</h4>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol ready</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={handleScore} className="px-12 py-6 bg-yellow-500 text-zinc-950 rounded-[28px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl border-b-4 border-yellow-700">
                      Initialize Audit (10 Credits)
                    </button>
                    <button onClick={handleReset} className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-400">Discard Asset</button>
                  </div>
                </div>
              ) : (
                <div className="text-center group relative z-10">
                  <div className="w-24 h-24 bg-zinc-900/50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-zinc-800 group-hover:bg-zinc-800 group-hover:border-yellow-500/30 transition-all duration-500">
                    <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h4 className="text-zinc-100 text-2xl font-black mb-4 uppercase tracking-tight">Deploy Resume Portfolio</h4>
                  <button onClick={() => fileInputRef.current?.click()} className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all shadow-xl">Select Local Asset</button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} className="hidden" accept=".pdf,.docx,image/*" />
            </div>
          </div>
        )}

        {(loading || isArchitecting) && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in space-y-12">
            <div className="w-72 h-80 bg-zinc-950 rounded-[56px] border border-zinc-900 relative shadow-3xl overflow-hidden animate-pulse">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500 shadow-[0_0_20px_#eab308] animate-[scan_3s_linear_infinite]"></div>
               <style>{`@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(320px); opacity: 0; } }`}</style>
               <div className="p-12 space-y-8 text-left">
                 <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
                 <div className="space-y-2">
                   <div className="h-1.5 bg-zinc-900 rounded w-full"></div>
                   <div className="h-1.5 bg-zinc-900 rounded w-5/6"></div>
                   <div className="h-1.5 bg-zinc-900 rounded w-4/6"></div>
                 </div>
                 <div className="h-16"></div>
                 <div className="h-1.5 bg-zinc-900 rounded w-full"></div>
               </div>
            </div>
            
            <div className="w-full max-w-md space-y-6">
              <div className="relative h-3 bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-zinc-100 uppercase tracking-tight">
                  {isArchitecting ? "Reconstructing Identity..." : "Executing Semantic Audit..."}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-yellow-500 font-black text-lg">{Math.round(loadingProgress)}%</span>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                    {LOADING_STEPS[currentStep]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !loading && !formattedResume && (
          <div ref={resultRef} className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                 {/* Interactive Recruitment Score Card */}
                 <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[64px] p-10 flex flex-col items-center justify-center space-y-6 shadow-3xl relative overflow-hidden min-h-[500px]">
                    <div 
                      className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center cursor-help group/score"
                      onMouseEnter={() => setIsHoveringScore(true)}
                      onMouseLeave={() => setIsHoveringScore(false)}
                      onTouchStart={() => setIsHoveringScore(true)}
                      onTouchEnd={() => setIsHoveringScore(false)}
                    >
                      <svg className="w-full h-full transform -rotate-90 transition-transform duration-700 group-hover/score:scale-105">
                        <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none" strokeWidth="10" />
                        <circle 
                          cx="50%" cy="50%" r={radius} 
                          className={`fill-none transition-all duration-1500 ease-out ${getScoreColors(result.score).stroke}`} 
                          strokeWidth="10" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference - (result.score / 100) * circumference} 
                          strokeLinecap="round" 
                        />
                      </svg>
                      
                      {/* Hover/Interactive Overlay Breakdown */}
                      <div className={`absolute inset-0 bg-zinc-950/90 rounded-full flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${isHoveringScore ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                        <p className="text-[10px] font-black uppercase text-yellow-500 mb-4 tracking-widest border-b border-yellow-500/20 pb-2">Contribution Matrix</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full max-w-[160px]">
                           <div className="text-left"><p className="text-[8px] text-zinc-500 uppercase font-black">Impact</p><p className="text-xs text-zinc-100 font-black">25%</p></div>
                           <div className="text-left"><p className="text-[8px] text-zinc-500 uppercase font-black">ATS</p><p className="text-xs text-zinc-100 font-black">25%</p></div>
                           <div className="text-left"><p className="text-[8px] text-zinc-500 uppercase font-black">Semantic</p><p className="text-xs text-zinc-100 font-black">25%</p></div>
                           <div className="text-left"><p className="text-[8px] text-zinc-500 uppercase font-black">Readability</p><p className="text-xs text-zinc-100 font-black">25%</p></div>
                        </div>
                      </div>

                      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-4 transition-opacity duration-300 ${isHoveringScore ? 'opacity-0' : 'opacity-100'}`}>
                         <span className={`text-6xl sm:text-7xl font-black tracking-tighter leading-none mb-1 ${getScoreColors(result.score).text}`}>{result.score}%</span>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                       <span className="text-[11px] sm:text-[12px] font-black text-zinc-500 uppercase tracking-[0.5em] whitespace-nowrap">Recruitment Index</span>
                    </div>

                    <div className="w-full max-w-sm space-y-6 pt-6 border-t border-zinc-900">
                       {[
                         { label: 'Impact Quantization', value: result.breakdown.impact, color: 'bg-green-500', desc: 'Metric-driven accomplishments and quantifiable performance indicators.' },
                         { label: 'Keyword Alignment', value: result.breakdown.keywords, color: 'bg-yellow-500', desc: 'Industry-specific terminology and skill-set semantic density.' },
                         { label: 'Recruiter Readability', value: result.breakdown.readability, color: 'bg-blue-500', desc: 'Visual hierarchy optimization for the 6-second recruiter glance.' },
                         { label: 'ATS Parsability', value: result.breakdown.ats, color: 'bg-purple-500', desc: 'Structural compliance with automated parsing and ranking algorithms.' }
                       ].map((item) => (
                         <div key={item.label} className="space-y-1.5">
                            <div className="flex justify-between items-end mb-1">
                               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                               <span className="text-sm font-black text-zinc-200">{item.value}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                               <div className={`h-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000 ${item.color}`} style={{ width: `${item.value}%` }}></div>
                            </div>
                            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Audit Findings Overview */}
                 <div className="bg-zinc-950 border border-zinc-900 rounded-[64px] p-10 flex flex-col shadow-3xl relative overflow-hidden group min-h-[500px]">
                    <div className="flex-1 flex flex-col justify-between">
                       <div className="space-y-10">
                          <div className="space-y-2">
                             <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-100">Executive Audit Findings</h3>
                             <div className="w-16 h-1 bg-yellow-500 rounded-full"></div>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none text-zinc-400 font-medium leading-relaxed italic border-l-2 border-yellow-500/20 pl-6 py-1">
                             "{result.formattingRecommendations}"
                          </div>
                          
                          {/* Optimization Promotion Text */}
                          <div className="space-y-6 pt-6">
                            <div className="bg-yellow-500/5 rounded-3xl p-8 border border-yellow-500/10 space-y-4 relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-3">
                                  <svg className="w-6 h-6 text-yellow-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                               </div>
                               <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em]">Neural Rebuild Protocol</h4>
                               <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                                  Our architected solution applies the <span className="text-zinc-100 font-bold">Google XYZ formula</span> across every bullet point, ensuring your resume resonates at the highest executive levels. 
                                  View the critical refinements below and then execute the full optimization.
                               </p>
                               <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-green-500"></span><span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Copy-Paste Ready</span></div>
                                  <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-green-500"></span><span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">ATS Verified</span></div>
                               </div>
                            </div>
                          </div>
                       </div>
                       
                       <div className="pt-10 text-center">
                          <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em]">KRYPTO CORE ENGINE V4.1 • PROFESSIONAL UPGRADE</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Detailed Improvements Section */}
            <div className="space-y-10 pt-16">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700 mb-2 block">Deconstructive Intelligence</span>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">Critical <span className="gold-text-gradient">Refinements</span></h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {result.improvements.slice(0, maxImprovements).map((improvement, i) => (
                  <div key={i} className="bg-[#0c0c0e] border border-zinc-900 rounded-[48px] overflow-hidden hover:border-zinc-700 transition-all duration-500 shadow-2xl group">
                    <div className="p-10 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500/60 block">{improvement.category}</span>
                        <h4 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">{improvement.suggestion}</h4>
                      </div>
                      <div className="px-4 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Logic Tier 1</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-10 bg-red-500/[0.02] border-r border-zinc-900 space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                           <span className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Original Deficiency</span>
                        </div>
                        <p className="text-zinc-600 text-sm font-medium leading-relaxed italic line-through decoration-red-500/20">"{improvement.before}"</p>
                      </div>
                      <div className="p-10 bg-green-500/[0.02] space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                           <span className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">Architected (XYZ Formula)</span>
                        </div>
                        <p className="text-zinc-200 text-sm font-black leading-relaxed uppercase tracking-tight group-hover:text-white transition-colors">{improvement.after}</p>
                        <div className="mt-4 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-900 border-l-4 border-l-yellow-500/40">
                           <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 italic">Rationale / Why:</p>
                           <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{improvement.why}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Optimization & Save Controls at the end of refinements */}
              <div className="flex flex-col gap-6 max-w-4xl mx-auto pt-10">
                 <button 
                  onClick={handleArchitectResume} 
                  className="w-full py-7 px-4 bg-yellow-500 text-zinc-950 rounded-[28px] hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl border-b-4 border-yellow-700 flex flex-col items-center justify-center group"
                 >
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-center">
                     Execute High-Fidelity Optimization
                   </span>
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">Transform Blueprint • 15 Credits</span>
                 </button>
                 
                 <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                    onClick={handleSaveAuditToVault} 
                    disabled={isSaving}
                    className="flex-1 py-5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                   >
                     {isSaving ? <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div> : (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                         Save Audit to Vault
                       </>
                     )}
                   </button>
                   <button onClick={handleReset} className="flex-1 py-5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-zinc-300 transition-all flex items-center justify-center gap-3">
                     Discard & Reset Audit
                   </button>
                 </div>
              </div>
            </div>
            
            <div className="text-center pt-20">
               <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.8em]">Secure Recruitment Intelligence Suite</p>
            </div>
          </div>
        )}

        {formattedResume && !isArchitecting && (
          <div ref={architectRef} className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000 scroll-mt-24 pb-32">
            <div className="text-center space-y-6">
              <span className="text-[12px] font-black uppercase tracking-[0.6em] text-zinc-700 block">Neural Rebuild Complete</span>
              <h3 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase text-zinc-100">Executive <span className="gold-text-gradient">Blueprint</span></h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white text-zinc-900 p-12 sm:p-24 rounded-[80px] shadow-3xl border border-zinc-200 overflow-hidden relative w-full max-w-4xl min-h-[600px] animate-in zoom-in-95 duration-1000">
                 <div className="prose prose-slate max-w-none prose-headings:text-zinc-950 prose-headings:font-black prose-p:font-medium prose-p:text-zinc-700">
                    <ReactMarkdown>{formattedResume}</ReactMarkdown>
                 </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
               <button onClick={handleSaveToVault} disabled={isSaving} className="px-12 py-7 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50 shadow-2xl">
                  {isSaving ? <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Secure Blueprint in Vault
                    </>
                  )}
               </button>
            </div>
            <div className="text-center pt-24">
               <button onClick={handleReset} className="px-10 py-5 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 border-b-4 border-yellow-700">New Audit Protocol</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScorer;
