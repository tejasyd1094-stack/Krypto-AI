import React from 'react';

const InterviewLabAttributes: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-1000 text-left">
      <div className="space-y-6 text-left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Simulation Lab • Deep Dive
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-100 leading-tight text-left">
          Interview <span className="gold-text-gradient">Simulator</span> <br /> Performance Lab
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed uppercase tracking-widest text-left">
          Battle-test responses in specific high-stakes technical and behavioral environments.
        </p>
      </div>

      <div className="space-y-12 text-left">
        <div className="space-y-6 max-w-3xl text-left">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Feature 01 • Environmental Calibration</span>
          <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight text-left">Simulation <span className="gold-text-gradient">Protocol</span></h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium text-left">
            Battle-test your composure in a simulated high-stakes environment. Calibrating the session protocol and complexity vector ensures you eliminate anxiety and perfect your responses through exposure to elite-level technical inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
          <div className="p-8 bg-zinc-950 rounded-[48px] space-y-8 shadow-3xl text-left">
              <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left">Session Protocol</p>
                  <div className="p-5 bg-zinc-900 rounded-2xl font-black text-white flex justify-between items-center text-[11px] tracking-[0.3em] uppercase">
                    BEHAVIORAL 
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>
               <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left">Complexity Vector</p>
                  <div className="p-5 bg-zinc-900 rounded-2xl font-black text-white flex justify-between items-center text-[11px] tracking-[0.3em] uppercase">
                    STANDARD 
                    <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>
          </div>
          <div className="aspect-video rounded-[64px] bg-[#0c0c0e] shadow-3xl relative overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto animate-pulse">
                    <svg className="w-10 h-10 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                 </div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Neural Simulation Layer v3.0</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLabAttributes;