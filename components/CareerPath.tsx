
import React, { useState, useEffect, useRef } from 'react';
import { predictCareerPaths } from '../services/geminiService';
import { CareerPathResponse, PersonalityTraitScores, QuizQuestion, HistoryItem } from '../types';
import ReactMarkdown from 'react-markdown';

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
    const cost = userType === 'experienced' ? 35 : 25;
    if (userCredits < cost) { onNavigatePricing(); return; }
    setLoading(true);
    try {
      const response = await predictCareerPaths(scores, userLocation || 'Global', userType || 'fresher');
      if (!response.refused) onUse(cost);
      setResult(response);
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

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase text-zinc-100">Career <span className="gold-text-gradient">Blueprint</span></h2>
        {!userLocation ? (
          <div className="bg-[#0c0c0e] border border-zinc-800 p-10 rounded-[40px] max-w-2xl mx-auto space-y-6">
             <h3 className="text-xl font-black uppercase text-zinc-100">Verify Local Market Context</h3>
             <button onClick={onVerifyLocation} disabled={isVerifyingLocation} className="w-full py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500 transition-all">
               {isVerifyingLocation ? "Verifying..." : "Enable Location Access"}
             </button>
             <div className="flex gap-4">
               <input type="text" value={manualCity} onChange={(e) => setManualCity(e.target.value)} placeholder="City Name" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-200 uppercase font-black tracking-widest" />
               <button onClick={() => onSetManualLocation(manualCity)} className="px-8 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-700">Set City</button>
             </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full animate-in zoom-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Optimized for {userLocation}</p>
          </div>
        )}
      </div>

      {userLocation && !loading && !result && (
        <div className="max-w-3xl mx-auto space-y-12">
          {currentStep === -1 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => { setUserType('experienced'); setCurrentStep(0); }} className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[40px] text-center hover:border-yellow-500/50 transition-all group">
                   <h3 className="text-2xl font-black text-zinc-100 uppercase group-hover:text-yellow-500 transition-colors">Experienced</h3>
                </button>
                <button onClick={() => { setUserType('fresher'); setCurrentStep(0); }} className="bg-[#0c0c0e] border border-zinc-800 p-12 rounded-[40px] text-center hover:border-yellow-500/50 transition-all group">
                   <h3 className="text-2xl font-black text-zinc-100 uppercase group-hover:text-yellow-500 transition-colors">Fresher</h3>
                </button>
             </div>
          ) : (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
               <h3 className="text-3xl font-black text-center text-zinc-100 uppercase leading-tight">{QUIZ_QUESTIONS[currentStep].text}</h3>
               <div className="space-y-4">
                 {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => (
                   <button key={i} onClick={() => handleOptionSelect(opt.traits)} className="w-full p-8 bg-[#0c0c0e] border border-zinc-800 rounded-[32px] text-left hover:border-yellow-500/50 transition-all group flex items-center justify-between">
                     <span className="text-xl font-black text-zinc-300 group-hover:text-zinc-100 uppercase tracking-tight">{opt.text}</span>
                     <div className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-yellow-500"></div>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-40 animate-pulse">
          <div className="w-32 h-32 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
          <p className="text-2xl font-black text-zinc-100 uppercase tracking-tight">{ANALYSIS_STEPS[analysisStep]}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-12 bg-zinc-900/40 border border-zinc-800 rounded-[56px] text-center max-w-3xl mx-auto shadow-2xl">
             <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-6">Archetype Decoded</h3>
             <p className="text-2xl font-black text-zinc-100 italic">"{result.personaSummary}"</p>
          </div>
          <div className="space-y-16">
            {result.careers.map((career, idx) => (
              <div key={idx} className="bg-[#0c0c0e] border border-zinc-800 rounded-[56px] p-10 sm:p-16 shadow-3xl space-y-12">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                   <div className="space-y-4 flex-1">
                      <h4 className="text-4xl sm:text-6xl font-black text-zinc-100 tracking-tighter uppercase">{career.title} <span className="text-yellow-500">• {career.matchPercentage}%</span></h4>
                      <p className="text-zinc-500 text-lg font-medium leading-relaxed">{career.reason}</p>
                   </div>
                   <div className="bg-zinc-950 p-8 rounded-[40px] border border-zinc-900 flex-shrink-0 text-center space-y-2">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Market Benchmark</span>
                      <span className="text-4xl font-black text-green-500 block">{career.salaryExpectation}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-zinc-900">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block underline decoration-yellow-500/30 underline-offset-8">Local Signals</span>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">{career.localMarketInsights}</p>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block underline decoration-yellow-500/30 underline-offset-8">City Topography</span>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">{career.hubAnalysis}</p>
                   </div>
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block underline decoration-yellow-500/30 underline-offset-8">Salary Analysis</span>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">{career.localSalaryAnalysis}</p>
                   </div>
                </div>

                <div className="pt-10 space-y-6">
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Required Intelligence Pack</span>
                   <div className="flex flex-wrap gap-3">
                      {career.requiredSkills.map((s: string, i: number) => (
                        <span key={i} className="px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] font-bold text-zinc-300 uppercase tracking-tight">{s}</span>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
