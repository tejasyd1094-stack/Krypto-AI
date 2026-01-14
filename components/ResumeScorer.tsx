
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const architectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (loading || isArchitecting) {
      interval = setInterval(() => {
        setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, isArchitecting]);

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
      setResult(analysis);
    } catch (e) {
      setError("Analysis Engine timed out.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchitectResume = async () => {
    if (!result || !resumeData) return;
    if (userCredits < 15) { onNavigatePricing(); return; }
    setIsArchitecting(true);
    try {
      const improvementsText = result.improvements.map(i => `${i.category}: ${i.suggestion}`).join('\n');
      const architected = await generateFormattedResume(resumeData, improvementsText);
      onUse(15);
      setFormattedResume(architected);
      setTimeout(() => architectRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsArchitecting(false);
    }
  };

  const handleSaveToVault = () => {
    if (!formattedResume) return;
    setIsSaving(true);
    onSaveHistory({
      id: Math.random().toString(36).substr(2, 9),
      type: 'strategy',
      title: `Architected: ${file?.name || 'Resume'}`,
      date: new Date().toLocaleDateString(),
      inputs: { context: 'Executive Blueprint' },
      result: formattedResume
    });
    setTimeout(() => { 
      setIsSaving(false); 
      alert("Optimized Resume successfully secured in your History Vault."); 
    }, 600);
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
          Executive Audit Lab
        </div>
        <h2 className="text-4xl sm:text-7xl font-black tracking-tight uppercase text-zinc-100">
          ATS <span className="gold-text-gradient">Optimization Lab</span>
        </h2>
        <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Deep semantic audit of your professional assets. High-precision keyword detection and structural architecture analysis.
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
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">System ready for deployment</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={handleScore} className="px-12 py-6 bg-yellow-500 text-zinc-950 rounded-[28px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl shadow-yellow-500/20 border-b-4 border-yellow-700">
                      Initialize Audit (10 Credits)
                    </button>
                    <button onClick={handleReset} className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-400 transition-colors">Discard Blueprint</button>
                  </div>
                </div>
              ) : (
                <div className="text-center group relative z-10">
                  <div className="w-24 h-24 bg-zinc-900/50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-zinc-800 group-hover:bg-zinc-800 group-hover:border-yellow-500/30 transition-all duration-500">
                    <svg className="w-10 h-10 text-zinc-600 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h4 className="text-zinc-100 text-2xl font-black mb-4 uppercase tracking-tight">Deploy Resume Portfolio</h4>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-12">PDF • DOCX • IMAGE (MAX 15MB)</p>
                  <button onClick={() => fileInputRef.current?.click()} className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all shadow-xl">Select Local Asset</button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} className="hidden" accept=".pdf,.docx,image/*" />
            </div>
          </div>
        )}

        {(loading || isArchitecting) && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-72 h-96 bg-zinc-950 rounded-[56px] border border-zinc-900 relative shadow-3xl overflow-hidden mb-12 animate-pulse">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-500 shadow-[0_0_20px_#eab308] animate-[scan_3s_linear_infinite]"></div>
               <style>{`@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(384px); opacity: 0; } }`}</style>
               <div className="p-12 space-y-8">
                 <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
                 <div className="space-y-2">
                   <div className="h-1.5 bg-zinc-900 rounded w-full"></div>
                   <div className="h-1.5 bg-zinc-900 rounded w-5/6"></div>
                   <div className="h-1.5 bg-zinc-900 rounded w-4/6"></div>
                 </div>
                 <div className="h-24"></div>
                 <div className="h-1.5 bg-zinc-900 rounded w-full"></div>
                 <div className="h-1.5 bg-zinc-900 rounded w-2/3"></div>
               </div>
            </div>
            <p className="text-2xl font-black text-zinc-100 mb-2 uppercase tracking-tight">{isArchitecting ? "Rebuilding Professional Identity..." : "Deep Semantic Audit in Progress..."}</p>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">{LOADING_STEPS[currentStep]}</p>
          </div>
        )}

        {result && !loading && !formattedResume && (
          <div ref={resultRef} className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
                 <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[64px] p-10 flex flex-col items-center justify-center space-y-10 shadow-3xl relative overflow-hidden group min-h-[450px]">
                    <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-xl"></div>
                    <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-yellow-500/30 rounded-br-xl"></div>

                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                         <span className={`text-6xl sm:text-7xl font-black tracking-tighter leading-none mb-1 ${getScoreColors(result.score).text}`}>{result.score}%</span>
                         <span className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-1 whitespace-nowrap">Audit Score</span>
                      </div>
                    </div>

                    <div className="w-full max-w-xs space-y-6 pt-6 border-t border-zinc-900">
                       <div className="space-y-2">
                          <div className="flex justify-between items-end mb-1">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ATS Parsability</span>
                             <span className="text-sm font-black text-zinc-200">{result.breakdown.ats}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                             <div className={`h-full shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-1000 ${getScoreColors(result.breakdown.ats).bg}`} style={{ width: `${result.breakdown.ats}%` }}></div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-end mb-1">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Keyword Density</span>
                             <span className="text-sm font-black text-zinc-200">{result.breakdown.keywords}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                             <div className={`h-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000 ${getScoreColors(result.breakdown.keywords).bg}`} style={{ width: `${result.breakdown.keywords}%` }}></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-zinc-950 border border-zinc-900 rounded-[64px] p-10 flex flex-col shadow-3xl relative overflow-hidden group min-h-[450px]">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/[0.03] rounded-bl-[120px] pointer-events-none"></div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                       <div className="space-y-8">
                          <div className="space-y-2">
                             <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-100">Blueprint Analysis</h3>
                             <div className="w-16 h-1 bg-yellow-500 rounded-full"></div>
                          </div>
                          
                          <div className="prose prose-invert prose-sm max-w-none text-zinc-400 font-medium leading-relaxed italic border-l-2 border-yellow-500/20 pl-6 py-1">
                             "{result.formattingRecommendations}"
                          </div>
                       </div>

                       <div className="pt-10 space-y-6">
                          <button 
                            onClick={handleArchitectResume} 
                            className="w-full py-6 px-4 bg-yellow-500 text-zinc-950 rounded-[28px] hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl shadow-yellow-500/20 border-b-4 border-yellow-700 flex items-center justify-center group"
                          >
                             <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] leading-tight text-center">
                               Execute Fully Optimised Resume (15 Credits)
                             </span>
                          </button>
                          <p className="text-center text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em] mt-4">KRYPTO CORE ENGINE V4.1 • JAN 2026</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

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
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/5 border border-yellow-500/10 rounded-full">
                         <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                         <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest leading-none">High Parity</span>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center pt-10">
               <button onClick={handleReset} className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 hover:text-white transition-all shadow-xl">Start New Audit</button>
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
                 <div className="absolute top-0 right-0 w-6 h-full bg-yellow-500"></div>
                 <div className="absolute top-0 left-0 w-full h-2 bg-zinc-950"></div>
                 <div className="prose prose-slate max-w-none prose-headings:text-zinc-950 prose-headings:font-black prose-p:font-medium prose-p:text-zinc-700">
                    <ReactMarkdown>{formattedResume}</ReactMarkdown>
                 </div>
              </div>
              <p className="mt-8 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest italic max-w-lg">
                Note: This is a high-fidelity preview of the reconstructed asset. Please save the result to your history vault to copy the fully optimized resume.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
               <button onClick={handleSaveToVault} disabled={isSaving} className="px-12 py-7 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50 shadow-2xl group">
                  {isSaving ? <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div> : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Secure in Vault
                    </>
                  )}
               </button>
            </div>
            
            <div className="text-center pt-24">
               <button onClick={handleReset} className="px-10 py-5 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95 border-b-4 border-yellow-700">Deploy New Blueprint Analysis</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScorer;
