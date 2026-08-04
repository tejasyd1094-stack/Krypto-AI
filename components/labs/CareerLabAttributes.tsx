import React, { useState } from 'react';

interface PersonalityTraitScores {
  analytic: number;
  creative: number;
  leadership: number;
  social: number;
  practical: number;
  investigative: number;
}

const RadarChart = ({ scores }: { scores: PersonalityTraitScores }) => {
  const max = 50;
  const size = 500;
  const center = size / 2;
  const r = 170; 
  const labels: (keyof PersonalityTraitScores)[] = ['analytic', 'creative', 'leadership', 'social', 'practical', 'investigative'];

  const getPoint = (i: number, factor: number) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const distance = (factor / max) * r;
    return { x: center + distance * Math.cos(angle), y: center + distance * Math.sin(angle) };
  };

  const points = labels.map((label, i) => getPoint(i, scores[label]));
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center select-none bg-zinc-950/40 rounded-[64px] shadow-inner overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible scale-90 sm:scale-100">
        {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => {
          const gridPoints = labels.map((_, i) => `${getPoint(i, lvl * max).x},${getPoint(i, lvl * max).y}`).join(' ');
          return <polygon key={idx} points={gridPoints} className={`fill-none ${idx === 4 ? 'stroke-zinc-800' : 'stroke-zinc-800/30'}`} strokeWidth="1" />;
        })}
        {labels.map((_, i) => {
          const p = getPoint(i, max);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-zinc-800/50" strokeWidth="1" />;
        })}
        <polygon points={polygonPath} className="stroke-yellow-500 fill-yellow-500/20" style={{ strokeWidth: '4', strokeLinejoin: 'round' }} />
        {labels.map((label, i) => {
          const p = getPoint(i, max + 30);
          return <text key={i} x={p.x} y={p.y} className="text-[14px] font-black uppercase tracking-widest fill-zinc-500" textAnchor="middle" alignmentBaseline="middle">{label}</text>;
        })}
      </svg>
    </div>
  );
};

interface CareerLabAttributesProps {
  onNavigatePricing?: () => void;
}

const CareerLabAttributes: React.FC<CareerLabAttributesProps> = ({ onNavigatePricing }) => {
  const sampleScores: PersonalityTraitScores = { analytic: 40, creative: 25, leadership: 30, social: 45, practical: 10, investigative: 20 };
  const dnaCode = "KRYP-A40C25L30S45P10I20";

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-1000 text-left">
      <div className="space-y-6 text-left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Market Intelligence • Deep Dive
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-100 leading-tight text-left">
          DNA <span className="gold-text-gradient">Mapping</span> <br /> Strategic Topography
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed uppercase tracking-widest text-left">
          Architecting career trajectories around high-yield economic corridors and psychometric vectors.
        </p>
      </div>

      <div className="space-y-12 text-left">
        <div className="space-y-6 max-w-4xl text-left">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Feature 01 • Economic Corridor Mapping</span>
          <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight text-left">Market <span className="gold-text-gradient">Topography</span></h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Architect your career around high-yield economic corridors. We analyze the intersection of regional salary parity, emerging business hubs, and sector-specific demand to identify the precise locations where your skills command the highest premium.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="p-8 bg-zinc-950 rounded-[32px] space-y-6">
             <div className="w-full py-4 bg-zinc-900 text-center rounded-full font-black text-yellow-500 uppercase tracking-[0.2em] text-sm">SAN FRANCISCO, CA</div>
             <div className="flex items-center gap-3 justify-start text-green-500 text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span> 
                Verified High-Velocity Hub
             </div>
          </div>
          <div className="bg-zinc-900/30 rounded-[64px] p-10 flex flex-col justify-center gap-10 text-left">
              <div className="space-y-4 text-left">
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Protocol Calibration</span>
                <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none text-left">Career Path: Protocol Selection</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed italic text-left">
                  Calibrate the AI's logic engine based on your specific career trajectory.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="p-6 bg-zinc-950 rounded-3xl text-center group transition-all">
                    <h5 className="font-black text-base text-white uppercase">EXPERIENCED</h5>
                    <p className="text-[9px] font-bold text-zinc-500 tracking-widest mt-2 uppercase">Strategic Pivot</p>
                 </div>
                 <div className="p-6 bg-zinc-950 rounded-3xl text-center group transition-all">
                    <h5 className="font-black text-base text-white uppercase">FRESHER</h5>
                    <p className="text-[9px] font-bold text-zinc-500 tracking-widest mt-2 uppercase">Potential Mapping</p>
                 </div>
              </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 text-left">
        <div className="space-y-4 text-left">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Feature 02 • Aptitude Fingerprint</span>
          <h3 className="text-3xl sm:text-5xl font-black text-zinc-100 uppercase tracking-tighter text-left">Neural Identity <span className="gold-text-gradient">Sequence</span></h3>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed text-left">
            Capture your professional essence through a proprietary psychometric vector mapping.
          </p>
        </div>
        <div className="max-w-4xl space-y-12 text-left">
            <div className="flex justify-start">
               <RadarChart scores={sampleScores} />
            </div>
            <div className="space-y-6 text-left">
                <div className="px-8 py-4 bg-zinc-950 rounded-3xl inline-block text-lg font-mono text-yellow-500 tracking-[0.3em] shadow-2xl">
                    {dnaCode}
                </div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] text-left">Sequence representing your unique professional architecture.</p>
            </div>
        </div>
      </div>

      {/* Feature 03: High-Probability Job Cards & Role Topography */}
      <div className="space-y-12 text-left pt-8 border-t border-zinc-900">
        <div className="space-y-6 max-w-3xl text-left">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Feature 03 • Algorithmic Role Matching</span>
          <h3 className="text-3xl sm:text-5xl font-black text-zinc-100 uppercase tracking-tighter text-left">
            High-Probability <br /><span className="gold-text-gradient">Job Cards</span>
          </h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Once your DNA sequence is synthesized, Krypto AI instantly computes high-probability job roles aligned with your psychometric vector and regional compensation index. Each Job Card breaks down the match score, target salary parity, required skill vectors, free certification pathways, and actionable growth triggers.
          </p>
        </div>

        {/* Captured Screenshot / Visual Result View of Job Cards */}
        <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-[48px] overflow-hidden shadow-4xl relative">
          {/* Header Bar */}
          <div className="bg-zinc-900/80 px-8 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">RESULT PREVIEW • JOB_CARDS_SYNTHESIS.DNA</span>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6">
              <div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">DNA Sequence Active</span>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight mt-2">Recommended Role Topography</h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">3 Roles Computed</span>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-5 hover:border-yellow-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-black text-white uppercase tracking-tight">Staff AI Solutions Architect</h5>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Enterprise Infrastructure</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                    98% Match
                  </span>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl flex justify-between items-center border border-zinc-900">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Comp Index</span>
                  <span className="text-xs font-black text-yellow-500">$185,000 - $240,000 / yr</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Core Skill Vectors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['PyTorch', 'Distributed Systems', 'Multi-Agent LLMs', 'Cloud Native'].map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-300">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-400 font-medium">
                  <span>✦ Free Course: AWS AI Architect Specialization</span>
                  <span className="text-yellow-500 font-black">High Demand</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-5 hover:border-blue-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-black text-white uppercase tracking-tight">Senior Growth Product Lead</h5>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Scaleup & Monetization</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                    94% Match
                  </span>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl flex justify-between items-center border border-zinc-900">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Comp Index</span>
                  <span className="text-xs font-black text-yellow-500">$160,000 - $210,000 / yr</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Core Skill Vectors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Growth Loops', 'Funnel Optimization', 'SQL Data Analytics', 'A/B Testing'].map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-300">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-400 font-medium">
                  <span>✦ Free Course: Reforge Product Growth Track</span>
                  <span className="text-blue-400 font-black">Fast Velocity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 04: Strategic Roadmap & Market Intel (Pro / Ultra Pro Features) */}
      <div className="space-y-12 text-left pt-8 border-t border-zinc-900">
        <div className="space-y-6 max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest">
            <span>PRO & ULTRA PRO EXCLUSIVE SUITE</span>
          </div>
          <h3 className="text-3xl sm:text-5xl font-black text-zinc-100 uppercase tracking-tighter text-left">
            Strategic Roadmap <br />& <span className="gold-text-gradient">Market Intel</span>
          </h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Elevate your career trajectory with executive-tier diagnostic engines. Pro and Ultra Pro members unlock custom 12-month Strategic Roadmaps and real-time Market Intelligence reports detailing salary parity, local hiring hub density, visa friction indexes, and executive placement strategies.
          </p>
        </div>

        {/* Captured Screenshot / Visual Result View of Pro Features */}
        <div className="w-full max-w-5xl bg-zinc-950 border border-yellow-500/20 rounded-[48px] overflow-hidden shadow-4xl relative">
          {/* Header Bar */}
          <div className="bg-zinc-900/90 px-8 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em]">PRO / ULTRA PRO DIAGNOSTIC PANEL</span>
            </div>
            <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 uppercase tracking-widest">
              Tier: Pro / Ultra Pro
            </span>
          </div>

          <div className="p-8 sm:p-10 space-y-10">
            {/* Strategic Roadmap Preview Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">PRO FEATURE 01</span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">12-Month Strategic Execution Roadmap</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest">
                  Unlocked in Pro / Ultra Pro
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { q: 'Q1', title: 'Resume Velocity', desc: 'Score 85+ on Krypto ATS engine using XYZ formula and keyword alignment.' },
                  { q: 'Q2', title: 'Salary Parity', desc: 'Calibrate comp expectations to top 10% regional market index.' },
                  { q: 'Q3', title: 'Executive Positioning', desc: 'Deploy tailored cold outreach campaigns to VPs & Hiring Directors.' },
                  { q: 'Q4', title: 'Offer Leverage', desc: 'Execute multi-offer negotiation framework for 25%+ comp jump.' }
                ].map((phase, idx) => (
                  <div key={idx} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2 hover:border-yellow-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[10px] font-black text-yellow-500 flex items-center justify-center">{phase.q}</span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase">Phase 0{idx + 1}</span>
                    </div>
                    <h5 className="text-xs font-black text-zinc-200 uppercase tracking-tight pt-1">{phase.title}</h5>
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{phase.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Intel Preview Section */}
            <div className="space-y-6 pt-8 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">PRO FEATURE 02</span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">Real-Time Market Intelligence & Parity Index</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                  Unlocked in Pro / Ultra Pro
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Comp Index Median</span>
                  <span className="text-lg font-black text-green-400">$185,000 /yr</span>
                  <span className="text-[8px] text-zinc-500 font-bold block">+18% above national average</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Visa & Relocation</span>
                  <span className="text-sm font-black text-blue-400 uppercase">Sponsorship High</span>
                  <span className="text-[8px] text-zinc-500 font-bold block">74% employers support</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Local Hub Openings</span>
                  <span className="text-lg font-black text-white">142 Roles</span>
                  <span className="text-[8px] text-zinc-500 font-bold block">Verified active postings</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Hiring Friction</span>
                  <span className="text-sm font-black text-yellow-500 uppercase">Low Barrier</span>
                  <span className="text-[8px] text-zinc-500 font-bold block">Fast 3-week hiring loops</span>
                </div>
              </div>
            </div>

            {/* Basic Plan Upgrade Note */}
            <div className="p-6 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-black text-yellow-500 uppercase tracking-wider">On a Basic or Starter Plan?</p>
                <p className="text-[11px] text-zinc-400 font-medium">Upgrade to Pro or Ultra Pro to generate unlimited Strategic Roadmaps and Market Intel reports.</p>
              </div>
              <button 
                onClick={onNavigatePricing}
                className="px-6 py-3 bg-yellow-500 text-zinc-950 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all shrink-0 cursor-pointer"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerLabAttributes;