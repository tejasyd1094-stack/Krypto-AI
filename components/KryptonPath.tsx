import React, { useState, useEffect, useRef } from 'react';
import { KryptoLogo } from './Branding';
import KryptonPathBlog from './KryptonPathBlog';

interface KryptonPathProps {
  onLaunchKrypto: () => void;
}

const KryptonPathLogo = () => (
   <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-500/40 to-transparent shadow-[0_0_20px_rgba(234,179,8,0.2)]">
      <img src="https://i.postimg.cc/7YdGjhgV/IMG-1149.jpg" alt="KryptonPath Logo" className="w-full h-full rounded-full object-cover border-2 border-black" />
   </div>
);

const KryptonPathMenu = ({ isOpen, onClose, onLaunchKrypto, onNavigateBlog, onNavigateLanding }: { isOpen: boolean, onClose: () => void, onLaunchKrypto: () => void, onNavigateBlog: () => void, onNavigateLanding: () => void }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-900 z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="flex justify-between items-center p-8 border-b border-zinc-900/50">
           <div className="flex items-center gap-4">
             <KryptonPathLogo />
             <span className="text-xl font-black text-white uppercase tracking-tighter">Menu</span>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>
        <div className="p-8 flex flex-col gap-2 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          
          <nav className="flex flex-col gap-8 relative z-10">
             <div className="space-y-4 pt-10">
               <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Organization</h4>
               <a href="#vision" onClick={() => { onNavigateLanding(); onClose(); }} className="block text-4xl sm:text-5xl font-black text-zinc-500 hover:text-white hover:translate-x-4 transition-all duration-300 uppercase tracking-tighter">Vision</a>
               <a href="#services" onClick={() => { onNavigateLanding(); onClose(); }} className="block text-4xl sm:text-5xl font-black text-zinc-500 hover:text-white hover:translate-x-4 transition-all duration-300 uppercase tracking-tighter">Services</a>
               <button onClick={() => { onNavigateBlog(); onClose(); }} className="block text-left text-4xl sm:text-5xl font-black text-zinc-500 hover:text-white hover:translate-x-4 transition-all duration-300 uppercase tracking-tighter w-full">Blog</button>
               <a href="#testimonials" onClick={() => { onNavigateLanding(); onClose(); }} className="block text-4xl sm:text-5xl font-black text-zinc-500 hover:text-white hover:translate-x-4 transition-all duration-300 uppercase tracking-tighter">Testimonials</a>
               <a href="#contact" onClick={() => { onNavigateLanding(); onClose(); }} className="block text-4xl sm:text-5xl font-black text-zinc-500 hover:text-white hover:translate-x-4 transition-all duration-300 uppercase tracking-tighter">Contact</a>
             </div>
             
             <div className="space-y-4 pt-10 border-t border-zinc-800/50">
               <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Intelligence Platform</h4>
               <button onClick={onLaunchKrypto} className="w-full text-left group">
                 <div className="block text-4xl sm:text-5xl font-black text-white group-hover:text-yellow-500 transition-colors uppercase tracking-tighter flex items-center gap-4">
                   Krypto AI
                   <svg className="w-8 h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                 </div>
                 <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400">Launch Recruitment AI Dashboard</p>
               </button>
             </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default function KryptonPath({ onLaunchKrypto }: KryptonPathProps) {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'blog'>('landing');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${scrollY > 50 || view === 'blog' ? 'bg-black/80 backdrop-blur-lg border-b border-zinc-900/50 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { if (view === 'blog') { setView('landing'); window.scrollTo(0,0); } else { window.scrollTo(0,0); } }}>
            <KryptonPathLogo />
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Krypton<span className="text-zinc-500">Path</span></h1>
          </div>
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-4 group">
            <span className="hidden sm:block text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 group-hover:text-yellow-500 transition-colors">Open Navigation</span>
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex flex-col items-center justify-center gap-1.5 group-hover:bg-yellow-500 hover:border-yellow-500 transition-all">
              <span className="w-4 h-0.5 bg-white group-hover:bg-black transition-colors rounded-full" />
              <span className="w-4 h-0.5 bg-white group-hover:bg-black transition-colors rounded-full" />
            </div>
          </button>
        </div>
      </header>

      <KryptonPathMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onLaunchKrypto={onLaunchKrypto} 
        onNavigateBlog={() => { setView('blog'); window.scrollTo(0, 0); }} 
        onNavigateLanding={() => { setView('landing'); }} 
      />

      {view === 'landing' ? (
        <>
          {/* Hero Section */}
          <section className="relative min-h-[100svh] sm:min-h-screen flex items-center pt-24 pb-12 sm:pt-32 sm:pb-20 justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 text-center space-y-8 sm:space-y-10 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md mb-4 sm:mb-8 mx-auto self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Pioneering Career Intelligence</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.85] text-white">
            Recruitment<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600">Reimagined.</span>
          </h1>
          
          <p className="text-lg sm:text-2xl font-medium text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Beyond Traditional Hiring. We focus on <span className="text-white font-black uppercase tracking-wider">Velocity + Value</span> to build inclusive, high-performance ecosystems that drive real business outcomes.
          </p>
          
          <div className="pt-8 sm:pt-10 flex items-center justify-center">
            <a href="#vision" className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 bg-yellow-500 text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              Discover Vision
            </a>
          </div>

          {/* Meet Krypto AI Section below Discover Vision button */}
          <div className="pt-8 sm:pt-14 max-w-4xl mx-auto px-2 sm:px-0">
            <div className="p-3 sm:p-8 md:p-12 rounded-[24px] sm:rounded-[32px] bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[90px] pointer-events-none" />
              
              {/* Krypto AI Video Presenter */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-zinc-800/80 p-2 sm:p-4 mb-6 sm:mb-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] group">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-900 shadow-inner group-hover:border-yellow-500/40 transition-colors duration-500">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    poster="/krypto_thumbnail.jpeg"
                  >
                    <source src="/krypto_video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-xl" />
                </div>
              </div>

              <KryptoLogo size={64} className="mx-auto text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] sm:w-[80px] sm:h-[80px]" />
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">Meet Krypto AI.</h2>
              <p className="text-base sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto">
                The flagship intelligence platform by KryptonPath. Simulating high-pressure interviews, rewriting resumes for ATS defense, and mapping career success rates.
              </p>
              <div className="pt-2 flex justify-center">
                <button onClick={onLaunchKrypto} className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-2xl inline-flex items-center justify-center gap-4 group">
                  Launch Product <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Info Section */}
      <section id="vision" className="py-16 sm:py-32 relative bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Who We Are</h2>
              <h3 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-tight text-white">A Disruptive Consultancy.</h3>
              <p className="text-zinc-500 leading-relaxed text-lg pb-6">
                Born from the need for precision hiring in Manufacturing, IT Sales, and HR. We are bringing diversity, equity, and inclusion to the forefront, bridging the gap between niche talent and innovative organizations.
              </p>
              <div className="space-y-4">
                {['Diversity First (DEI Focused)', 'Niche Expertise ("Purple Squirrel" Roles)', 'Future-Proofing (Career Mentoring)', 'Global Leadership Experience'].map((v) => (
                  <div key={v} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border border-yellow-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-zinc-900 rounded-[40px] overflow-hidden border border-zinc-800">
              <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay z-10" />
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" alt="Corporate" className="w-full h-full object-cover grayscale opacity-50 hover:opacity-80 hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 z-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Industry Services */}
      <section id="services" className="py-16 sm:py-32 relative bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16 sm:space-y-24">
          <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Expert Services</h2>
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">Tech & Innovation Talent</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Our IT and Product vertical specialises in placing talent with US-based product companies and local tech hubs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Full-Stack Development', desc: 'From frontend frameworks to backend architectures, we source developers who understand modern tech stacks.' },
              { title: 'UI/UX Design', desc: 'Designers who combine aesthetic sensibility with user-centred design principles.' },
              { title: 'Product Management', desc: 'Strategic thinkers who can bridge technology and business, driving product vision.' }
            ].map((v) => (
              <div key={v.title} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 hover:border-yellow-500/30 transition-colors group">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                </div>
                <h4 className="text-white font-black text-xl mb-4">{v.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-6 max-w-3xl mx-auto pt-16 border-t border-zinc-900">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">Industrial & Revenue Drivers</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Deep understanding of PAN-India logistics and location-specific hiring challenges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 hover:border-yellow-500/30 transition-colors group">
              <h4 className="text-white font-black text-xl mb-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                Manufacturing Excellence
              </h4>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Precision hiring for plant operations, supply chain management, quality assurance, and industrial engineering.
              </p>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Operations management</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Supply chain experts</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Quality control</li>
              </ul>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 hover:border-yellow-500/30 transition-colors group">
              <h4 className="text-white font-black text-xl mb-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                Sales Leadership
              </h4>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Results-driven professionals with proven track records in B2B and SaaS sales. We evaluate relationships & strategy.
              </p>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Enterprise sales execs</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> SaaS account managers</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Business development</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Speed & Stats */}
      <section className="py-16 sm:py-32 relative bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center space-y-12 sm:space-y-16">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Speed Without Compromise</h2>
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">The KryptonPath Advantage</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
            {[
              { metric: '48-72h', desc: 'Hours to First Interviews. Average turnaround time from receiving requirements to qualified candidates.' },
              { metric: '90%', desc: 'Interview-to-Offer Rate. Exceptional conversion rate due to rigorous pre-screening.' },
              { metric: '95%', desc: 'Retention Beyond 1 Year. Placements demonstrate long-term success.' }
            ].map((stat, i) => (
              <div key={i} className="pt-12 md:pt-0 md:px-12 first:pt-0">
                <h4 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600 mb-6">{stat.metric}</h4>
                <p className="text-zinc-500 text-sm font-medium mx-auto max-w-xs">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-32 relative bg-[#050505] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Live Testimony</h2>
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">Proven Results.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { 
                 title: 'High-Stakes Niche Placement', 
                 profile: 'US Federal Proposal Writer', 
                 challenge: 'Highly specialized role with strict budget constraints.',
                 result: 'Successfully placed a candidate for a US-based company at a salary lower than their previous CTC, delivering immediate ROI for the client.' 
               },
               { 
                 title: 'Rapid Team Scaling', 
                 profile: 'Digital Marketing Team (5 Individuals)', 
                 challenge: 'Full team build-out for a US IT Product company within 30 days.',
                 result: '100% of roles filled within the month, allowing the client to launch their marketing campaign on schedule.' 
               },
               { 
                 title: 'PAN-India Logistics & Volume', 
                 profile: '7 Automobile Warranty Executives', 
                 challenge: 'Specific budget of 4.5 LPA across three different geographic locations.',
                 result: 'All 7 positions filled and joined within 30 days, demonstrating our ability to handle multi-location requirements quickly.' 
               }
             ].map((cs, i) => (
               <div key={i} className="bg-zinc-950 border border-zinc-900 hover:border-yellow-500/30 transition-all rounded-3xl p-10 flex flex-col group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/20 transition-all pointer-events-none" />
                 <h4 className="text-white font-black text-xl mb-8 border-b border-zinc-800 pb-4 relative z-10">{cs.title}</h4>
                 
                 <div className="space-y-6 flex-1 relative z-10">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Profile</span>
                     </div>
                     <p className="text-white font-bold text-sm tracking-wide">{cs.profile}</p>
                   </div>
                   
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Challenge</span>
                     </div>
                     <p className="text-zinc-400 text-sm leading-relaxed">{cs.challenge}</p>
                   </div>
                   
                   <div className="pt-4 mt-auto">
                     <div className="flex items-start gap-3 bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20">
                       <div className="mt-1 flex-shrink-0">
                         <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                       </div>
                       <div>
                         <span className="block text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">Result</span>
                         <p className="text-zinc-300 text-sm font-medium leading-relaxed">{cs.result}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Pricing & Guarantee */}
      <section className="py-16 sm:py-32 relative bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Value-Driven Engagement</h2>
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">Competitive Pricing Model.</h3>
            <p className="text-zinc-500 leading-relaxed text-lg pb-6">
              Our Promise: We focus on sustainable placements, not just "filling a seat."
            </p>
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex justify-between items-center group hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-yellow-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                   </div>
                   <h4 className="text-white font-black uppercase tracking-widest text-sm">Generic Roles</h4>
                </div>
                <div className="text-xl font-black text-yellow-500">6% <span className="text-[10px] text-zinc-500 ml-1">of Annual CTC</span></div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex justify-between items-center group hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-yellow-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   </div>
                   <h4 className="text-white font-black uppercase tracking-widest text-sm">Niche & Specialized Roles</h4>
                </div>
                <div className="text-xl font-black text-yellow-500">8.6% <span className="text-[10px] text-zinc-500 ml-1">of Annual CTC</span></div>
              </div>
            </div>
          </div>
          <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-zinc-900 rounded-[40px] overflow-hidden border border-zinc-800 flex items-center justify-center text-center p-12">
            <div className="absolute inset-0 bg-yellow-500/5" />
            <div className="relative z-10 space-y-6">
               <div className="w-16 h-16 mx-auto bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
               </div>
               <h4 className="text-2xl font-black text-white uppercase tracking-tighter">The KryptonPath Guarantee</h4>
               <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed">If a candidate leaves within 90 days, we provide a replacement at no additional cost. We stand by the longevity and performance of every hire we facilitate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 sm:py-32 relative bg-[#050505] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.4em]">Connect With Us</h2>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-tight">Let's Transform<br/>Your Workforce.</h3>
            <p className="text-zinc-500 leading-relaxed text-lg max-w-md">
              Partner with KryptonPath to access premium talent pipelines, industry experts, and intelligent recruitment solutions.
            </p>
            
            <div className="pt-8 space-y-8 border-t border-zinc-900/50">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex flex-shrink-0 items-center justify-center text-yellow-500 border border-zinc-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Email Support & Partnerships</span>
                  <a href="mailto:support@kryptonpath.co" className="text-white hover:text-yellow-500 transition-colors font-medium">support@kryptonpath.co</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex flex-shrink-0 items-center justify-center text-yellow-500 border border-zinc-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Global Reach</span>
                  <p className="text-white font-medium">Serving PAN-India & US Product Companies</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-8 sm:p-10 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[80px] pointer-events-none" />
            <form className="relative z-10 space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your interest. We will be in touch shortly."); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">First Name</label>
                  <input type="text" required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Last Name</label>
                  <input type="text" required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Work Email</label>
                <input type="email" required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600" placeholder="john@company.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Company Name</label>
                <input type="text" required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600" placeholder="Acme Corp" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Message</label>
                <textarea rows={4} required className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600 resize-none" placeholder="Tell us about your hiring needs or specialized niche requirements..." />
              </div>
              
              <button type="submit" className="w-full py-5 bg-yellow-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3">
                Request Consultation <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Flagship Product Banner */}
      <section className="py-24 sm:py-40 relative overflow-hidden bg-black flex items-center justify-center border-t border-zinc-900">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center opacity-20 grayscale mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 sm:space-y-12">
          <KryptoLogo size={80} className="mx-auto text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.4)] sm:w-[120px] sm:h-[120px]" />
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">Meet Krypto AI.</h2>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
            The flagship intelligence platform by KryptonPath. Simulating high-pressure interviews, rewriting resumes for ATS defense, and mapping career success rates.
          </p>
          <button onClick={onLaunchKrypto} className="mt-8 px-8 sm:px-14 py-5 sm:py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto group w-full sm:w-auto">
            Launch Product <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </button>
        </div>
      </section>
        </>
      ) : (
        <KryptonPathBlog onBack={() => { setView('landing'); window.scrollTo(0,0); }} onLaunchKrypto={onLaunchKrypto} />
      )}

      {/* Footer */}
      <footer className="pt-16 sm:pt-32 pb-8 sm:pb-16 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-32 items-start relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4">
               <KryptonPathLogo />
               <span className="text-2xl font-black uppercase tracking-tighter text-zinc-300">KryptonPath</span>
            </div>
            <p className="text-zinc-500 font-medium leading-relaxed max-w-sm text-sm">
              An award-winning parent organization committed to reshaping the future of human capital.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Services</h4>
               <nav className="flex flex-col gap-4">
                 <button onClick={onLaunchKrypto} className="text-left text-xs font-bold text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest cursor-pointer">Krypto AI</button>
                 <a href="#" className="text-xs font-bold text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest">Enterprise Solutions</a>
               </nav>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Blog</h4>
               <nav className="flex flex-col gap-4">
                 <button onClick={() => { setView('blog'); window.scrollTo(0,0); }} className="text-left text-xs font-bold text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest cursor-pointer">Latest Articles</button>
               </nav>
            </div>
            <div className="space-y-6 font-sans">
               <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Connect</h4>
               <nav className="flex flex-col gap-4">
                 <a href="#" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">LinkedIn</a>
                 <a href="#" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Twitter / X</a>
                 <a href="#contact" onClick={() => { setView('landing'); }} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Contact Us</a>
               </nav>
            </div>
          </div>
        </div>
        <div className="mt-16 sm:mt-32 border-t border-zinc-900 pt-8 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">© 2026 KryptonPath Organization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
