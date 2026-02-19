import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { getMockInterviewSession, getWorthinessQuestionnaire, generatePersonalizedWorthinessReview } from '../services/geminiService';
import { HistoryItem, WorthinessReviewResponse, WorthinessQuestion } from '../types';

const SIMULATION_STEPS = [
  "Scouring Organization Intel...",
  "Analyzing Job Architecture...",
  "Benchmarking Market Bar...",
  "Calibrating Stress Vectors...",
  "Finalizing Simulation Logic..."
];

const REVIEW_STEPS = [
  "Executing Deep Market Scan...",
  "Identifying Critical Pain Points...",
  "Generating Attitudinal Questionnaire...",
  "Mapping Your Responses...",
  "Simulating Performance Under Stress...",
  "Calculating Personalized Worthiness Index..."
];

// Custom Dropdown Component
const CustomDropdown = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 mb-2 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase text-zinc-100 focus:outline-none focus:border-yellow-500/50 transition-colors"
      >
        <span>{value.replace('-', ' ')}</span>
        <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-10 animate-in fade-in slide-in-from-top-2">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${value === opt ? 'bg-yellow-500/10 text-yellow-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
            >
              {opt.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


interface InterviewLabProps {
  userCredits: number;
  userLocation?: string;
  onUse: (amt: number) => boolean;
  onSaveHistory: (item: HistoryItem) => void;
  onNavigatePricing: () => void;
  onStartSimulation: (inputs: any, jd: string | null) => void;
}

const InterviewLab: React.FC<InterviewLabProps> = ({ userCredits, userLocation, onUse, onSaveHistory, onNavigatePricing, onStartSimulation }) => {
  const [runningProcess, setRunningProcess] = useState<'simulation' | 'review' | null>(null);
  const [inputs, setInputs] = useState({ 
    company: '', 
    website: '',
    role: '', 
    type: 'behavioral' as 'behavioral' | 'technical' | 'cultural' | 'written',
    location: userLocation || '',
    difficulty: 'standard' as 'entry' | 'standard' | 'stress-test'
  });
  
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdData, setJdData] = useState<string | { data: string, mimeType: string } | null>(null);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [worthinessResult, setWorthinessResult] = useState<WorthinessReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [jdError, setJdError] = useState<string | null>(null);
  
  const [reviewStage, setReviewStage] = useState<'form' | 'questions' | 'result'>('form');
  const [worthinessQuestions, setWorthinessQuestions] = useState<WorthinessQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [discoveredPainPoints, setDiscoveredPainPoints] = useState<string>('');

  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLoadingSteps = runningProcess === 'simulation' ? SIMULATION_STEPS : REVIEW_STEPS;
  const isFormReady = !!(inputs.company && inputs.role);

  useEffect(() => {
    let interval: any;
    if (loading) {
      const progressTarget = 100;
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= progressTarget) return prev;
          const increment = (Math.random() * 1.2 + 0.8);
          const next = prev + increment;
          return next > progressTarget ? progressTarget : next;
        });
        const currentSteps = runningProcess === 'review' ? 
          (reviewStage === 'questions' ? REVIEW_STEPS.slice(3) : REVIEW_STEPS.slice(0, 3))
          : SIMULATION_STEPS;
        
        setAnalysisStep(p => (p < currentSteps.length - 1 && loadingProgress > (p + 1) * (100 / currentSteps.length) ? p + 1 : p));
      }, 150);
    } else {
      setLoadingProgress(0);
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingProgress, currentLoadingSteps, reviewStage, runningProcess]);

  useEffect(() => {
    if ((simulationResult || worthinessResult) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [simulationResult, worthinessResult]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    setJdError(null);

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setJdData(mammothResult.value);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        setJdData({ data: base64, mimeType: file.type });
      } else {
        const text = await file.text();
        setJdData(text);
      }
    } catch (err) {
      console.error("JD processing error", err);
      setJdError("Failed to parse document. Please try a different format.");
    }
  };

  const removeJdFile = () => {
    setJdFile(null);
    setJdData(null);
    setJdError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartSession = async () => {
    if (userCredits < 15) { onNavigatePricing(); return; }
    // Start the new interactive simulation
    onStartSimulation(inputs, typeof jdData === 'string' ? jdData : null);
  };

  const handleStartReview = async () => {
    if (userCredits < 10) { onNavigatePricing(); return; }
    
    setRunningProcess('review');
    setLoading(true);
    setJdError(null);
    setWorthinessResult(null);
    setSimulationResult(null);
    setReviewStage('form');

    try {
      const response = await getWorthinessQuestionnaire(inputs, jdData || undefined);
      
      if (response.refused) {
        setWorthinessResult({
          worthinessScore: 0,
          refused: true,
          reviewDetails: response.refusalReason || 'Failed to generate initial scan.'
        });
        setReviewStage('result');
        setLoading(false);
      } else {
        onUse(10);
        setTimeout(() => {
          setLoadingProgress(100);
          setDiscoveredPainPoints(response.painPoints);
          setWorthinessQuestions(response.questions);
          setReviewStage('questions');
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmitQuestionnaire = async () => {
    if (Object.keys(userAnswers).length !== worthinessQuestions?.length) {
        alert("Please answer all questions before proceeding.");
        return;
    }
    if (userCredits < 10) { onNavigatePricing(); return; }

    setLoading(true);
    setRunningProcess('review');
    try {
        const response = await generatePersonalizedWorthinessReview(inputs, discoveredPainPoints, userAnswers);
        setReviewStage('result');

        if (response.refused) {
            setWorthinessResult(response);
            setLoading(false);
        } else {
            onUse(10);
            setWorthinessResult(response);
            onSaveHistory({
                id: Math.random().toString(36).substr(2, 9),
                type: 'worthiness-review',
                title: `Personalized Review: ${inputs.company} (${inputs.role})`,
                date: new Date().toLocaleDateString(),
                inputs: { ...inputs, hasJD: jdFile ? 'Yes' : 'No' } as any,
                result: `Personalized Score: ${response.worthinessScore}\n\n${response.reviewDetails}`
            });
            setTimeout(() => {
                setLoadingProgress(100);
                setLoading(false);
            }, 800);
        }
    } catch (err) {
        console.error(err);
        setReviewStage('result');
        setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const score = worthinessResult?.worthinessScore || 0;
  const scoreColors = score <= 30 ? 'text-red-500 stroke-red-500' : score <= 70 ? 'text-yellow-500 stroke-yellow-500' : 'text-green-500 stroke-green-500';
  const scoreText = score <= 30 ? 'High Risk' : score <= 70 ? 'Proceed Cautiously' : 'High Potential';

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700 text-zinc-100 pb-40">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-yellow-500/20">
          Simulation Lab v3.0 Active
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Interview <span className="gold-text-gradient">Lab</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          High-precision behavioral and technical battle-testing. We analyze company websites and JDs to simulate real-world hiring bars.
        </p>
      </div>

      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl mb-12">
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Organization Name</label>
              <input required value={inputs.company} onChange={e => setInputs({...inputs, company: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Google" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Organization Website (Optional)</label>
              <input value={inputs.website} onChange={e => setInputs({...inputs, website: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="https://google.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role / Designation</label>
              <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Senior Product Manager" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Geography</label>
              <input value={inputs.location} onChange={e => setInputs({...inputs, location: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800" placeholder="e.g. Mumbai, India" />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Job Description Architecture (Optional but Recommended)</label>
             <div className="relative">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-4 px-8 py-6 rounded-3xl border-2 border-dashed transition-all ${jdFile ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-500'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {jdFile ? jdFile.name : 'Upload JD Protocol (PDF, DOCX, Image)'}
                  </span>
                </button>
                {jdFile && (
                   <button type="button" onClick={removeJdFile} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                )}
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,image/*" />
             {jdError && (
               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{jdError}</p>
               </div>
             )}
          </div>
          
          {isFormReady && !loading && reviewStage !== 'questions' && (
            <div className="pt-10 mt-10 border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-center text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">Select Your Protocol</h3>
              <div className={`grid grid-cols-1 ${reviewStage === 'form' ? 'lg:grid-cols-2' : 'lg:grid-cols-1 lg:max-w-lg lg:mx-auto'} gap-8 items-stretch`}>
                
                {/* Simulation Card */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-[40px] p-8 flex flex-col justify-between hover:border-yellow-500/30 transition-all">
                  <div className="space-y-8">
                    <h4 className="text-lg font-black text-yellow-500 uppercase tracking-widest">Interview Simulation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <CustomDropdown
                        label="Session Protocol"
                        options={['behavioral', 'technical', 'cultural', 'written']}
                        value={inputs.type}
                        onChange={(v) => setInputs({...inputs, type: v as any})}
                      />
                      <CustomDropdown
                        label="Complexity Vector"
                        options={['entry', 'standard', 'stress-test']}
                        value={inputs.difficulty}
                        onChange={(v) => setInputs({...inputs, difficulty: v as any})}
                      />
                    </div>
                  </div>
                  <button onClick={handleStartSession} disabled={loading} className="w-full mt-10 py-5 bg-yellow-500 text-zinc-950 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-yellow-700">
                    Initialize Simulation (15 Credits)
                  </button>
                </div>
                
                {/* Worthiness Review Card */}
                {reviewStage === 'form' && (
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-[40px] p-8 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                    <div className="space-y-6">
                      <h4 className="text-lg font-black text-blue-400 uppercase tracking-widest">Personalized Worthiness Review</h4>
                      <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                        A two-stage analysis. First, we scan for real-world challenges. Then, we test your attitude against them to generate a personalized "Go/No-Go" score.
                      </p>
                    </div>
                    <button onClick={handleStartReview} disabled={loading} className="w-full mt-10 py-5 bg-blue-500 text-zinc-100 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-400 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-blue-700">
                      Start Review (10 + 10 Credits)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {reviewStage === 'questions' && worthinessQuestions && !loading && (
            <div className="pt-10 mt-10 border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-center text-xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Personal Calibration Protocol</h3>
              <p className="text-center text-zinc-500 text-sm mb-8 max-w-lg mx-auto">Answer these situational questions. Your responses will be mapped against our intelligence data to generate a score tailored specifically to you.</p>
              <div className="space-y-8">
                {worthinessQuestions.map((q, index) => (
                  <div key={q.id} className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                    <p className="font-bold text-zinc-300 mb-4">{index + 1}. {q.text}</p>
                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <label key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${userAnswers[q.id] === opt ? 'bg-yellow-500/10 border-yellow-500/30' : 'border-zinc-800 hover:bg-zinc-900'}`}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={userAnswers[q.id] === opt}
                            onChange={() => handleAnswerSelect(q.id, opt)}
                            className="w-4 h-4 text-yellow-500 bg-zinc-800 border-zinc-700 focus:ring-yellow-600 ring-offset-zinc-900 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-zinc-400">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <button
                  onClick={handleSubmitQuestionnaire}
                  disabled={Object.keys(userAnswers).length !== worthinessQuestions.length}
                  className="w-full max-w-md py-5 bg-yellow-500 text-zinc-950 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-yellow-700"
                >
                  Calculate Personalized Score (10 Credits)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-32 space-y-12 animate-in fade-in zoom-in duration-500">
          <div className="relative w-48 h-12 mx-auto bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden shadow-2xl">
             <div 
               className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" 
               style={{ width: `${loadingProgress}%` }}
             ></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
             </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{currentLoadingSteps[analysisStep]}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
              <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={resultRef} className="scroll-mt-24">
        {simulationResult && !loading && (
          <div className="bg-[#0c0c0e] border border-yellow-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 text-zinc-100 shadow-3xl">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]"></span>
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400">Simulation Report</h3>
              </div>
              <div className="flex gap-4">
                {inputs.location && <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Localized Intel: {inputs.location}</span>}
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{inputs.difficulty} protocol</span>
              </div>
            </div>
            <div className="prose-krypto text-zinc-300"><ReactMarkdown>{simulationResult}</ReactMarkdown></div>
          </div>
        )}

        {worthinessResult && !loading && reviewStage === 'result' && (
          <div className="bg-[#0c0c0e] border border-blue-500/20 rounded-[56px] p-10 sm:p-16 animate-in slide-in-from-bottom-8 text-zinc-100 shadow-3xl">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
                <h3 className="text-xl font-black uppercase tracking-widest text-zinc-100">Personalized Worthiness <span className="text-blue-400">Report</span></h3>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Go / No-Go Signal</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-12">
              <div className="lg:col-span-1 flex flex-col items-center text-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900 fill-none" strokeWidth="8" />
                    <circle cx="50%" cy="50%" r={radius} className={`fill-none transition-all duration-1500 ease-out ${scoreColors}`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference - (score / 100) * circumference} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-5xl font-black tracking-tighter ${scoreColors}`}>{score}</span>
                  </div>
                </div>
                <p className={`mt-4 text-sm font-black uppercase tracking-[0.2em] ${scoreColors}`}>{scoreText}</p>
              </div>
              <div className="lg:col-span-2">
                <div className="prose-krypto text-zinc-300">
                  <ReactMarkdown>{worthinessResult.reviewDetails}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewLab;