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

const CareerLabAttributes: React.FC = () => {
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
    </div>
  );
};

export default CareerLabAttributes;