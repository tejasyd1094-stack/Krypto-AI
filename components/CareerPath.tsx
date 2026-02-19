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

const FRESHER_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "When starting a complex academic project or assignment, what is your first move?",
    options: [
      { text: "Conduct a deep audit of all instructions and data sources.", traits: { analytic: 10, investigative: 5 } },
      { text: "Brainstorm a unique, non-traditional approach or design.", traits: { creative: 10 } },
      { text: "Organize the timeline and delegate tasks to group members.", traits: { leadership: 10 } },
      { text: "Ensure everyone in the group feels comfortable and included.", traits: { social: 10 } }
    ]
  },
  {
    id: 2,
    text: "Which learning environment allows you to reach a 'flow state' most easily?",
    options: [
      { text: "A quiet library desk with complex puzzles or research papers.", traits: { investigative: 10, analytic: 5 } },
      { text: "A creative studio where I can visualize concepts and ideas.", traits: { creative: 10 } },
      { text: "Leading a student organization or coordinating an event.", traits: { leadership: 10, social: 5 } },
      { text: "A lab or workshop where I can build physical prototypes.", traits: { practical: 10 } }
    ]
  },
  {
    id: 3,
    text: "What drives your long-term ambition for your future career?",
    options: [
      { text: "Gaining mastery in a highly specialized technical field.", traits: { analytic: 10, investigative: 10 } },
      { text: "Creating a brand or product that has never existed before.", traits: { creative: 10, practical: 5 } },
      { text: "Rising to a position of authority or launching a company.", traits: { leadership: 10 } },
      { text: "Doing work that directly benefits society or individuals.", traits: { social: 10 } }
    ]
  },
  {
    id: 4,
    text: "How do you typically process new, difficult information?",
    options: [
      { text: "Create a logical summary or spreadsheet of key facts.", traits: { analytic: 10, investigative: 5 } },
      { text: "Sketch mind-maps to see the creative connections.", traits: { creative: 10, investigative: 5 } },
      { text: "Immediately try to apply the knowledge to a real-world task.", traits: { leadership: 10, practical: 10 } },
      { text: "Explain the concept to friends to hear their perspectives.", traits: { social: 10 } }
    ]
  },
  {
    id: 5,
    text: "In a group setting or club, what role do you naturally fall into?",
    options: [
      { text: "The Researcher: Finding and organizing the core facts.", traits: { analytic: 10, practical: 10 } },
      { text: "The Concept Designer: Crafting the visual or creative vision.", traits: { creative: 10 } },
      { text: "The Lead: Setting the goal and keeping everyone on track.", traits: { leadership: 10 } },
      { text: "The Mediator: Solving conflicts and building team spirit.", traits: { social: 10, practical: 10 } }
    ]
  }
];

