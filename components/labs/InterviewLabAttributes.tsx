import React from 'react';
import { KryptoLogo } from '../Branding';

const InterviewLabAttributes: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-1000 text-left">
      {/* Header Section */}
      <div className="space-y-6 text-left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Simulation Lab • Deep Dive & Attributes
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-100 leading-tight text-left">
          Interview <span className="gold-text-gradient">Simulator</span> <br /> Performance & Feedback Lab
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed uppercase tracking-widest text-left">
          Battle-test responses in high-stakes environments and receive comprehensive, actionable feedback reports.
        </p>
      </div>

      {/* Feature 01: Environmental Calibration */}
      <div className="space-y-12 text-left">
        <div className="space-y-6 max-w-3xl text-left">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Feature 01 • Environmental Calibration</span>
          <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight text-left">Simulation <span className="gold-text-gradient">Protocol</span></h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Battle-test your composure in a simulated high-stakes environment. Calibrating the session protocol and complexity vector ensures you eliminate anxiety and perfect your responses through exposure to elite-level technical inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
          <div className="p-8 bg-zinc-950 rounded-[48px] space-y-8 shadow-3xl text-left border border-zinc-800/80">
              <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left">Session Protocol</p>
                  <div className="p-5 bg-zinc-900 rounded-2xl font-black text-white flex justify-between items-center text-[11px] tracking-[0.3em] uppercase border border-zinc-800">
                    BEHAVIORAL & TECHNICAL
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>
               <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left">Complexity Vector</p>
                  <div className="p-5 bg-zinc-900 rounded-2xl font-black text-white flex justify-between items-center text-[11px] tracking-[0.3em] uppercase border border-zinc-800">
                    STRESS-TEST / EXECUTIVE 
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>
          </div>
          <div className="aspect-video rounded-[48px] bg-[#0c0c0e] border border-zinc-800 shadow-3xl relative overflow-hidden flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 rounded-full bg-zinc-900 border border-yellow-500/30 flex items-center justify-center mx-auto animate-pulse">
                    <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                 </div>
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em]">Neural Simulation Layer v3.0</p>
                 <p className="text-xs text-zinc-400 font-medium max-w-sm">Simulates real interviewer pushback, STAR method verification, and conversational rhythm.</p>
              </div>
          </div>
        </div>
      </div>

      {/* Feature 02: Live Screenshot of Actual Interview Feedback Report */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-[64px] p-8 sm:p-16 space-y-12 text-left">
        <div className="max-w-3xl text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Report Screenshot • Actual Output
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight text-left">
            Executive <span className="gold-text-gradient">Interview Feedback</span> Audit Report
          </h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Below is an authentic live preview screenshot of the comprehensive interview feedback report generated at the end of every simulation. Users receive instant, multi-metric scoring, STAR framework breakdown, and actionable coaching directives.
          </p>
        </div>

        {/* Live UI Screenshot Mockup Box */}
        <div className="bg-zinc-950 border border-yellow-500/30 rounded-[36px] p-6 sm:p-10 shadow-3xl space-y-8 relative overflow-hidden">
          {/* Top Banner indicating Live Screenshot */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <KryptoLogo size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em]">Live Screenshot Preview</span>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">Krypto AI — Interview Performance Audit</h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                STRONG HIRE • TOP 10%
              </span>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-yellow-400 text-[11px] font-mono font-black rounded-full">
                Score: 92 / 100
              </span>
            </div>
          </div>

          {/* Metric Cards Grid inside Feedback Report */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">STAR Impact</span>
                <span className="text-emerald-400 font-mono font-bold">95/100</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-emerald-400 h-full w-[95%]" />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">Quantified XYZ metrics clearly articulated.</p>
            </div>

            <div className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Technical Precision</span>
                <span className="text-yellow-400 font-mono font-bold">90/100</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-cyan-400 h-full w-[90%]" />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">Solid architectural and trade-off depth.</p>
            </div>

            <div className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Delivery & Fluency</span>
                <span className="text-emerald-400 font-mono font-bold">94/100</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full w-[94%]" />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">High composure under stress-test pushback.</p>
            </div>
          </div>

          {/* Detailed Audit Breakdown (Strengths & Directives) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
              <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Key Interview Strengths
              </h5>
              <ul className="space-y-1.5 text-zinc-300 text-[11px] font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Effective STAR method structure: Situation → Task → Action → Quantified Result.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Strong leadership signaling when describing cross-functional alignment.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
              <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Targeted Growth Vectors
              </h5>
              <ul className="space-y-1.5 text-zinc-300 text-[11px] font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Elaborate further on system scalability constraints before stating final numbers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Maintain consistent cadence when responding to sudden follow-up questions.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actionable Executive Directive Box */}
          <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Interviewer Executive Note</span>
            <p className="text-zinc-300 text-xs italic font-medium leading-relaxed">
              "Candidate displayed exceptional clarity and domain mastery. Quantified results (e.g. 45% latency reduction) were delivered naturally. Highly recommended for Senior Engineering / Product Leadership tracks."
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-900">
            <span>Live Generated Output • Available Immediately Post-Simulation</span>
            <span className="text-yellow-500">Includes PDF Export & Detailed Coaching Plan</span>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { t: "Live Feedback Screenshot", d: "Users can view full, instant PDF-exportable feedback reports following every interview simulation.", i: "Actual Report" },
          { t: "Multi-Metric Scoring", d: "Evaluation across STAR methodology, domain knowledge, and vocal confidence.", i: "Analytics" },
          { t: "Actionable Directives", d: "Specific bullet-point feedback on how to turn answers into offer-winning narratives.", i: "Coaching" }
        ].map((item, idx) => (
          <div key={idx} className="p-10 bg-zinc-950 rounded-[48px] space-y-6 transition-all text-left border border-zinc-800/80 hover:border-yellow-500/30">
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.5em] text-left">{item.i}</span>
            <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight text-left">{item.t}</h4>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed text-left">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewLabAttributes;
