
import React, { useState, useEffect, useRef } from 'react';
import { predictCareerPaths } from '../services/geminiService';
import { CareerPathResponse, PersonalityTraitScores, QuizQuestion, HistoryItem } from '../types';
import ReactMarkdown from 'react-markdown';
// Fix: Import KryptoLogo component from Branding
import { KryptoLogo } from './Branding';

const ANALYSIS_STEPS = [
  "Triangulating personality vectors...",
  "Cross-referencing global talent shifts...",
  "Detecting local market signals...",
  "Pinpointing city topography & hubs...",
  "Running salary parity analysis...",
  "Finalizing professional blueprint..."
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "When starting a complex new project, what is your first instinct?",
    options: [
      { text: "Break it down into data points and logic flows.", traits: { analytic: 10, investigative: 5 } },
      { text: "Envision the final aesthetic and creative potential.", traits: { creative: 10 } },
      { text: "Organize the team and delegate initial roles.", traits: { leadership: 10 } },
      { text: "Identify who this project helps and how it impacts people.", traits: { social: 10 } }
    ]
  },
  {
    id: 2,
    text: "Which of these tasks makes you 'lose track of time'?",
    options: [
      { text: "Deep research into a specialized subject.", traits: { investigative: 10, analytic: 5 } },
      { text: "Building or fixing something with your hands.", traits: { practical: 10 } },
      { text: "Mediating a tough conversation between peers.", traits: { social: 10, leadership: 5 } },
      { text: "Brainstorming radical, 'out-of-the-box' ideas.", traits: { creative: 10 } }
    ]
  }
];

const ExperiencedIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="exp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      {/* Structural Shield */}
      <path d="M50 10L85 25V50C85 71.5 70 90.5 50 95C30 90.5 15 71.5 15 50V25L50 10Z" stroke="url(#exp-grad)" strokeWidth="2" fill="#18181b" />
      {/* Upward Growth Arrow */}
      <path d="M50 75V35M50 35L35 50M50 35L65 50" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Strategy Dots */}
      <circle cx="50" cy="22" r="2" fill="#EAB308" />
      <circle cx="35" cy="30" r="2" fill="#EAB308" opacity="0.5" />
      <circle cx="65" cy="30" r="2" fill="#EAB308" opacity="0.5" />
    </svg>
  </div>
);

const FresherIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fresh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Launch Platform */}
      <rect x="25" y="85" width="50" height="4" rx="2" fill="#3f3f46" />
      {/* Potential Rocket */}
      <path d="M50 15C50 15 35 40 35 65C35 75 42 80 50 80C58 80 65 75 65 65C65 40 50 15 50 15Z" fill="#18181b" stroke="url(#fresh-grad)" strokeWidth="2" />
      {/* Ignition Spark */}
      <circle cx="50" cy="50" r="8" fill="url(#fresh-grad)" fillOpacity="0.2" className="animate-pulse" />
      <path d="M50 70V80M40 75L43 80M60 75L57 80" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const CareerPath: React.FC<any> = ({ 
  userCredits, userLocation, onUse, onNavigatePricing, onSaveHistory, onVerifyLocation, isVerifyingLocation, onSetManualLocation
}) => {
  const [userType, setUserType] = useState<'experienced' | 'fresher' | null>(null);
  const [currentStep, setCurrentStep] = useState(-1); 
  const [scores, setScores] = useState<PersonalityTraitScores>({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<CareerPathResponse | null>(null);
  const [manualCity, setManualCity] = useState('');

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => setAnalysisStep(p => (p < ANALYSIS_STEPS.length - 1 ? p + 1 : p)), 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePredict = async () => {
    // Both types set to 25 credits as per user request
    const cost = 25; 
    if (userCredits < cost) { onNavigatePricing(); return; }
    setLoading(true);
    try {
      const response = await predictCareerPaths(scores, userLocation || 'GLOBAL', userType || 'fresher');
      if (!response.refused) onUse(cost);
      setResult(response);
      
      onSaveHistory({
        id: Math.random().toString(36).substr(2, 9),
        type: 'market-insight',
        title: `Career Mapping: ${userType === 'experienced' ? 'Executive' : 'Entry'} Strategy`,
        date: new Date().toLocaleDateString(),
        inputs: { userType: userType || 'fresher', location: userLocation || 'GLOBAL' },
        result: response.personaSummary + "\n\n" + response.careers.map(c => `### ${c.title}\n${c.reason}`).join('\n\n')
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (traits: Partial<PersonalityTraitScores>) => {
    setScores(p => {
      const ns = { ...p };
      Object.entries(traits).forEach(([k, v]) => { ns[k as keyof PersonalityTraitScores] += (v || 0); });
      return ns;
    });
    if (currentStep < QUIZ_QUESTIONS.length - 1) setCurrentStep(p => p + 1);
    else handlePredict();
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(-1);
    setUserType(null);
    setScores({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 pb-40">
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
          Career DNA Protocol
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

      {userLocation && !loading && !result && (
        <div className="max-w-4xl mx-auto space-y-16">
          {currentStep === -1 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                <button 
                  onClick={() => { setUserType('experienced'); setCurrentStep(0); }} 
                  className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[64px] text-center hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden flex flex-col items-center justify-center"
                >
                   <div className="absolute inset-0 bg-yellow-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <ExperiencedIllustration />
                   <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Experienced</h3>
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Strategy • Growth • Pivoting</p>
                   <div className="mt-8 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[9px] font-black uppercase tracking-widest group-hover:bg-yellow-500 group-hover:text-zinc-950 transition-all">
                      Select Experienced Path (25 Cr)
                   </div>
                </button>

                <button 
                  onClick={() => { setUserType('fresher'); setCurrentStep(0); }} 
                  className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[64px] text-center hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all group relative overflow-hidden flex flex-col items-center justify-center"
                >
                   <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <FresherIllustration />
                   <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Fresher</h3>
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Baseline • Potential • Mapping</p>
                   <div className="mt-8 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
                      Select Entry Protocol (25 Cr)
                   </div>
                </button>
             </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-700">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Question {currentStep + 1} / {QUIZ_QUESTIONS.length}</span>
                  <div className="flex gap-1">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div key={i} className={`w-12 h-1.5 rounded-full ${i <= currentStep ? 'bg-yellow-500' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
               </div>
               <h3 className="text-3xl font-black text-center text-zinc-100 uppercase leading-tight tracking-tight">{QUIZ_QUESTIONS[currentStep].text}</h3>
               <div className="space-y-4">
                 {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
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
          <style>{`@keyframes spin-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }`}</style>
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
          <div className="p-16 bg-[#0c0c0e] border border-zinc-800 rounded-[64px] text-center max-w-4xl mx-auto shadow-3xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/5 blur-3xl rounded-full"></div>
             
             <h3 className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.6em] mb-10">Neural Archetype Blueprint</h3>
             <div className="relative z-10">
               <p className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tighter leading-tight italic">
                 "{result.personaSummary}"
               </p>
             </div>
             
             <div className="mt-12 pt-10 border-t border-zinc-900 flex flex-wrap justify-center gap-8">
                <div className="text-center">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Market Parity</p>
                   <p className="text-xl font-black text-zinc-100 uppercase tracking-tight">Verified High</p>
                </div>
                <div className="w-px h-10 bg-zinc-900"></div>
                <div className="text-center">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Growth Signal</p>
                   <p className="text-xl font-black text-zinc-100 uppercase tracking-tight">Expanding</p>
                </div>
             </div>
          </div>

          <div className="space-y-16">
            {result.careers.map((career, idx) => (
              <div key={idx} className="bg-[#0c0c0e] border border-zinc-800 rounded-[64px] p-12 sm:p-20 shadow-3xl space-y-16 relative overflow-hidden group hover:border-zinc-700 transition-all duration-700 border-b-8 border-zinc-900">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/[0.02] rounded-bl-[200px] pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                   <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-none">Match Rank #{idx + 1}</span>
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

                <div className="pt-16 space-y-8 relative z-10">
                   <div className="flex items-center gap-4">
                      <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] whitespace-nowrap">Intelligence Pack Requirements</span>
                      <div className="h-px bg-zinc-900 flex-1"></div>
                   </div>
                   <div className="flex flex-wrap gap-4">
                      {career.requiredSkills.map((s: string, i: number) => (
                        <span key={i} className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-[11px] font-black text-zinc-300 uppercase tracking-widest hover:border-yellow-500/30 transition-all cursor-default">{s}</span>
                      ))}
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
                Start New Mapping Simulation
             </button>
             <p className="mt-6 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">System Ready for New Persona Deployment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
