
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
}

const ResumeScorer: React.FC<ResumeScorerProps> = ({ userCredits, onUse, maxImprovements, onNavigatePricing, onSaveHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeScoreResponse | null>(null);
  const [formattedResume, setFormattedResume] = useState<string | null>(null);
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const architectRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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

  const handleDownloadPdf = () => {
    if (!formattedResume || !pdfTemplateRef.current) return;
    const element = pdfTemplateRef.current;
    
    // Temporarily make it "visible" to html2pdf by removing the extreme positioning
    // but html2pdf works best if the element is in the layout flow or captured by ID.
    const opt = {
      margin: 10,
      filename: `Krypto_Blueprint_${file?.name.split('.')[0] || 'Executive'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    if ((window as any).html2pdf) {
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF engine loading...");
    }
  };

  const handleDownloadTxt = () => {
    if (!formattedResume) return;
    // Clean markdown and artifacts
    const cleanText = formattedResume
      .replace(/â€“/g, '-') // Fix en-dash artifact
      .replace(/–/g, '-')   // Ensure standard dash
      .replace(/#/g, '')
      .replace(/\*/g, '')
      .replace(/\[|\]/g, '')
      .trim();
    const watermark = "\n\n==================================================\nAUTHENTICATED BY KRYPTO AI - CAREER ARCHITECT\n==================================================";
    const blob = new Blob([cleanText + watermark], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Krypto_${file?.name.split('.')[0] || 'Resume'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
    setTimeout(() => { setIsSaving(false); alert("Blueprint successfully secured in your Vault."); }, 600);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setFormattedResume(null);
    setResumeData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-yellow-500/20">
          EXECUTIVE BLUEPRINT ENGINE V4.0
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight uppercase text-zinc-100">
          ATS <span className="gold-text-gradient">Architect</span>
        </h2>
        <p className="text-zinc-500 font-medium text-lg max-w-lg mx-auto">
          Convert raw experience into high-performance professional assets.
        </p>
      </div>

      <div className="space-y-12">
        {!result && !loading && !formattedResume && (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if(f) validateAndSetFile(f); }}
            className={`relative min-h-[340px] bg-[#0c0c0e] border-2 rounded-[40px] flex flex-col items-center justify-center p-8 transition-all duration-500 ${
              isDragging ? 'border-yellow-500 bg-yellow-500/5 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-700 shadow-2xl'
            }`}
          >
            {file ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="text-xl font-black text-zinc-100 uppercase truncate max-w-xs">{file.name}</h4>
                <button onClick={handleScore} className="px-10 py-5 bg-yellow-500 text-zinc-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-xl">
                  Analyze Blueprint (10 Credits)
                </button>
                <button onClick={handleReset} className="block mx-auto text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">Reset Document</button>
              </div>
            ) : (
              <div className="text-center group">
                <div className="w-20 h-20 bg-zinc-900 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-zinc-800 group-hover:bg-zinc-800 transition-all">
                  <svg className="w-8 h-8 text-zinc-600 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h4 className="text-zinc-100 text-xl font-black mb-2 uppercase tracking-tight">Drop Portfolio</h4>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-8">PDF, DOCX, or Image</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors">Select Local File</button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} className="hidden" accept=".pdf,.docx,image/*" />
          </div>
        )}

        {(loading || isArchitecting) && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-64 h-80 bg-zinc-900 rounded-[40px] border border-zinc-800 relative shadow-2xl overflow-hidden mb-12 animate-pulse">
               <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
               <div className="p-10 space-y-6">
                 <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                 <div className="h-2 bg-zinc-800 rounded w-full"></div>
                 <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
                 <div className="h-12"></div>
                 <div className="h-2 bg-zinc-800 rounded w-4/6"></div>
                 <div className="h-2 bg-zinc-800 rounded w-full"></div>
               </div>
            </div>
            <p className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-tight">{isArchitecting ? "Architecting Executive Identity..." : "Analyzing Strategic Alignment..."}</p>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">{LOADING_STEPS[currentStep]}</p>
          </div>
        )}

        {result && !loading && !formattedResume && (
          <div ref={resultRef} className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none" strokeWidth="14" />
                  <circle cx="50%" cy="50%" r={radius} className="stroke-yellow-500 fill-none transition-all duration-1000" strokeWidth="14" strokeDasharray={circumference} strokeDashoffset={circumference - (result.score / 100) * circumference} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                  <span className="text-6xl font-black text-zinc-100 tracking-tighter">{result.score}%</span>
                  <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">Strategy Score</span>
                </div>
              </div>
              
              <div className="mt-12 w-full p-10 bg-[#0c0c0e] border border-yellow-500/20 rounded-[40px] text-center space-y-6 shadow-2xl">
                <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Blueprint Analysis Ready</h3>
                <p className="text-zinc-500 text-sm font-medium uppercase leading-relaxed max-w-md mx-auto">"{result.formattingRecommendations}"</p>
                <button onClick={handleArchitectResume} className="px-10 py-5 bg-yellow-500 text-zinc-950 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 shadow-xl border-b-4 border-yellow-700 transition-all flex items-center gap-3 mx-auto">
                  Execute Executive Architecting (15 Credits)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-2 block">Deconstructive Audit</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-100">Critical <span className="text-yellow-500">Refinements</span></h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {result.improvements.slice(0, maxImprovements).map((improvement, i) => (
                  <div key={i} className="bg-[#0c0c0e] border border-zinc-800 rounded-[32px] overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                    <div className="p-8 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500/60 block mb-1">{improvement.category}</span>
                        <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight">{improvement.suggestion}</h4>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[8px] font-black text-yellow-500 uppercase tracking-widest">XYZ FORMULA ADHERENCE</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-8 bg-red-500/5 border-r border-zinc-800 space-y-3">
                        <span className="text-[8px] font-black text-red-500/50 uppercase tracking-widest">Original Deficiency</span>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed italic line-through decoration-red-500/30">"{improvement.before}"</p>
                      </div>
                      <div className="p-8 bg-green-500/5 space-y-3">
                        <span className="text-[8px] font-black text-green-500/50 uppercase tracking-widest">Architected Solution</span>
                        <p className="text-zinc-100 text-sm font-black leading-relaxed uppercase tracking-tight">{improvement.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {formattedResume && !isArchitecting && (
          <div ref={architectRef} className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000 scroll-mt-24 pb-32">
            <div className="text-center">
              <span className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-6 block">Krypto Intelligence Output</span>
              <h3 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase text-zinc-100">Executive <span className="gold-text-gradient">Asset</span></h3>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white text-zinc-900 p-10 sm:p-24 rounded-[64px] shadow-2xl border border-zinc-200 overflow-hidden relative w-full max-w-4xl min-h-[500px]">
                 <div className="absolute top-0 right-0 w-4 h-full bg-yellow-500"></div>
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-950"></div>
                 <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{formattedResume}</ReactMarkdown>
                 </div>
              </div>
              <p className="mt-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] text-center italic max-w-sm leading-relaxed">
                "Digital preview rendered. High-fidelity architectural PDF export available below."
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
               <button onClick={handleSaveToVault} disabled={isSaving} className="px-12 py-6 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 shadow-2xl">
                  {isSaving ? <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div> : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Secure in Vault
                    </>
                  )}
               </button>
               <button onClick={handleDownloadTxt} className="px-12 py-6 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 active:scale-95 shadow-2xl">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Source TXT
               </button>
               <button onClick={handleDownloadPdf} className="px-12 py-6 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl border-b-4 border-yellow-700 flex items-center gap-3 active:scale-95">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 Download Premium PDF
               </button>
            </div>
            
            <div className="text-center pt-20">
               <button onClick={handleReset} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] hover:text-zinc-100 transition-colors uppercase">Start New Architecture</button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF Template for Capture */}
      <div id="resume-pdf-template" ref={pdfTemplateRef} className="w-[210mm] min-h-[297mm] bg-white text-zinc-900 font-['Inter'] flex">
        {/* Accent Sidebar Graphic */}
        <div className="w-14 bg-zinc-950 flex flex-col items-center py-12 gap-10 flex-shrink-0">
           <KryptoLogo size={32} className="grayscale brightness-[3]" />
           <div className="h-full w-[1px] bg-zinc-800" />
           <div className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500 rotate-180 whitespace-nowrap">
             KRYPTO AI ARCHITECTED • V4.1 • EXECUTIVE SECURE BLUEPRINT
           </div>
        </div>

        {/* Structured Content Area */}
        <div className="flex-1 p-[20mm] flex flex-col min-h-[297mm] bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-[100px]" />
          
          <div className="flex-1 relative z-10 prose prose-slate max-w-none 
            prose-h1:text-center prose-h1:text-5xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:uppercase prose-h1:mb-10 prose-h1:text-zinc-950 prose-h1:border-b-8 prose-h1:border-zinc-950 prose-h1:pb-8
            prose-h2:text-[10px] prose-h2:font-black prose-h2:tracking-[0.5em] prose-h2:uppercase prose-h2:text-yellow-600 prose-h2:mt-16 prose-h2:mb-6 prose-h2:bg-zinc-50 prose-h2:px-4 prose-h2:py-2 prose-h2:rounded-lg prose-h2:inline-block
            prose-h3:text-xl prose-h3:font-black prose-h3:text-zinc-900 prose-h3:mt-10 prose-h3:mb-3
            prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-700 prose-p:mb-5
            prose-li:text-sm prose-li:text-zinc-700 prose-li:mb-3 prose-li:list-outside
            prose-ul:mb-10 prose-ul:pl-6
          ">
              <ReactMarkdown>{formattedResume || ''}</ReactMarkdown>
          </div>
          
          {/* High-End Footer Watermark */}
          <div className="flex items-center justify-between py-10 border-t-2 border-zinc-100 mt-20">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg">
                 <KryptoLogo size={20} className="text-zinc-950" />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase text-zinc-950 block leading-tight tracking-widest">KRYPTO PERFORMANCE ASSET</span>
                  <span className="text-[8px] font-bold uppercase text-zinc-400 block tracking-wider">AUTHENTICATED BY EXECUTIVE PROTOCOL V4.1</span>
               </div>
             </div>
             <div className="text-right">
                <div className="text-[8px] font-black uppercase text-zinc-300 tracking-[0.2em]">ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                <div className="text-[7px] font-bold uppercase text-zinc-200 tracking-widest">ATS PARITY 100% • SECURE RECRUITMENT READY</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeScorer;
