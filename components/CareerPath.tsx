
import React, { useState, useEffect, useRef } from 'react';
import { predictCareerPaths, generateCareerStrategy, generateMarketIntelligence } from '../services/geminiService';
import { CareerPathResponse, PersonalityTraitScores, QuizQuestion, HistoryItem } from '../types';
import ReactMarkdown from 'react-markdown';
import { KryptoLogo } from './Branding';
import mammoth from 'mammoth';

const ANALYSIS_STEPS = [
  "Sequencing Personality DNA...",
  "Synthesizing Career Market Topography...",
  "Calibrating Local Hub Signals...",
  "Parsing Economic Salary Parity...",
  "Finalizing Executive Blueprint..."
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "In a high-pressure deadline scenario, what is your primary focus?",
    options: [
      { text: "Detailed audit of all data points and logic.", traits: { analytic: 10, investigative: 5 } },
      { text: "Experimenting with creative, rapid-fire solutions.", traits: { creative: 10 } },
      { text: "Strategic delegation and timeline management.", traits: { leadership: 10 } },
      { text: "Maintaining team cohesion and emotional support.", traits: { social: 10 } }
    ]
  },
  {
    id: 2,
    text: "Which environment allows you to reach a 'flow state' most easily?",
    options: [
      { text: "A quiet, data-dense research environment.", traits: { investigative: 10, analytic: 5 } },
      { text: "A studio filled with visual and conceptual tools.", traits: { creative: 10 } },
      { text: "A collaborative hub where I can lead and influence.", traits: { leadership: 10, social: 5 } },
      { text: "A workshop where I can build or fix physical things.", traits: { practical: 10 } }
    ]
  },
  {
    id: 3,
    text: "What motivates your long-term career ambition?",
    options: [
      { text: "Achieving mastery in a complex technical domain.", traits: { analytic: 10, investigative: 10 } },
      { text: "Disrupting a market with a brand new concept.", traits: { creative: 10, practical: 5 } },
      { text: "Climbing the ladder to a C-suite or founder role.", traits: { leadership: 10 } },
      { text: "Building a foundation that helps a community thrive.", traits: { social: 10 } }
    ]
  },
  {
    id: 4,
    text: "How do you typically process complex, new information?",
    options: [
      { text: "Create a mental or digital spreadsheet of facts.", traits: { analytic: 10, investigative: 5 } },
      { text: "Sketch out a mind map of creative connections.", traits: { creative: 10, investigative: 5 } },
      { text: "Decide immediately how this impacts my team's KPIs.", traits: { leadership: 10, practical: 10 } },
      { text: "Talk it through with peers to gauge their perspective.", traits: { social: 10 } }
    ]
  },
  {
    id: 5,
    text: "What role do you play in a team setting?",
    options: [
      { text: "The Architect: Designing the core system.", traits: { analytic: 10, practical: 10 } },
      { text: "The Visionary: Dreaming of what's next.", traits: { creative: 10 } },
      { text: "The Captain: Steering the ship forward.", traits: { leadership: 10 } },
      { text: "The Connector: Ensuring everyone is heard.", traits: { social: 10, practical: 10 } }
    ]
  }
];

const ExperiencedIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-700">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">
      <defs>
        <linearGradient id="exp-grad-new" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <rect x="20" y="35" width="60" height="45" rx="4" fill="#18181b" stroke="url(#exp-grad-new)" strokeWidth="2.5" />
      <path d="M40 35V25C40 22.2386 42.2386 20 45 20H55C57.7614 20 60 22.2386 60 25V35" stroke="url(#exp-grad-new)" strokeWidth="2.5" fill="none" />
      <circle cx="50" cy="57.5" r="8" stroke="url(#exp-grad-new)" strokeWidth="2" fill="none" />
      <path d="M50 54V61M46.5 57.5H53.5" stroke="url(#exp-grad-new)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" x2="80" y1="45" y2="45" stroke="url(#exp-grad-new)" strokeWidth="1" opacity="0.4" />
    </svg>
  </div>
);

const FresherIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-700">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
      <defs>
        <linearGradient id="fresh-grad-new" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" stroke="url(#fresh-grad-new)" strokeWidth="1.5" strokeDasharray="6 3" fill="none" />
      <path d="M50 20L60 45H40L50 20Z" fill="url(#fresh-grad-new)" stroke="url(#fresh-grad-new)" strokeWidth="2" />
      <rect x="35" y="50" width="30" height="25" rx="3" fill="#18181b" stroke="url(#fresh-grad-new)" strokeWidth="2.5" />
      <circle cx="50" cy="62.5" r="4" fill="url(#fresh-grad-new)" className="animate-pulse" />
      <path d="M50 15V85M15 50H85" stroke="url(#fresh-grad-new)" strokeWidth="0.5" opacity="0.2" />
    </svg>
  </div>
);

const RadarChart = ({ scores }: { scores: PersonalityTraitScores }) => {
  const max = 50;
  const size = 300;
  const center = size / 2;
  const r = 100;
  const labels: (keyof PersonalityTraitScores)[] = ['analytic', 'creative', 'leadership', 'social', 'practical', 'investigative'];

  const getPoint = (i: number, factor: number) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const distance = (factor / max) * r;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const points = labels.map((label, i) => getPoint(i, scores[label]));
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {labels.map((_, i) => {
          const p = getPoint(i, max);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-zinc-800/60" strokeWidth="1" />;
        })}
        <polygon
          points={polygonPath}
          className="fill-yellow-500/15 stroke-yellow-500 animate-in fade-in zoom-in duration-1000 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {labels.map((label, i) => {
          const p = getPoint(i, max + 25);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              className="text-[8px] font-black uppercase tracking-widest fill-zinc-500"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

interface CareerPathProps {
  userCredits: number;
  userLocation: string;
  userSymbol?: string;
  onUse: (amt: number) => boolean;
  onNavigatePricing: () => void;
  onSaveHistory: (item: HistoryItem) => void;
  onVerifyLocation: () => void;
  isVerifyingLocation: boolean;
  onSetManualLocation: (loc: string) => void;
}

const CareerPath: React.FC<CareerPathProps> = ({ 
  userCredits, userLocation, userSymbol = '$', onUse, onNavigatePricing, onSaveHistory, onVerifyLocation, isVerifyingLocation, onSetManualLocation
}) => {
  const [userType, setUserType] = useState<'experienced' | 'fresher' | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [scores, setScores] = useState<PersonalityTraitScores>({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<CareerPathResponse | null>(null);
  const [resumeData, setResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);
  const [dnaCode, setDnaCode] = useState('');
  const [manualCity, setManualCity] = useState('');

  // Sub-feature states
  const [activeStrategyIdx, setActiveStrategyIdx] = useState<number | null>(null);
  const [strategyInputs, setStrategyInputs] = useState({ budget: '', months: '', hours: '' });
  const [strategyResults, setStrategyResults] = useState<Record<number, string>>({});
  const [insightResults, setInsightResults] = useState<Record<number, string>>({});
  const [subLoading, setSubLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => setAnalysisStep(p => (p < ANALYSIS_STEPS.length - 1 ? p + 1 : p)), 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateDnaCode = () => {
    const codes = Object.entries(scores).map(([k, v]) => `${k[0].toUpperCase()}${v}`).join('');
    setDnaCode(`KRYP-${codes}`);
  };

  const handlePredict = async () => {
    const cost = 25; 
    if (userCredits < cost) { onNavigatePricing(); return; }
    setLoading(true);
    generateDnaCode();
    try {
      const response = await predictCareerPaths(scores, userLocation || 'GLOBAL', userType || 'fresher', resumeData as any);
      if (!response.refused) onUse(cost);
      setResult(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setResumeData(mammothResult.value);
      } else {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        setResumeData({ data: base64, mimeType: file.type });
      }
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionSelect = (traits: Partial<PersonalityTraitScores>) => {
    setScores(p => {
      const ns = { ...p };
      Object.entries(traits).forEach(([k, v]) => { ns[k as keyof PersonalityTraitScores] += (v || 0); });
      return ns;
    });
    if (currentStep < 5) setCurrentStep(p => p + 1);
    else handlePredict();
  };

  const unlockStrategy = async (idx: number, role: string) => {
    if (userCredits < 10) { onNavigatePricing(); return; }
    setSubLoading(prev => ({ ...prev, [`strat-${idx}`]: true }));
    try {
      const strategy = await generateCareerStrategy(role, strategyInputs, resumeData as any);
      onUse(10);
      setStrategyResults(prev => ({ ...prev, [idx]: strategy }));
      setActiveStrategyIdx(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubLoading(prev => ({ ...prev, [`strat-${idx}`]: false }));
    }
  };

  const unlockInsights = async (idx: number, role: string) => {
    if (userCredits < 10) { onNavigatePricing(); return; }
    setSubLoading(prev => ({ ...prev, [`insight-${idx}`]: true }));
    try {
      const insight = await generateMarketIntelligence(role, userLocation || 'GLOBAL', resumeData as any);
      onUse(10);
      setInsightResults(prev => ({ ...prev, [idx]: insight }));
    } catch (e) {
      console.error(e);
    } finally {
      setSubLoading(prev => ({ ...prev, [`insight-${idx}`]: false }));
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(-1);
    setUserType(null);
    setResumeData(null);
    setStrategyResults({});
    setInsightResults({});
    setScores({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 pb-40 text-[13px]">
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
          Career DNA Sequence
        </div>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-zinc-100">
          Career <span className="gold-text-gradient">DNA Mapping</span>
        </h2>
        
        {!result && !loading && (
          <div className="max-w-2xl mx-auto p-1 bg-zinc-900/40 border border-zinc-800 rounded-[40px] shadow-3xl overflow-hidden">
             <div className="p-6 sm:p-8 space-y-6">
               <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                     <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">Market Topography</h3>
                     <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                       Detecting local salary parity and business hubs.
                     </p>
                  </div>
                  <button 
                    onClick={onVerifyLocation} 
                    disabled={isVerifyingLocation} 
                    className="w-full sm:w-auto px-6 py-4 bg-zinc-100 text-zinc-950 rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isVerifyingLocation ? <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div> : "Detect City"}
                  </button>
               </div>

               <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                   type="text" 
                   value={manualCity} 
                   onChange={(e) => setManualCity(e.target.value)} 
                   placeholder="Enter City Name..." 
                   className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[20px] px-5 py-4 text-[10px] text-zinc-100 uppercase font-black tracking-widest focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700 w-full" 
                 />
                 <button 
                   onClick={() => onSetManualLocation(manualCity)} 
                   disabled={!manualCity.trim()}
                   className="w-full sm:w-auto px-6 py-4 bg-zinc-800 text-zinc-300 rounded-[20px] text-[9px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all active:scale-95"
                 >
                   Update City
                 </button>
               </div>

               {userLocation && (
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Targeting: <span className="text-zinc-100">{userLocation}</span></p>
                  </div>
               )}
             </div>
          </div>
        )}
      </div>

      {!loading && !result && (
        <div className="max-w-4xl mx-auto">
          {currentStep === -1 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                <button 
                  onClick={() => { setUserType('experienced'); setCurrentStep(0); }} 
                  className="bg-[#0c0c0e] border border-zinc-800 p-10 rounded-[48px] text-center hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-yellow-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <ExperiencedIllustration />
                   <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Experienced</h3>
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Strategic Pivot • Growth Mapping</p>
                   <div className="mt-8 px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[8px] font-black uppercase tracking-widest">
                      25 Credits
                   </div>
                </button>

                <button 
                  onClick={() => { setUserType('fresher'); setCurrentStep(1); }} 
                  className="bg-[#0c0c0e] border border-zinc-800 p-10 rounded-[48px] text-center hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <FresherIllustration />
                   <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Fresher</h3>
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Baseline • Potential Analysis</p>
                   <div className="mt-8 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[8px] font-black uppercase tracking-widest">
                      25 Credits
                   </div>
                </button>
             </div>
          ) : userType === 'experienced' && currentStep === 0 ? (
            <div className="max-w-2xl mx-auto p-10 bg-[#0c0c0e] border-2 border-dashed border-zinc-800 rounded-[48px] text-center space-y-8">
               <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
               </div>
               <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">Asset Integration</h3>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Upload your resume to enrich the sequence.</p>
               <input 
                 type="file" 
                 id="resume-dna" 
                 className="hidden" 
                 onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} 
                 accept=".pdf,.docx"
               />
               <div className="flex flex-col gap-3">
                 <button onClick={() => document.getElementById('resume-dna')?.click()} className="px-10 py-4 bg-zinc-100 text-zinc-950 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all">Upload Document</button>
                 <button onClick={() => setCurrentStep(1)} className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] hover:text-zinc-400">Skip Integration</button>
               </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-10">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Vector {currentStep} / 5</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`w-8 h-1 rounded-full ${i <= currentStep ? 'bg-yellow-500' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
               </div>
               <h3 className="text-2xl font-black text-center text-zinc-100 uppercase leading-tight tracking-tight">{QUIZ_QUESTIONS[currentStep - 1].text}</h3>
               <div className="space-y-3">
                 {QUIZ_QUESTIONS[currentStep - 1].options.map((opt, i) => (
                   <button 
                     key={i} 
                     onClick={() => handleOptionSelect(opt.traits)} 
                     className="w-full p-6 bg-[#0c0c0e] border border-zinc-800 rounded-[24px] text-left hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group flex items-center justify-between"
                   >
                     <span className="text-base font-black text-zinc-300 group-hover:text-zinc-100 uppercase tracking-tight">{opt.text}</span>
                     <div className="w-6 h-6 rounded-full border border-zinc-800 group-hover:border-yellow-500 flex items-center justify-center transition-all">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-32">
          <div className="relative w-40 h-40 mx-auto mb-12">
             <div className="absolute inset-0 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-4 border-2 border-blue-500 border-b-transparent rounded-full animate-spin-slow"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <KryptoLogo size={48} className="animate-pulse" />
             </div>
          </div>
          <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-4">{ANALYSIS_STEPS[analysisStep]}</p>
          <div className="flex items-center justify-center gap-2">
             <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
             <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
             <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
             <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-10 shadow-3xl flex flex-col items-center">
                <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-8">Neural Identity Sequence</h3>
                <RadarChart scores={scores} />
                
                <div className="mt-8 w-full flex flex-col items-center gap-4">
                   <div className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                      <p className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">DNA Token</p>
                      <p className="text-sm font-black gold-text-gradient tracking-widest">{dnaCode}</p>
                   </div>
                   
                   <div className="max-w-[240px] p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-center">
                      <p className="text-[8px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
                        This signature maps your core professional DNA to global growth indices.
                        It sequences hidden strengths into actionable market vectors.
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-10">
                <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-[40px] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/[0.02] rounded-bl-full pointer-events-none"></div>
                   <h3 className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-6">Archetype Decoding</h3>
                   <p className="text-2xl font-black text-zinc-100 tracking-tighter leading-tight italic">
                     "{result.personaSummary}"
                   </p>
                   <div className="mt-6 flex gap-3">
                      <div className="flex-1 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                         <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">Primary Axis</p>
                         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-tight">
                            {(Object.entries(scores) as [string, number][]).sort((a,b) => b[1]-a[1])[0][0]}
                         </p>
                      </div>
                      <div className="flex-1 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                         <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">Secondary Axis</p>
                         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-tight">
                            {(Object.entries(scores) as [string, number][]).sort((a,b) => b[1]-a[1])[1][0]}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                   <div className="text-center px-4">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Parity</p>
                      <p className="text-base font-black text-zinc-100 uppercase">Premium</p>
                   </div>
                   <div className="w-px h-8 bg-zinc-900 hidden sm:block"></div>
                   <div className="text-center px-4">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Market Hub</p>
                      <p className="text-base font-black text-zinc-100 uppercase">{userLocation || 'Global'}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-12 pt-12 border-t border-zinc-900">
            <h4 className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-[0.8em] mb-8">Sequenced Paths</h4>
            {result.careers.map((career, idx) => (
              <div key={idx} className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-10 sm:p-16 shadow-3xl space-y-12 relative overflow-hidden group hover:border-zinc-700 transition-all border-b-4 border-zinc-900">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/[0.01] rounded-bl-full pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                   <div className="space-y-5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[8px] font-black uppercase tracking-widest leading-none">Rank #{idx + 1}</span>
                        <div className="h-px bg-zinc-800 flex-1"></div>
                      </div>
                      <h4 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tighter uppercase leading-tight break-words">{career.title} <br /><span className="gold-text-gradient text-xl sm:text-2xl">{career.matchPercentage}% Alignment</span></h4>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-2xl">{career.reason}</p>
                   </div>
                   
                   <div className="bg-zinc-950 p-8 rounded-[32px] border border-zinc-900 shadow-2xl text-center min-w-[200px] border-b-4 border-green-500/30 self-start">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-2">Comp Benchmark</span>
                      <span className="text-2xl font-black text-green-500 block tracking-tighter">{career.salaryExpectation}</span>
                      <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-1 block">Localized to {userLocation}</span>
                   </div>
                </div>

                {/* Sub-Feature Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                   <div className="space-y-4">
                      <button 
                        onClick={() => setActiveStrategyIdx(activeStrategyIdx === idx ? null : idx)}
                        disabled={subLoading[`strat-${idx}`]}
                        className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-[20px] text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg border-b-2 border-zinc-300"
                      >
                         {subLoading[`strat-${idx}`] ? <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div> : "Unlock Strategy (10 Cr)"}
                      </button>
                      
                      {activeStrategyIdx === idx && (
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-[24px] space-y-5 animate-in slide-in-from-top-4">
                           <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest text-center">Simulation Parameters</p>
                           <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                 <label className="text-[7px] text-zinc-600 uppercase font-black px-1">Budget ({userSymbol})</label>
                                 <input type="text" placeholder={`${userSymbol}500`} value={strategyInputs.budget} onChange={e => setStrategyInputs({...strategyInputs, budget: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-300 outline-none focus:border-yellow-500/30" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[7px] text-zinc-600 uppercase font-black px-1">Months</label>
                                 <input type="number" placeholder="3" value={strategyInputs.months} onChange={e => setStrategyInputs({...strategyInputs, months: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-300 outline-none focus:border-yellow-500/30" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[7px] text-zinc-600 uppercase font-black px-1">Daily Hrs</label>
                                 <input type="number" placeholder="2" value={strategyInputs.hours} onChange={e => setStrategyInputs({...strategyInputs, hours: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-300 outline-none focus:border-yellow-500/30" />
                              </div>
                           </div>
                           <button onClick={() => unlockStrategy(idx, career.title)} disabled={!strategyInputs.budget || !strategyInputs.months || !strategyInputs.hours} className="w-full py-2.5 bg-yellow-500 text-zinc-950 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 disabled:opacity-30">Deploy Simulation</button>
                        </div>
                      )}

                      {strategyResults[idx] && (
                        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[32px] animate-in fade-in slide-in-from-top-4 prose-krypto">
                           <ReactMarkdown>{strategyResults[idx]}</ReactMarkdown>
                        </div>
                      )}
                   </div>

                   <div className="space-y-4">
                      <button 
                        onClick={() => unlockInsights(idx, career.title)}
                        disabled={subLoading[`insight-${idx}`]}
                        className="w-full py-4 bg-zinc-800 text-zinc-300 rounded-[20px] text-[9px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
                      >
                         {subLoading[`insight-${idx}`] ? <div className="w-3 h-3 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div> : "Market Insights (10 Cr)"}
                      </button>

                      {insightResults[idx] && (
                        <div className="bg-zinc-950 border border-blue-500/20 p-8 rounded-[32px] animate-in fade-in slide-in-from-top-4 prose-krypto">
                           <ReactMarkdown>{insightResults[idx]}</ReactMarkdown>
                        </div>
                      )}
                   </div>
                </div>

                {/* Original Skills & Certs - Enhanced for visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-zinc-900 relative z-10">
                   <div className="space-y-4">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Baseline Skills</span>
                      <div className="flex flex-wrap gap-2">
                         {career.requiredSkills.map((s, i) => (
                           <span key={i} className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{s}</span>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Recommended Certifications</span>
                      <div className="grid grid-cols-1 gap-3">
                         {career.certifications.map((cert, i) => (
                            <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all group">
                               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                 <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4" /></svg>
                               </div>
                               <div className="flex-1">
                                  <span className="text-[11px] font-black text-zinc-200 uppercase tracking-tight leading-tight block">{cert}</span>
                                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Industry Standard Recognition</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-10 animate-in slide-in-from-bottom-4 duration-1000">
             <button onClick={handleReset} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 active:scale-95 transition-all shadow-3xl border-b-4 border-zinc-300">New Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
