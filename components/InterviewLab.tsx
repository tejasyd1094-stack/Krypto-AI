import React, { useState, useRef, useEffect } from "react";
import mammoth from "mammoth";
import SimulationFeedbackDashboard from "./SimulationFeedbackDashboard";
import { HistoryItem } from "../types";

const SIMULATION_STEPS = [
  "Scouring Organization Intel...",
  "Analyzing Job Architecture...",
  "Benchmarking Market Bar...",
  "Calibrating Stress Vectors...",
  "Finalizing Simulation Logic...",
];

// Custom Dropdown Component
const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 mb-2 block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase text-zinc-100 focus:outline-none focus:border-yellow-500/50 transition-colors"
      >
        <span>{value.replace("-", " ")}</span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-10 animate-in fade-in slide-in-from-top-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${value === opt ? "bg-yellow-500/10 text-yellow-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`}
            >
              {opt.replace("-", " ")}
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

const InterviewLab: React.FC<InterviewLabProps> = ({
  userCredits,
  userLocation,
  onUse,
  onSaveHistory,
  onNavigatePricing,
  onStartSimulation,
}) => {
  const [inputs, setInputs] = useState({
    company: "",
    website: "",
    role: "",
    type: "behavioral" as "behavioral" | "technical" | "cultural",
    location: userLocation || "",
    difficulty: "standard" as "entry" | "standard" | "stress-test",
  });

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdData, setJdData] = useState<
    string | { data: string; mimeType: string } | null
  >(null);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [jdError, setJdError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormReady = !!(inputs.company && inputs.role);

  useEffect(() => {
    let interval: any;
    if (loading) {
      const progressTarget = 100;
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= progressTarget) return prev;
          const increment = Math.random() * 1.2 + 0.8;
          const next = prev + increment;
          return next > progressTarget ? progressTarget : next;
        });

        setAnalysisStep((p) =>
          p < SIMULATION_STEPS.length - 1 &&
          loadingProgress > (p + 1) * (100 / SIMULATION_STEPS.length)
            ? p + 1
            : p,
        );
      }, 150);
    } else {
      setLoadingProgress(0);
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingProgress]);

  useEffect(() => {
    if (simulationResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [simulationResult]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    setJdError(null);

    try {
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setJdData(mammothResult.value);
      } else if (
        file.type.startsWith("image/") ||
        file.type === "application/pdf"
      ) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartSession = async () => {
    if (userCredits < 50) {
      onNavigatePricing();
      return;
    }
    // Deduct 50 credits for the interview simulation
    const success = onUse(50);
    if (!success) return;

    // Start the new interactive simulation
    onStartSimulation(inputs, typeof jdData === "string" ? jdData : null);
  };

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
          High-precision behavioral and technical battle-testing. We analyze
          company websites and JDs to simulate real-world hiring bars.
        </p>
      </div>

      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl mb-12">
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
                Organization Name
              </label>
              <input
                required
                value={inputs.company}
                onChange={(e) =>
                  setInputs({ ...inputs, company: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800"
                placeholder="e.g. Google"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
                Organization Website (Optional)
              </label>
              <input
                value={inputs.website}
                onChange={(e) =>
                  setInputs({ ...inputs, website: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 font-bold text-zinc-100 placeholder:text-zinc-800"
                placeholder="https://google.com"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
                Target Role / Designation
              </label>
              <input
                required
                value={inputs.role}
                onChange={(e) => setInputs({ ...inputs, role: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800"
                placeholder="e.g. Senior Product Manager"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
                Target Geography
              </label>
              <input
                value={inputs.location}
                onChange={(e) =>
                  setInputs({ ...inputs, location: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm outline-none focus:border-yellow-500/50 uppercase font-bold text-zinc-100 placeholder:text-zinc-800"
                placeholder="e.g. Mumbai, India"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
              Job Description Architecture (Optional but Recommended)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center justify-center gap-4 px-8 py-6 rounded-3xl border-2 border-dashed transition-all ${jdFile ? "border-yellow-500 bg-yellow-500/5 text-yellow-500" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-500"}`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {jdFile
                    ? jdFile.name
                    : "Upload JD Protocol (PDF, DOCX, Image)"}
                </span>
              </button>
              {jdFile && (
                <button
                  type="button"
                  onClick={removeJdFile}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.txt,image/*"
            />
          </div>

          {/* Executive Preparation Tips */}
          <div className="border-t border-zinc-900 pt-8 mt-4">
            <div className="bg-zinc-950 p-6 sm:p-8 rounded-[32px] border border-zinc-900 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">
                  Simple Interview Tips
                </h4>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="flex gap-4 items-start bg-zinc-900/20 border border-zinc-900/40 p-5 rounded-2xl min-w-[280px] sm:min-w-[340px] flex-1 snap-start">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 text-yellow-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499c.3-.721 1.323-.721 1.623 0l2.306 5.517 5.922.415c.78.055 1.09.998.508 1.48L17.5 15.353l1.528 5.823c.2.766-.663 1.393-1.347.962L12 19.32l-5.381 3.018c-.684.43-1.549-.196-1.347-.962L6.8 15.353 2.062 11.233c-.583-.482-.273-1.425.508-1.48l5.922-.415 2.306-5.517z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 mb-1">
                      Answer with Structure (STAR)
                    </h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Structure your answers using the STAR method: describe the
                      Situation, Task, Action, and Result. Integrate metrics
                      (Google's XYZ formula: accomplished X, measured by Y, by
                      doing Z) to prove impact.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-zinc-900/20 border border-zinc-900/40 p-5 rounded-2xl min-w-[280px] sm:min-w-[340px] flex-1 snap-start">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 text-yellow-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 mb-1">
                      Active Listening & Pacing
                    </h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Listen carefully to the full question before formulating
                      your answer. Taking a 2-second silent pause can help you
                      organize a concise response and avoid rambling.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-zinc-900/20 border border-zinc-900/40 p-5 rounded-2xl min-w-[280px] sm:min-w-[340px] flex-1 snap-start">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 text-yellow-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 mb-1">
                      Show, Don't Just Tell
                    </h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Use concrete professional stories rather than speaking in
                      open-ended cliches or subjective statements. Focus on how
                      you personally solved problems.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-zinc-900/20 border border-zinc-900/40 p-5 rounded-2xl min-w-[280px] sm:min-w-[340px] flex-1 snap-start">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 text-yellow-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.009.09.015.18.015.272 0 4.256-4.03 7.728-9 7.728-1.503 0-2.924-.319-4.14-.881L3.75 17.25c-.15.03-.3-.02-.375-.15-.075-.13-.05-.3.05-.41l2.58-2.58C4.78 12.821 4.5 11.458 4.5 10.038c0-4.256 4.03-7.728 9-7.728 4.97 0 9 3.472 9 7.728z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 mb-1">
                      Engage with Curiosity
                    </h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Treat the interview as a collaborative conversation.
                      Prepare 2-3 high-quality questions for the interviewer
                      about their current challenges and goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {jdError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
                  {jdError}
                </p>
              </div>
            )}
          </div>

          {isFormReady && !loading && (
            <div className="pt-10 mt-10 border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-center text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">
                Select Your Protocol
              </h3>
              <div className="max-w-xl mx-auto">
                {/* Simulation Card */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-[40px] p-8 flex flex-col justify-between hover:border-yellow-500/30 transition-all">
                  <div className="space-y-8">
                    <h4 className="text-lg font-black text-yellow-500 uppercase tracking-widest text-center">
                      Interview Simulation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <CustomDropdown
                        label="Session Protocol"
                        options={["behavioral", "technical", "cultural"]}
                        value={inputs.type}
                        onChange={(v) =>
                          setInputs({ ...inputs, type: v as any })
                        }
                      />
                      <CustomDropdown
                        label="Complexity Vector"
                        options={["entry", "standard", "stress-test"]}
                        value={inputs.difficulty}
                        onChange={(v) =>
                          setInputs({ ...inputs, difficulty: v as any })
                        }
                      />
                    </div>

                    {/* Session Protocol Definition Box */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        <span className="font-extrabold uppercase text-yellow-500 tracking-wider text-[11px]">
                          {inputs.type === 'behavioral' && 'Behavioral Session Protocol'}
                          {inputs.type === 'technical' && 'Technical Session Protocol'}
                          {inputs.type === 'cultural' && 'Cultural Fit Session Protocol'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed pl-4">
                        {inputs.type === 'behavioral' && 'Evaluates real-world past scenarios, STAR method structured responses, conflict resolution, leadership under pressure, and decision accountability.'}
                        {inputs.type === 'technical' && 'Evaluates core domain knowledge, system architecture & design, performance trade-offs, debugging frameworks, and engineering problem-solving.'}
                        {inputs.type === 'cultural' && 'Evaluates organizational values alignment, work ethics, team collaboration, cross-functional communication style, and growth mindset.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartSession}
                    disabled={loading}
                    className="w-full mt-10 py-5 bg-yellow-500 text-zinc-950 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-yellow-700"
                  >
                    Initialize Simulation (50 Credits)
                  </button>
                </div>
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
              <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">
                {Math.round(loadingProgress)}%
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">
              {SIMULATION_STEPS[analysisStep]}
            </p>
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
          <SimulationFeedbackDashboard 
            result={simulationResult} 
            company={inputs.company} 
            role={inputs.role} 
            difficulty={inputs.difficulty} 
            location={inputs.location} 
            onRunNewSimulation={() => {
              setSimulationResult(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewLab;
