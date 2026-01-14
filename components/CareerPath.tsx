
import React, { useState, useEffect, useRef } from 'react';
import { predictCareerPaths } from '../services/geminiService';
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
        <linearGradient id="exp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <rect x="25" y="25" width="50" height="50" rx="4" transform="rotate(45 50 50)" stroke="url(#exp-grad)" strokeWidth="2.5" fill="none" />
      <path d="M50 20V80M20 50H80" stroke="url(#exp-grad)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      <circle cx="50" cy="50" r="12" fill="url(#exp-grad)" className="animate-pulse" />
      <path d="M50 38V44M50 56V62M38 50H44M56 50H62" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const FresherIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-700">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
      <defs>
        <linearGradient id="fresh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" stroke="url(#fresh-grad)" strokeWidth="2" strokeDasharray="8 4" fill="none" />
      <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40L50 10Z" fill="url(#fresh-grad)" className="animate-pulse" />
      <circle cx="50" cy="50" r="4" fill="#09090b" />
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
        {/* Subtle Axes Only, No Grids */}
        {labels.map((_, i) => {
          const p = getPoint(i, max);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-zinc-800/40" strokeWidth="1" />;
        })}
        
        {/* Score Polygon - Main Star */}
        <polygon
          points={polygonPath}
          className="fill-yellow-500/15 stroke-yellow-500 animate-in fade-in zoom-in duration-1000 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Accent Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-yellow-500" />
        ))}
        
        {/* Minimalist Labels */}
        {labels.map((label, i) => {
          const p = getPoint(i, max + 20);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              className="text-[9px] font-black uppercase tracking-widest fill-zinc-500"
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

const CareerPath: React.FC<any> = ({ 
  userCredits, userLocation, onUse, onNavigatePricing, onSaveHistory, onVerifyLocation, isVerifyingLocation, onSetManualLocation
}) => {
  const [userType, setUserType] = useState<'experienced' | 'fresher' | null>(null);
  const [currentStep, setCurrentStep] = useState(-1); // -1: Type Select, 0: Resume (if exp), 1-5: Quiz
  const [scores, setScores] = useState<PersonalityTraitScores>({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<CareerPathResponse | null>(null);
  const [resumeData, setResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);
  const [dnaCode, setDnaCode] = useState('');
  const [manualCity, setManualCity] = useState('');

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
      
      onSaveHistory({
        id: Math.random().toString(36).substr(2, 9),
        type: 'market-insight',
        title: `Career Mapping: DNA ${dnaCode}`,
        date: new Date().toLocaleDateString(),
        inputs: { userType: userType || 'fresher', location: userLocation || 'GLOBAL', dna: dnaCode },
        result: response.personaSummary + "\n\n" + response.careers.map(c => `### ${c.title}\n${c.reason}`).join('\n\n')
      });
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
      setCurrentStep(1); // Proceed to quiz
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
    
    if (currentStep < 5) {
      setCurrentStep(p => p + 1);
    } else {
      handlePredict();
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(-1);
    setUserType(null);
    setResumeData(null);
    setScores({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 pb-40">
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
          Career DNA Sequence
        </div>
        <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase text-zinc-100">
          Career <span className="gold-text-gradient">DNA Mapping</span>
        </h2>
        
        {!result && !loading && (
          <div className="max-w-2xl mx-auto p-1 bg-zinc-900/40 border border-zinc-800 rounded-[40px] shadow-3xl overflow-hidden">
             <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
               <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                     <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Market Topography</h3>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                       Detecting local salary parity and business hubs for precise mapping.
                     </p>
                  </div>
                  <button 
                    onClick={onVerifyLocation} 
                    disabled={isVerifyingLocation} 
                    className="w-full sm:w-auto px-6 sm:px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl border-b-4 border-zinc-300 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isVerifyingLocation ? (
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                    Detect City
                  </button>
               </div>

               <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                   type="text" 
                   value={manualCity} 
                   onChange={(e) => setManualCity(e.target.value)} 
                   placeholder="Enter City Name Manually..." 
                   className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[24px] px-6 sm:px-8 py-5 text-[11px] text-zinc-100 uppercase font-black tracking-[0.2em] focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700 w-full" 
                 />
                 <button 
                   onClick={() => onSetManualLocation(manualCity)} 
                   disabled={!manualCity.trim()}
                   className="w-full sm:w-auto px-6 sm:px-10 py-5 bg-zinc-800 text-zinc-300 rounded-[24px] text-[10px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all active:scale-95 disabled:opacity-30 whitespace-nowrap"
                 >
                   Update City
                 </button>
               </div>

               {userLocation && (
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-center gap-3 animate-in zoom-in">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Target City: <span className="text-zinc-100">{userLocation}</span></p>
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
                  className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[64px] text-center hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden flex flex-col items-center justify-center"
                >
                   <div className="absolute inset-0 bg-yellow-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <ExperiencedIllustration />
                   <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Experienced</h3>
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Pivot • Growth Mapping</p>
                   <div className="mt-8 px-6 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[9px] font-black uppercase tracking-widest group-hover:bg-yellow-500 group-hover:text-zinc-950 transition-all">
                      Select Experienced Path (25 Cr)
                   </div>
                </button>

                <button 
                  onClick={() => { setUserType('fresher'); setCurrentStep(1); }} 
                  className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[64px] text-center hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden flex flex-col items-center justify-center"
                >
                   <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <FresherIllustration />
                   <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Fresher</h3>
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Baseline Vectoring • Potential Analysis</p>
                   <div className="mt-8 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
                      Select Entry Protocol (25 Cr)
                   </div>
                </button>
             </div>
          ) : userType === 'experienced' && currentStep === 0 ? (
            <div className="max-w-2xl mx-auto p-12 bg-[#0c0c0e] border-2 border-dashed border-zinc-800 rounded-[56px] text-center space-y-8 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
               </div>
               <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter">Asset Integration</h3>
               <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Inject your resume to enrich the personality sequence.</p>
               <input 
                 type="file" 
                 id="resume-dna" 
                 className="hidden" 
                 onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} 
                 accept=".pdf,.docx"
               />
               <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => document.getElementById('resume-dna')?.click()}
                   className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[28px] font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-xl"
                 >
                   Upload Document
                 </button>
                 <button 
                   onClick={() => setCurrentStep(1)}
                   className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-400 transition-colors"
                 >
                   Skip Integration
                 </button>
               </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-700">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Question {currentStep} / 5</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`w-10 h-1.5 rounded-full ${i <= currentStep ? 'bg-yellow-500' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
               </div>
               <h3 className="text-3xl font-black text-center text-zinc-100 uppercase leading-tight tracking-tight">{QUIZ_QUESTIONS[currentStep - 1].text}</h3>
               <div className="space-y-4">
                 {QUIZ_QUESTIONS[currentStep - 1].options.map((opt, i) => (
                   <button 
                     key={i} 
                     onClick={() => handleOptionSelect(opt.traits)} 
                     className="w-full p-8 bg-[#0c0c0e] border border-zinc-800 rounded-[32px] text-left hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group flex items-center justify-between shadow-xl"
                   >
                     <span className="text-lg font-black text-zinc-300 group-hover:text-zinc-100 uppercase tracking-tight leading-tight">{opt.text}</span>
                     <div className="w-8 h-8 rounded-full border-2 border-zinc-800 group-hover:border-yellow-500 flex items-center justify-center transition-all group-hover:scale-110">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-40 animate-in fade-in duration-1000">
          <div className="relative w-48 h-48 mx-auto mb-16">
             <div className="absolute inset-0 border-4 border-yellow-500/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-8 border-4 border-blue-500/10 rounded-full"></div>
             <div className="absolute inset-8 border-4 border-blue-500 border-b-transparent rounded-full animate-spin-slow"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <KryptoLogo size={64} className="animate-pulse" />
             </div>
          </div>
          <p className="text-3xl font-black text-zinc-100 uppercase tracking-tighter mb-4">{ANALYSIS_STEPS[analysisStep]}</p>
          <div className="flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[64px] p-12 shadow-3xl flex flex-col items-center">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.6em] mb-12">Neural Identity Sequence</h3>
                <RadarChart scores={scores} />
                
                <div className="mt-12 w-full flex flex-col items-center gap-4">
                   <div className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">DNA Access Token</p>
                      <p className="text-lg font-black gold-text-gradient tracking-tighter">{dnaCode}</p>
                   </div>
                   
                   <div className="max-w-xs p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                      <p className="text-[9px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tight">
                        This sequence represents your core professional signature. It maps cross-functional strengths to global high-growth indices.
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-12">
                <div className="p-12 bg-zinc-950 border border-zinc-900 rounded-[56px] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/[0.02] rounded-bl-full pointer-events-none"></div>
                   <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-6">Archetype Decoding</h3>
                   <p className="text-3xl font-black text-zinc-100 tracking-tighter leading-tight italic">
                     "{result.personaSummary}"
                   </p>
                   <div className="mt-8 flex gap-4">
                      <div className="flex-1 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                         <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Dominant Axis</p>
                         <p className="text-xs font-black text-zinc-300 uppercase tracking-tight">
                            {(Object.entries(scores) as [string, number][]).sort((a,b) => b[1]-a[1])[0][0]}
                         </p>
                      </div>
                      <div className="flex-1 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                         <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Secondary Axis</p>
                         <p className="text-xs font-black text-zinc-300 uppercase tracking-tight">
                            {(Object.entries(scores) as [string, number][]).sort((a,b) => b[1]-a[1])[1][0]}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                   <div className="text-center px-6">
                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Market Parity</p>
                      <p className="text-xl font-black text-zinc-100 uppercase">High</p>
                   </div>
                   <div className="w-px h-10 bg-zinc-900 hidden sm:block"></div>
                   <div className="text-center px-6">
                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Hub Saturation</p>
                      <p className="text-xl font-black text-zinc-100 uppercase">Expansion</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-16 pt-12 border-t border-zinc-900">
            <h4 className="text-center text-[11px] font-black text-zinc-600 uppercase tracking-[0.8em] mb-8">Sequenced Professional Paths</h4>
            {result.careers.map((career, idx) => (
              <div key={idx} className="bg-[#0c0c0e] border border-zinc-800 rounded-[64px] p-12 sm:p-20 shadow-3xl space-y-16 relative overflow-hidden group hover:border-zinc-700 transition-all duration-700 border-b-8 border-zinc-900">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/[0.02] rounded-bl-[200px] pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                   <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-none">DNA Compatibility Match #{idx + 1}</span>
                        <div className="h-px bg-zinc-800 flex-1"></div>
                      </div>
                      <h4 className="text-5xl sm:text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none">{career.title} <br /><span className="gold-text-gradient">{career.matchPercentage}% Alignment</span></h4>
                      <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-2xl">{career.reason}</p>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center gap-4">
                     <div className="bg-zinc-950 p-10 rounded-[48px] border border-zinc-900 shadow-2xl text-center min-w-[240px] group-hover:scale-105 transition-transform duration-500 border-b-4 border-green-500/30">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Market Comp Benchmark</span>
                        <span className="text-5xl font-black text-green-500 block tracking-tighter">{career.salaryExpectation}</span>
                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-2 block">Localized to {userLocation}</span>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-zinc-900 relative z-10">
                   <div className="space-y-6 p-8 bg-zinc-950/50 rounded-[40px] border border-zinc-900/50 hover:bg-zinc-950 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         </div>
                         <span className="text-[11px] font-black text-zinc-100 uppercase tracking-widest">Market Signals</span>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed italic border-l-2 border-yellow-500/20 pl-4">"{career.localMarketInsights}"</p>
                   </div>
                   
                   <div className="space-y-6 p-8 bg-zinc-950/50 rounded-[40px] border border-zinc-900/50 hover:bg-zinc-950 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <span className="text-[11px] font-black text-zinc-100 uppercase tracking-widest">Target Topography</span>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed italic border-l-2 border-blue-500/20 pl-4">"{career.hubAnalysis}"</p>
                   </div>

                   <div className="space-y-6 p-8 bg-zinc-950/50 rounded-[40px] border border-zinc-900/50 hover:bg-zinc-950 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <span className="text-[11px] font-black text-zinc-100 uppercase tracking-widest">Comp Analysis</span>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed italic border-l-2 border-green-500/20 pl-4">"{career.localSalaryAnalysis}"</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-zinc-900 relative z-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] whitespace-nowrap">Skill Intelligence Pack</span>
                         <div className="h-px bg-zinc-900 flex-1"></div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                         {career.requiredSkills.map((s: string, i: number) => (
                           <span key={i} className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:border-yellow-500/30 transition-all cursor-default">{s}</span>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] whitespace-nowrap">Certification Roadmap</span>
                         <div className="h-px bg-zinc-900 flex-1"></div>
                      </div>
                      <div className="space-y-4">
                         {career.certifications.length > 0 ? career.certifications.map((cert: string, i: number) => (
                            <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               </div>
                               <div>
                                  <p className="text-[11px] font-black text-zinc-100 uppercase tracking-tight leading-none mb-1">{cert}</p>
                                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Industry Standard Verification</p>
                               </div>
                            </div>
                         )) : (
                           <p className="text-[10px] text-zinc-500 uppercase italic">No specific certifications requested by current market signals.</p>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-10 animate-in slide-in-from-bottom-4 duration-1000">
             <button 
               onClick={handleReset} 
               className="px-12 py-6 bg-zinc-100 text-zinc-950 rounded-[32px] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 active:scale-95 transition-all shadow-3xl border-b-4 border-zinc-300"
             >
                Initialize New Mapping Protocol
             </button>
             <p className="mt-6 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">System Ready for New Persona Deployment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
