
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { getCareerAdvice } from '../services/geminiService';
import { KryptoLogo } from './Branding';
import { TabType } from '../types';

interface DashboardProps {
  priority?: boolean;
  userCredits: number;
  onUse: (amount: number) => boolean;
  onNavigatePricing: () => void;
  setActiveTab?: (tab: TabType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ priority, userCredits, onUse, onNavigatePricing, setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCredits < 2) { onNavigatePricing(); return; }
    setLoading(true);
    try {
      const result = await getCareerAdvice(query);
      onUse(2);
      setAdvice(result);
    } catch (error) {
      setAdvice("Error processing query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-32 pb-40">
      <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none text-zinc-100 uppercase">
          Welcome, <br /><span className="gold-text-gradient">Career Architect!</span>
        </h2>
        <p className="text-zinc-500 text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
          The recruitment engine for high-performance professionals. 
          Map your DNA, audit your assets, and dominate the market.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[40px] p-6 flex flex-col sm:flex-row items-center gap-4 focus-within:border-yellow-500/50 focus-within:ring-8 focus-within:ring-yellow-500/5 transition-all shadow-2xl backdrop-blur-xl">
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)} 
              placeholder="Ask Krypto for career strategy..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-zinc-100 text-xl font-medium w-full px-4"
            />
            <button type="submit" disabled={loading || !query.trim()} className="px-10 py-4 bg-yellow-500 text-zinc-950 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-xl">
              {loading ? "Calculating..." : "Execute Strategy (2 Credits)"}
            </button>
          </div>
        </form>
      </div>

      {advice && (
        <div className="max-w-4xl mx-auto p-12 bg-[#0c0c0e] border border-yellow-500/10 rounded-[56px] shadow-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="prose-krypto text-zinc-300 text-lg leading-relaxed"><ReactMarkdown>{advice}</ReactMarkdown></div>
        </div>
      )}

      {/* Feature Previews Section */}
      <div className="space-y-48">
        {/* Resume Scorer Preview */}
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-left-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Architecture Suite</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">ATS <span className="gold-text-gradient">Optimization Lab</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
            <button onClick={() => setActiveTab?.('Resume Scorer')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Start Architecture Audit</button>
          </div>
          <div className="flex-1 w-full max-w-xl bg-[#0c0c0e] border border-zinc-800 rounded-[56px] p-12 shadow-3xl rotate-2 hover:rotate-0 transition-all duration-700 relative group">
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
             <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Neural Score Analysis</span><span className="text-3xl font-black text-zinc-100 tracking-tighter">91%</span></div>
                <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900"><div className="h-full w-[91%] bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div></div>
                <div className="p-6 bg-zinc-950 rounded-[32px] border border-zinc-900 space-y-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Detected Deficiency</p>
                      <p className="text-xs text-zinc-500 italic line-through uppercase">"Helped team grow sales."</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">Architected Solution</p>
                      <p className="text-xs text-zinc-100 font-black uppercase tracking-tight leading-relaxed">"Generated $2.4M in pipeline growth as measured by 18% MoM increase, by implementing lead scoring logic."</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Career DNA Preview */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in slide-in-from-right-8 duration-1000">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Market Intelligence</div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Career <span className="gold-text-gradient">DNA Mapping</span></h4>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">Map personality vectors to global talent shifts. Get deep market signals, city topography, business hub analysis, and precise salary benchmarks.</p>
            <button onClick={() => setActiveTab?.('Career Path')} className="px-10 py-5 bg-zinc-100 text-zinc-950 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl border-b-4 border-zinc-300">Discover Your Path</button>
          </div>
          <div className="flex-1 w-full max-w-xl bg-[#0c0c0e] border border-zinc-800 rounded-[56px] p-12 shadow-3xl -rotate-2 hover:rotate-0 transition-all duration-700">
             <div className="space-y-8 text-center">
                <div className="w-44 h-44 bg-blue-500/5 rounded-full mx-auto border border-blue-500/10 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-blue-500/5 blur-3xl animate-pulse"></div>
                   <KryptoLogo size={80} />
                </div>
                <div className="space-y-4">
                   <p className="text-sm font-black text-zinc-100 uppercase tracking-[0.3em]">GEOGRAPHY: MUMBAI, INDIA</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl">
                         <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Dominant Hub</p>
                         <p className="text-[10px] text-zinc-300 font-bold uppercase">BKC (Financial Dist.)</p>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl">
                         <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Market Signal</p>
                         <p className="text-[10px] text-zinc-300 font-bold uppercase">Strong Growth</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Outreach & Interview Previews (Stacked) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="bg-zinc-900/40 border border-zinc-800 p-12 rounded-[56px] space-y-8 hover:border-yellow-500/30 transition-all group">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h5 className="text-3xl font-black uppercase tracking-tight text-zinc-100">Outreach <br />Architect</h5>
              <p className="text-zinc-500 font-medium leading-relaxed">High-conversion protocols for cold networking. Stop being ignored and start being interviewed.</p>
              <button onClick={() => setActiveTab?.('Outreach Architect')} className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] hover:text-yellow-400 transition-colors">Launch Protocol →</button>
           </div>
           <div className="bg-zinc-900/40 border border-zinc-800 p-12 rounded-[56px] space-y-8 hover:border-blue-500/30 transition-all group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h5 className="text-3xl font-black uppercase tracking-tight text-zinc-100">Interview <br />Simulation Lab</h5>
              <p className="text-zinc-500 font-medium leading-relaxed">Battle-test your responses in specific technical and behavioral environments. Neural feedback on your answers.</p>
              <button onClick={() => setActiveTab?.('Interview Lab')} className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] hover:text-blue-400 transition-colors">Enter Simulation →</button>
           </div>
        </div>
      </div>

      {/* Testimonials / Reviews Section */}
      <div className="pt-32 border-t border-zinc-900">
        <div className="text-center mb-24">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Executive Testimonials</span>
          <h3 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Trusted by <br /><span className="gold-text-gradient">Global Career Architects</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: "Sarah L.", role: "Senior Director @ TechCorp", text: "The XYZ formula alone increased my interview requests by 400%. Krypto is game-changing." },
             { name: "Rajiv M.", role: "VP of Engineering", text: "The city-specific topography insights pinpointed exactly where I needed to network. Incredible precision." },
             { name: "Elena K.", role: "Product Strategist", text: "Outreach messages that actually convert. I landed my current role using the Architect's Bold protocol." }
           ].map((r, i) => (
             <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[48px] space-y-8 hover:bg-zinc-900/60 transition-all">
                <div className="flex text-yellow-500 gap-1">{'★★★★★'.split('').map((s, idx) => <span key={idx}>{s}</span>)}</div>
                <p className="text-zinc-400 text-base italic font-medium leading-relaxed">"{r.text}"</p>
                <div className="pt-6 border-t border-zinc-800 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-[10px] text-zinc-500 uppercase">{r.name[0]}</div>
                  <div>
                    <p className="text-zinc-100 font-black text-[10px] uppercase tracking-widest">{r.name}</p>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{r.role}</p>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* Final Call to Action */}
      <div className="text-center pt-20">
         <div className="inline-flex items-center gap-4 px-8 py-4 bg-zinc-900/50 border border-zinc-800 rounded-full animate-bounce">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">System Ready for Deployment</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
