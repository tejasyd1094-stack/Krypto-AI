import React from 'react';
import { KryptoLogo } from '../Branding';

const OutreachLabAttributes: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-1000 text-left">
      <div className="space-y-6 text-left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em]">
          Outreach Suite • Deep Dive
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-100 leading-tight text-left">
          Conversation <span className="gold-text-gradient">Forge</span> <br /> Hyper-Personalization
        </h2>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed uppercase tracking-widest text-left">
          High-conversion protocols for cold networking. Reaching decision-makers with high-status narratives.
        </p>
      </div>

      <div className="bg-zinc-900/30 rounded-[80px] p-10 sm:p-20 space-y-16 text-left">
          <div className="max-w-3xl text-left">
            <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em]">Feature 01 • Dynamic Engagement Logic</span>
            <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight mt-4 text-left">Conversation Forge <span className="gold-text-gradient">Protocol</span></h3>
            <p className="text-zinc-500 text-base leading-relaxed font-medium mt-4 text-left">
              Break through the noise of standard networking with hyper-personalized engagement logic. Our engine identifies recent company milestones to craft high-status narratives that virtually guarantee a reply from decision-makers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 text-left">
              <div className="flex flex-col sm:flex-row items-start gap-8 group text-left">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-950 flex items-center justify-center flex-shrink-0 shadow-2xl transition-all">
                      <KryptoLogo size={32} />
                  </div>
                  <div className="bg-[#0c0c0e] p-10 rounded-[48px] rounded-tl-none flex-1 space-y-8 shadow-3xl text-left">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                        <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.3em]">AI Outreach Protocol Generated</p>
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full">94% Probability</span>
                      </div>
                      <p className="text-zinc-300 text-xl leading-relaxed italic font-medium text-left">
                        "Hi Jensen, I noticed NVIDIA's recent advancement in Blackwell architecture—it's a massive leap for real-time generative physics. Having architected similar high-throughput systems at scale, I'm particularly interested in how your team is navigating the memory bandwidth constraints..."
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-yellow-500/5 border-l-4 border-yellow-500 rounded-r-2xl text-left">
                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1 text-left">Strategic Hook Detection</p>
                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed text-left">System identified current company milestone via real-time Google Search Study of NVIDIA Q3 earnings report.</p>
                        </div>
                        <div className="p-4 bg-blue-500/5 border-l-4 border-blue-400 rounded-r-2xl text-left">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-left">Narrative Tone</p>
                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed text-left">Executive-level technical discourse. Designed to signal domain authority immediately.</p>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
         {[
           { t: "94% engagement", d: "Statistically higher response rate than standard DMs.", i: "Engagement" },
           { t: "Real-time intel", d: "Uses current company news for every generated hook.", i: "Intelligence" },
           { t: "High-Status Tone", d: "Calibrated to sound like a peer, not a solicitor.", i: "Narrative" }
         ].map((item, idx) => (
           <div key={idx} className="p-10 bg-zinc-950 rounded-[48px] space-y-6 transition-all text-left">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] text-left">{item.i}</span>
              <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight text-left">{item.t}</h4>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed text-left">{item.d}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default OutreachLabAttributes;