import React from 'react';
import { KryptoLogo } from '../Branding';

const AtsLabAttributes: React.FC = () => {
  const score = 62;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-1000 text-left">
      {/* Hero Section */}
      <div className="space-y-6 text-left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em]">
          Architecture Suite • Deep Dive
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-100 leading-tight text-left">
          ATS <span className="gold-text-gradient">Optimizer</span> <br /> Technical Anatomy
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed uppercase tracking-widest text-left">
          Deconstructing the proprietary mechanics behind the most powerful resume re-engineering engine on the market.
        </p>
      </div>

      {/* Feature 1: Recruitment Index */}
      <div className="space-y-12 text-left">
        <div className="space-y-6 max-w-3xl text-left">
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em]">Feature 01 • Algorithmic Validation</span>
          <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight text-left">The Recruitment <br /><span className="gold-text-gradient">Index</span></h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Leverage a multi-dimensional algorithmic audit that quantifies your marketability. Our engine simulates the decision-making patterns of thousands of ATS systems and elite recruiters to verify your asset's competitive standing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-start">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-zinc-950/50 rounded-[64px] shadow-3xl flex items-center justify-center group">
                  <svg className="w-full h-full transform -rotate-90 group-hover:scale-105 transition-transform duration-700">
                      <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-900" strokeWidth="16" fill="none" />
                      <circle
                          cx="50%" cy="50%"
                          r={radius}
                          className={`fill-none stroke-yellow-500 transition-all duration-1500 ease-out`}
                          strokeWidth="16"
                          strokeDasharray={circumference}
                          strokeDashoffset={scoreOffset}
                          strokeLinecap="round"
                      />
                  </svg>
                  <div className={`absolute inset-0 flex items-center justify-center flex-col`}>
                      <span className={`text-6xl font-black tracking-tighter text-yellow-500`}>{score}</span>
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600`}>Score Index</span>
                  </div>
                </div>
            </div>
            <div className="space-y-6">
                 {[
                    { l: 'Impact Quantization', v: 25, color: 'bg-red-500' },
                    { l: 'Keyword Alignment', v: 35, color: 'bg-yellow-500' },
                    { l: 'Recruiter Readability', v: 60, color: 'bg-blue-500' },
                    { l: 'ATS Parsability', v: 72, color: 'bg-purple-500' }
                 ].map((item) => (
                   <div key={item.l} className="space-y-2">
                       <div className="flex justify-between items-baseline">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.l}</p>
                           <p className="text-xs font-black text-zinc-300">{item.v}%</p>
                       </div>
                       <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.v}%` }}></div>
                       </div>
                   </div>
                 ))}
            </div>
        </div>
      </div>

      {/* Feature 2: Impact Engine */}
      <div className="space-y-12 text-left">
        <div className="space-y-6 max-w-3xl text-left">
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em]">Feature 02 • ROI Attribution</span>
          <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight text-left">Impact Quantization <br /><span className="gold-text-gradient">Engine</span></h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Convert passive task descriptions into measurable outcomes that demonstrate immediate ROI. By applying the Google XYZ architectural logic, we ensure every bullet point proves your technical value through data-driven performance indicators.
          </p>
        </div>
        
        {/* NEW ENHANCED BEFORE/AFTER IMAGE-LIKE UI */}
        <div className="w-full max-w-5xl">
            <div className="bg-zinc-950 border border-zinc-800 rounded-[64px] overflow-hidden shadow-4xl relative">
                {/* Decorative UI Header */}
                <div className="bg-zinc-900/80 px-8 py-4 border-b border-zinc-800 flex items-center justify-between">
                   <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                   </div>
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">Protocol: XYZ_TRANSFORM_V4.HEX</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[320px]">
                    {/* RED SIDE: Source Deficiency */}
                    <div className="p-10 bg-red-500/[0.03] border-r border-zinc-800 relative group">
                        <div className="absolute top-6 left-10 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                           <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Source Deficiency</span>
                        </div>
                        <div className="mt-12 space-y-6">
                           <div className="space-y-3">
                              <p className="text-zinc-500 font-mono text-[11px] leading-relaxed select-none opacity-40">
                                [LINT_ERROR]: Descriptive metrics missing.<br />
                                [WARN]: Outcome is purely qualitative.
                              </p>
                              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-red-900/20 shadow-inner">
                                 <p className="text-zinc-400 italic text-sm leading-relaxed">
                                    "Prepares programs requiring a wide variety and over 100 internal processing actions."
                                 </p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <span className="px-2 py-1 bg-red-900/20 rounded text-[7px] text-red-400 font-black uppercase">Passive</span>
                              <span className="px-2 py-1 bg-red-900/20 rounded text-[7px] text-red-400 font-black uppercase">Unquantified</span>
                           </div>
                        </div>
                    </div>

                    {/* GREEN SIDE: Architected Asset */}
                    <div className="p-10 bg-green-500/[0.03] relative">
                        {/* Connecting Arrow Icon */}
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center shadow-2xl">
                           <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </div>

                        <div className="absolute top-6 left-10 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                           <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Architected Asset</span>
                        </div>
                        <div className="mt-12 space-y-6">
                           <div className="space-y-3">
                              <p className="text-zinc-500 font-mono text-[11px] leading-relaxed select-none opacity-40">
                                [XYZ_COMPILED]: Successful.<br />
                                [METRIC_GEN]: ROI identified (+30%).
                              </p>
                              <div className="p-6 bg-zinc-900/80 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/5">
                                 <p className="text-white font-black text-sm uppercase leading-relaxed tracking-tight">
                                    ENGINEERED A <span className="text-yellow-500">MORTGAGE PROCESSING AUTOMATION SCRIPT</span> HANDLING 100+ DAILY ACTIONS, <span className="text-green-400 underline decoration-2 underline-offset-4 font-black">REDUCING MANUAL DATA ENTRY BY 30%</span> USING PYTHON AND SQL.
                                 </p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <span className="px-2 py-1 bg-green-900/20 rounded text-[7px] text-green-400 font-black uppercase">Action-Oriented</span>
                              <span className="px-2 py-1 bg-green-900/20 rounded text-[7px] text-green-400 font-black uppercase">Data-Driven</span>
                              <span className="px-2 py-1 bg-green-900/20 rounded text-[7px] text-green-400 font-black uppercase">ROI Verified</span>
                           </div>
                        </div>
                    </div>
                </div>
                
                {/* Floating Info Tag */}
                <div className="absolute bottom-6 right-10 bg-yellow-500 text-zinc-950 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                    Google XYZ logic tier 1 active
                </div>
            </div>
        </div>
      </div>

      {/* Feature 3: Audit Findings (Now Feature 3) */}
      <div className="bg-zinc-900/30 rounded-[80px] p-10 sm:p-20 space-y-10 text-left">
          <div className="max-w-3xl text-left">
            <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em]">Feature 03 • Precision Diagnostic</span>
            <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight mt-4 text-left">Executive Audit <span className="gold-text-gradient">Findings</span></h3>
            <p className="text-zinc-500 text-base leading-relaxed font-medium mt-4 text-left">
              Identify critical structural vulnerabilities that trigger rejection filters. Our diagnostic engine performs a granular sweep of your document's logic, tone, and hierarchy to meet the high bar of executive-level hiring teams.
            </p>
          </div>
          <div className="bg-black/50 rounded-[40px] p-10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <KryptoLogo size={80} />
             </div>
             <p className="text-zinc-300 font-medium leading-relaxed italic text-lg border-l-4 border-yellow-500 pl-10 text-left">
                "Remove the dual phone number listing; one mobile number is sufficient and cleaner. Eliminate the 'Microsoft Office tools' from the Skills section immediately—it signals technological illiteracy for a Programmer II role. Consider switching to a single-column layout to ensure 100% parsing accuracy across older ATS systems, as the current split layout can sometimes confuse reading order. Remove 'Sample preparation' unless it refers to specific data sampling techniques, then specify the technology. Your summary lacks quantifiable impact; it must be re-engineered to lead with metrics."
             </p>
          </div>
      </div>

      {/* Feature 4: Executive Blueprint */}
      <div className="space-y-12 text-left">
        <div className="space-y-4 text-left">
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em]">Feature 04 • Final Deployment</span>
          <h3 className="text-3xl sm:text-5xl font-black text-zinc-100 uppercase tracking-tighter text-left">Krypto Executive <span className="gold-text-gradient">Blueprint</span></h3>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed text-left">
            Deploy a master-tier career asset engineered for maximum parsability and psychological impact.
          </p>
        </div>
        <div className="max-w-4xl bg-white text-zinc-900 p-10 sm:p-20 rounded-[80px] shadow-3xl text-left">
           <div className="prose prose-slate max-w-none text-left">
              <h1 className="font-black text-2xl mb-0 text-left"><b>JANE DOE</b></h1>
              <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest mt-1 text-left">SENIOR SOFTWARE ENGINEER</h3>
              <div className="my-8 h-px bg-zinc-200"></div>
              <p className="text-base leading-relaxed font-medium text-zinc-700 text-left">Results-driven Senior Software Engineer with 8+ years of experience architecting and deploying scalable backend systems. Proven ability to lead cross-functional teams in agile environments, resulting in a <b>40% reduction</b> in server costs and a <b>15% improvement</b> in application performance. Seeking to leverage expertise in cloud infrastructure and distributed systems to solve complex challenges at a forward-thinking tech company.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AtsLabAttributes;