const EXPERIENCED_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "When taking over a high-stakes project with critical delivery timelines, what is your priority?",
    options: [
      { text: "Analyze historical performance data to identify structural bottlenecks.", traits: { analytic: 10, investigative: 5 } },
      { text: "Pivot the strategy toward a radical, innovative methodology.", traits: { creative: 10 } },
      { text: "Re-align the team hierarchy and optimize resource allocation.", traits: { leadership: 10, practical: 5 } },
      { text: "Facilitate stakeholder workshops to ensure cultural alignment.", traits: { social: 10, leadership: 5 } }
    ]
  },
  {
    id: 2,
    text: "How do you handle a team member who is underperforming on a technical task?",
    options: [
      { text: "Conduct a root-cause analysis of their workflow and technical debt.", traits: { investigative: 10, analytic: 10 } },
      { text: "Encourage them to approach the task with a fresh, creative perspective.", traits: { creative: 10 } },
      { text: "Set strict KPIs and drive them toward the execution goal.", traits: { leadership: 10, practical: 10 } },
      { text: "Mentor them personally to rebuild their confidence and engagement.", traits: { social: 10, leadership: 5 } }
    ]
  },
  {
    id: 3,
    text: "In a boardroom setting, what defines your executive 'flow state'?",
    options: [
      { text: "Connecting disparate data points to predict long-term market shifts.", traits: { analytic: 10, investigative: 10 } },
      { text: "Visioning a disruptive product roadmap that breaks the status quo.", traits: { creative: 10, leadership: 5 } },
      { text: "Commanding the room and driving a decisive strategic consensus.", traits: { leadership: 10 } },
      { text: "Building a culture where every employee feels their impact.", traits: { social: 10, practical: 5 } }
    ]
  },
  {
    id: 4,
    text: "Your department faces a 20% budget cut. How do you re-architect your operations?",
    options: [
      { text: "Develop an algorithmic model to minimize operational loss.", traits: { analytic: 10, investigative: 10 } },
      { text: "Design a lean, creative workaround using open-source solutions.", traits: { creative: 10, practical: 10 } },
      { text: "Consolidate leadership roles and streamline for high-velocity output.", traits: { leadership: 10, practical: 10 } },
      { text: "Re-distribute workloads to prevent burnout and maintain morale.", traits: { social: 10, leadership: 5 } }
    ]
  },
  {
    id: 5,
    text: "How do you approach long-term professional networking?",
    options: [
      { text: "Mapping the industry hierarchy to identify high-value knowledge hubs.", traits: { analytic: 10, investigative: 10 } },
      { text: "Crafting a unique personal brand that stands out in digital spaces.", traits: { creative: 10 } },
      { text: "Actively mentoring and building a legacy within your organization.", traits: { social: 10, leadership: 10 } },
      { text: "Focusing on high-yield, tangible business partnerships.", traits: { practical: 10, leadership: 5 } }
    ]
  }
];

const ExperiencedIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-700">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="exp-grad-prof" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path d="M20 30C20 25 25 20 30 20H70C75 20 80 25 80 30V70C80 85 50 95 50 95C50 95 20 85 20 70V30Z" fill="#18181b" stroke="url(#exp-grad-prof)" strokeWidth="2.5" />
      <path d="M35 50L45 60L65 40" stroke="url(#exp-grad-prof)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="45" y="10" width="10" height="4" rx="2" fill="url(#exp-grad-prof)" />
    </svg>
  </div>
);

const FresherIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 45L50 25L85 45L50 65L15 45Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
      <path d="M25 51V70C25 70 50 80 75 70V51" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 45V65" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="85" cy="65" r="3" fill="#60a5fa" />
    </svg>
  </div>
);

const RadarChart = ({ scores }: { scores: PersonalityTraitScores }) => {
  const max = 50;
  const size = 500;
  const center = size / 2;
  const r = 170; 
  const labels: (keyof PersonalityTraitScores)[] = ['analytic', 'creative', 'leadership', 'social', 'practical', 'investigative'];

  const [activeIdx, setActiveIdx] = useState<number | null>(null);

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
    <div className="relative w-full max-w-[560px] aspect-square mx-auto flex items-center justify-center select-none group/radar bg-zinc-950/40 rounded-[64px] border border-zinc-900 shadow-inner">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <filter id="sci-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id="data-pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => (
          <circle key={`circle-${idx}`} cx={center} cy={center} r={r * lvl} className="fill-none stroke-zinc-800/10" strokeWidth="0.5" />
        ))}

        {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => {
          const gridPoints = labels.map((_, i) => `${getPoint(i, lvl * max).x},${getPoint(i, lvl * max).y}`).join(' ');
          return <polygon key={`hex-${idx}`} points={gridPoints} className={`fill-none ${idx % 2 === 0 ? 'stroke-zinc-800/60' : 'stroke-zinc-800/25'}`} strokeWidth={idx === 4 ? "4" : "1.5"} />;
        })}

        {labels.map((_, i) => {
          const p = getPoint(i, max);
          return <line key={`spoke-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-zinc-800/50" strokeWidth="2" />;
        })}

        <g className={`transition-transform duration-500 ease-in-out ${activeIdx !== null ? 'scale-110' : ''}`} style={{ transformOrigin: 'center center', filter: activeIdx !== null ? 'url(#sci-glow)' : 'none' }}>
          <polygon points={polygonPath} className="stroke-yellow-500 fill-yellow-500/15" style={{ strokeWidth: '6', strokeLinejoin: 'round' }} />
          <polygon points={polygonPath} className="fill-[url(#data-pulse-grad)] animate-pulse" />
        </g>

        {labels.map((label, i) => {
          const scorePoint = getPoint(i, scores[label]);
          const labelDistFactor = max + 26;
          const labelPoint = getPoint(i, labelDistFactor);
          const isActive = activeIdx === i;

          return (
            <g key={i}>
              <circle cx={labelPoint.x} cy={labelPoint.y} r="60" fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : i)}
                onTouchStart={() => setActiveIdx(i)} />
              
              <g className="pointer-events-none transition-all duration-500 ease-out" transform={isActive ? `translate(${labelPoint.x}, ${labelPoint.y}) scale(1.3) translate(${-labelPoint.x}, ${-labelPoint.y})` : ''}>
                <text x={labelPoint.x} y={labelPoint.y} className={`text-[16px] font-black uppercase tracking-[0.2em] ${isActive ? 'fill-yellow-400' : 'fill-zinc-400'}`} textAnchor="middle" alignmentBaseline="middle" style={{ textShadow: isActive ? '0 0 20px rgba(234, 179, 8, 1)' : 'none' }}>
                  {label}
                </text>
              </g>

              {isActive && (
                <g className="animate-in fade-in zoom-in duration-300 pointer-events-none">
                  {(() => {
                    const midX = (center + labelPoint.x) / 2;
                    const midY = (center + labelPoint.y) / 2;
                    return (
                      <>
                        <line x1={center} y1={center} x2={labelPoint.x} y2={labelPoint.y} className="stroke-yellow-500/40" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx={scorePoint.x} cy={scorePoint.y} r={8} className="fill-yellow-500 shadow-xl shadow-yellow-500" />
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect x="-28" y="-16" width="56" height="32" rx="12" className="fill-zinc-950 stroke-yellow-500" strokeWidth="3" />
                          <text className="fill-yellow-500 font-black text-[18px]" textAnchor="middle" alignmentBaseline="middle">{scores[label]}</text>
                        </g>
                      </>
                    );
                  })()}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-zinc-800 rounded-tl-3xl"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-zinc-800 rounded-br-3xl"></div>
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
  onNavigateResumeScorer: () => void;
  persistedData: {
    result: CareerPathResponse | null;
    scores: PersonalityTraitScores;
    dnaCode: string;
    userType: 'experienced' | 'fresher' | null;
    resumeData: { data: string, mimeType: string } | string | null;
  };
  setPersistedData: {
    setResult: (res: CareerPathResponse | null) => void;
    setScores: (scores: PersonalityTraitScores) => void;
    setDnaCode: (code: string) => void;
    setUserType: (type: 'experienced' | 'fresher' | null) => void;
    setResumeData: (data: { data: string, mimeType: string } | string | null) => void;
  };
}

const CareerPath: React.FC<CareerPathProps> = ({ 
  userCredits, userLocation, userSymbol = '$', onUse, onNavigatePricing, onSaveHistory, onVerifyLocation, isVerifyingLocation, onSetManualLocation, onNavigateResumeScorer,
  persistedData, setPersistedData
}) => {
  const { result, scores, dnaCode, userType, resumeData } = persistedData;
  const { setResult, setScores, setDnaCode, setUserType, setResumeData } = setPersistedData;

  const [currentStep, setCurrentStep] = useState(result ? 6 : -1); 
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [manualCity, setManualCity] = useState('');

  const [activeStrategyIdx, setActiveStrategyIdx] = useState<number | null>(null);
  const [strategyInputs, setStrategyInputs] = useState({ budget: '', months: '', hours: '' });
  const [strategyResults, setStrategyResults] = useState<Record<number, string>>({});
  const [insightResults, setInsightResults] = useState<Record<number, string>>({});
  const [subLoading, setSubLoading] = useState<Record<string, boolean>>({});
  const [subLoadingProgress, setSubLoadingProgress] = useState<Record<string, number>>({});

  const resultRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + (Math.random() * 0.6 + 0.3); 
          return next > 99 ? 99 : next;
        });
        setAnalysisStep(p => (p < ANALYSIS_STEPS.length - 1 && loadingProgress > (p + 1) * 19 ? p + 1 : p));
      }, 150);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingProgress]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const generateDnaCode = (currentScores: PersonalityTraitScores) => {
    const codes = Object.entries(currentScores).map(([k, v]) => `${k[0].toUpperCase()}${v}`).join('');
    setDnaCode(`KRYP-${codes}`);
  };

  const handlePredict = async () => {
    const locationToUse = userLocation || 'GLOBAL';
    const cost = userType === 'experienced' ? 35 : 25;
    if (userCredits < cost) { onNavigatePricing(); return; }
    setLoading(true);
    generateDnaCode(scores);
    
    setTimeout(() => {
      loaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const response = await predictCareerPaths(scores, locationToUse, userType || 'fresher', resumeData as any);
      if (!response.refused) onUse(cost);
      setLoadingProgress(100);
      setResult(response);
      setCurrentStep(6);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 800);
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
    const nextScores = { ...scores };
    Object.entries(traits).forEach(([k, v]) => { nextScores[k as keyof PersonalityTraitScores] += (v || 0); });
    setScores(nextScores);
    
    if (currentStep < 5) setCurrentStep(p => p + 1);
    else handlePredict();
  };

  const unlockStrategy = async (idx: number, role: string) => {
    if (userCredits < 10) { onNavigatePricing(); return; }
    const key = `strat-${idx}`;
    setSubLoading(prev => ({ ...prev, [key]: true }));
    setSubLoadingProgress(prev => ({ ...prev, [key]: 0 }));
    
    const progressInterval = setInterval(() => {
      setSubLoadingProgress(prev => ({
        ...prev,
        [key]: Math.min(99, (prev[key] || 0) + (Math.random() * 1.2 + 0.2)) 
      }));
    }, 250);

    try {
      const strategy = await generateCareerStrategy(role, strategyInputs, userSymbol, resumeData as any);
      onUse(10);
      setSubLoadingProgress(prev => ({ ...prev, [key]: 100 }));
      setStrategyResults(prev => ({ ...prev, [idx]: strategy }));
      setActiveStrategyIdx(null);
      
      setTimeout(() => {
        document.getElementById(`strat-result-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setSubLoading(prev => ({ ...prev, [key]: false })), 800);
    }
  };

  const unlockInsights = async (idx: number, role: string) => {
    if (userCredits < 10) { onNavigatePricing(); return; }
    const key = `insight-${idx}`;
    setSubLoading(prev => ({ ...prev, [key]: true }));
    setSubLoadingProgress(prev => ({ ...prev, [key]: 0 }));
    
    const progressInterval = setInterval(() => {
      setSubLoadingProgress(prev => ({
        ...prev,
        [key]: Math.min(99, (prev[key] || 0) + (Math.random() * 1.2 + 0.2)) 
      }));
    }, 250);

    try {
      const insight = await generateMarketIntelligence(role, userLocation || 'GLOBAL', userSymbol, resumeData as any);
      onUse(10);
      setSubLoadingProgress(prev => ({ ...prev, [key]: 100 }));
      setInsightResults(prev => ({ ...prev, [idx]: insight }));

      setTimeout(() => {
        document.getElementById(`insight-result-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setSubLoading(prev => ({ ...prev, [key]: false })), 800);
    }
  };

  const handleSaveToVault = (type: 'strategy' | 'market-insight', idx: number, role: string) => {
    const content = type === 'strategy' ? strategyResults[idx] : insightResults[idx];
    if (!content) return;
    
    onSaveHistory({
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `${type === 'strategy' ? 'Strategy' : 'Insights'}: ${role}`,
      date: new Date().toLocaleDateString(),
      inputs: { role, location: userLocation || 'UNSPECIFIED' },
      result: content
    });
    alert(`${type === 'strategy' ? 'Strategy' : 'Insights'} archived in vault.`);
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(-1);
    setUserType(null);
    setResumeData(null);
    setStrategyResults({});
    setInsightResults({});
    setScores({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const questions = userType === 'experienced' ? EXPERIENCED_QUESTIONS : FRESHER_QUESTIONS;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 pb-40 text-[13px]">
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
          Career DNA Sequence
        </div>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-zinc-100">
          Career <span className="gold-text-gradient">DNA Mapping</span>
        </h2>
        
        {currentStep < 6 && !loading && (
          <div className="max-w-2xl mx-auto p-1 bg-zinc-900/40 border border-zinc-800 rounded-[40px] shadow-3xl overflow-hidden relative">
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
                    {isVerifyingLocation ? <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div> : "Auto-Detect"}
                  </button>
               </div>
               <div className="flex flex-col sm:flex-row gap-3">
                 <input type="text" value={manualCity} onChange={(e) => setManualCity(e.target.value)} placeholder="ENTER TARGET LOCATION (e.g. LONDON, UK)" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[20px] px-5 py-4 text-[10px] text-zinc-100 uppercase font-black tracking-widest focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700 w-full" />
                 <button onClick={() => { onSetManualLocation(manualCity); setManualCity(''); }} disabled={!manualCity.trim()} className="w-full sm:w-auto px-6 py-4 bg-zinc-800 text-zinc-300 rounded-[20px] text-[9px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all active:scale-95">Lock Geography</button>
               </div>
               {userLocation && (
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-center gap-2 animate-in zoom-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Targeting Corridor: <span className="text-zinc-100">{userLocation}</span></p>
                  </div>
               )}
             </div>
          </div>
        )}
      </div>

      {!loading && currentStep < 6 && (
        <div className="max-w-4xl mx-auto">
          {currentStep === -1 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                <button onClick={() => { setUserType('experienced'); setCurrentStep(0); }} className="bg-[#0c0c0e] border border-zinc-800 p-10 rounded-[48px] text-center hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
                   <div className="absolute inset-0 bg-yellow-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <ExperiencedIllustration />
                   <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Experienced</h3>
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Strategic Pivot • Growth Mapping</p>
                   <div className="mt-8 px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[8px] font-black uppercase tracking-widest">35 Credits</div>
                </button>
                <button onClick={() => { setUserType('fresher'); setCurrentStep(1); }} className="bg-[#0c0c0e] border border-zinc-800 p-10 rounded-[48px] text-center hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <FresherIllustration />
                   <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Fresher</h3>
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Academic Analysis • Potential Mapping</p>
                   <div className="mt-8 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[8px] font-black uppercase tracking-widest">25 Credits</div>
                </button>
             </div>
          ) : userType === 'experienced' && currentStep === 0 ? (
            <div className="max-w-2xl mx-auto p-10 bg-[#0c0c0e] border-2 border-dashed border-zinc-800 rounded-[48px] text-center space-y-8">
               <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
               </div>
               <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">Asset Integration</h3>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Upload your resume to enrich the sequence.</p>
               <input type="file" id="resume-dna" className="hidden" onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} accept=".pdf,.docx" />
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
               <h3 className="text-2xl font-black text-center text-zinc-100 uppercase leading-tight tracking-tight">{questions[currentStep - 1].text}</h3>
               <div className="space-y-3">
                 {questions[currentStep - 1].options.map((opt, i) => (
                   <button key={i} onClick={() => handleOptionSelect(opt.traits)} className="w-full p-6 bg-[#0c0c0e] border border-zinc-800 rounded-[24px] text-left hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group flex items-center justify-between">
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
        <div ref={loaderRef} className="text-center py-32 space-y-12">
          <div className="relative w-48 h-12 mx-auto bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden shadow-2xl">
             <div className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" style={{ width: `${loadingProgress}%` }}></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
             </div>
          </div>
          <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{ANALYSIS_STEPS[analysisStep]}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
            <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
            <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {result && !loading && currentStep === 6 && (
        <div ref={resultRef} className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
             <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-10 shadow-3xl flex flex-col items-center group">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-12">Neural Identity Sequence</h3>
                <RadarChart scores={scores} />
                
                <div className="mt-20 w-full flex flex-col items-center gap-4">
                   <div className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-center shadow-lg">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">DNA Code</p>
                      <p className="text-[9px] font-black text-yellow-500 tracking-[0.2em]">{dnaCode}</p>
                   </div>
                   
                   <div className="max-w-[280px] p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Archetype</p>
                      <p className="text-[11px] font-bold text-zinc-100 uppercase">{result.personaSummary}</p>
                   </div>
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-2">
                   <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">Ideal Role Alignment</span>
                   <h3 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">Market <span className="gold-text-gradient">Recommendations</span></h3>
                </div>
                
                <div className="space-y-4">
                   {result.careers.map((career, i) => (
                     <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-8 space-y-6 hover:border-yellow-500/30 transition-all group">
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight">{career.title}</h4>
                              <div className="flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                 <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{career.matchPercentage}% Alignment</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Est. Comp</p>
                              <p className="text-sm font-black text-zinc-100">{career.salaryExpectation}</p>
                           </div>
                        </div>
                        
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{career.reason}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <button onClick={() => { setActiveStrategyIdx(i); setStrategyResults({}); }} className="py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-yellow-500/30 transition-all">Strategic Roadmap</button>
                           <button onClick={() => unlockInsights(i, career.title)} className="py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-blue-500/30 transition-all">Market Intel</button>
                        </div>

                        {/* Strategy Selection Overlay */}
                        {activeStrategyIdx === i && (
                          <div className="mt-6 p-6 bg-zinc-900/50 border border-yellow-500/20 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
                             <div className="flex justify-between items-center">
                                <h5 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Blueprint Parameters</h5>
                                <button onClick={() => setActiveStrategyIdx(null)} className="text-zinc-600 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                             </div>
                             <div className="grid grid-cols-3 gap-3">
                                <input type="number" placeholder="BUDGET" value={strategyInputs.budget} onChange={e => setStrategyInputs({...strategyInputs, budget: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[10px] font-black text-zinc-100 text-center outline-none focus:border-yellow-500/40" />
                                <input type="number" placeholder="MONTHS" value={strategyInputs.months} onChange={e => setStrategyInputs({...strategyInputs, months: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[10px] font-black text-zinc-100 text-center outline-none focus:border-yellow-500/40" />
                                <input type="number" placeholder="HRS/DAY" value={strategyInputs.hours} onChange={e => setStrategyInputs({...strategyInputs, hours: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[10px] font-black text-zinc-100 text-center outline-none focus:border-yellow-500/40" />
                             </div>
                             <button onClick={() => unlockStrategy(i, career.title)} className="w-full py-4 bg-yellow-500 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400">Unlock Strategy (10 Cr.)</button>
                          </div>
                        )}

                        {/* Strategy Result */}
                        {strategyResults[i] && (
                           <div id={`strat-result-${i}`} className="mt-6 p-8 bg-zinc-900/50 border border-yellow-500/20 rounded-3xl space-y-6 animate-in fade-in">
                              <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Strategic Execution Blueprint</h5>
                                 <button onClick={() => handleSaveToVault('strategy', i, career.title)} className="text-[9px] font-black text-zinc-500 hover:text-yellow-500 uppercase">Save to Vault</button>
                              </div>
                              <div className="prose-krypto prose-sm text-zinc-300"><ReactMarkdown>{strategyResults[i]}</ReactMarkdown></div>
                           </div>
                        )}

                        {/* Market Intel Result */}
                        {insightResults[i] && (
                           <div id={`insight-result-${i}`} className="mt-6 p-8 bg-zinc-900/50 border border-blue-500/20 rounded-3xl space-y-6 animate-in fade-in">
                              <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Market Topography Insights</h5>
                                 <button onClick={() => handleSaveToVault('market-insight', i, career.title)} className="text-[9px] font-black text-zinc-500 hover:text-blue-400 uppercase">Save to Vault</button>
                              </div>
                              <div className="prose-krypto prose-sm text-zinc-300"><ReactMarkdown>{insightResults[i]}</ReactMarkdown></div>
                           </div>
                        )}

                        {/* Sub-loading state */}
                        {(subLoading[`strat-${i}`] || subLoading[`insight-${i}`]) && (
                           <div className="mt-6 p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col items-center gap-4 animate-in fade-in">
                              <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Synthesizing Protocol: {Math.round(subLoading[`strat-${i}`] ? subLoadingProgress[`strat-${i}`] : subLoadingProgress[`insight-${i}`])}%</p>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="pt-20 text-center">
             <button onClick={handleReset} className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-100 transition-all">New DNA Sequence</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;