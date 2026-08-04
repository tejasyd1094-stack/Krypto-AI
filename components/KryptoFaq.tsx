import React, { useState } from 'react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Enterprise' | 'Technology' | 'Security';
}

interface KryptoFaqProps {
  onBack?: () => void;
}

export default function KryptoFaq({ onBack }: KryptoFaqProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('what-is-krypto');

  const faqs: FaqItem[] = [
    {
      id: 'what-is-krypto',
      category: 'General',
      question: 'What is Krypto AI?',
      answer: 'Krypto AI is a high-performance career architect and recruitment intelligence engine designed by senior recruitment experts. It turns your professional DNA into ATS-optimized resumes (using the rigorous Google XYZ formula), computes high-probability 12-month career path blueprints, and hosts interactive interview simulations.'
    },
    {
      id: 'why-better',
      category: 'Technology',
      question: 'Why is Krypto AI better than traditional candidate assist AI available in the market?',
      answer: 'Most candidate-assist tools rely on simple keyword stuffing or generic LLM prompts that produce robotic, repetitive statements. This is easily flagged by modern ATS scanners and recruiters. Krypto AI uses high-precision alignment models, incorporating cognitive-spectrum diversity mapping and real recruitment metrics, to craft highly unique, human-sounding experiences with genuine quantifiable outcomes (%, $ values).'
    },
    {
      id: 'what-is-career-path',
      category: 'General',
      question: 'What is a Career Path?',
      answer: 'A Career Path is an advanced strategic blueprint mapping your current skills, notice period, and industry trends to compute high-probability future roles. Rather than suggesting simple linear promotions, it maps out a comprehensive 12-month timeline detailing precise skills to acquire, trajectory-pivot milestones, and professional compensation growth.'
    },
    {
      id: 'enterprise-career-path',
      category: 'Enterprise',
      question: 'How can enterprises use Career Path to look for their valuable employee careers?',
      answer: 'Enterprises use the Krypto Career Path sandbox to visualize internal mobility scenarios, identify silent high-potential candidates, and construct customized succession blueprints. By auditing the cognitive traits (using the RIASEC framework) of their existing engineering and design cohorts, organizations can design tailor-made progression maps and mitigate critical high-attrition risk.'
    },
    {
      id: 'why-interview-sim',
      category: 'Technology',
      question: 'Why is interview simulation better on Krypto AI?',
      answer: 'Our Interview Lab runs on localized, domain-specific conversational scenarios constructed by authentic recruiting analysts. Instead of reading standard pre-scripted questions, we challenge you in real time with industry pressure situations, direct pushback, and unexpected algorithmic scenarios, scoring you on communication fluency and technical depth.'
    },
    {
      id: 'why-not-extensions',
      category: 'Security',
      question: 'Why not use interview AI extensions as right now the trends in market?',
      answer: 'Modern HR departments are fully equipped with automated anti-cheat diagnostics that track irregular speech latency, fixed gazes, and copy-paste text streams. Attempting to use a real-time copilot extension during an interview leads to noticeable conversational timing delays and eventual flagging, resulting in an immediate corporate blacklist. Krypto AI builds authentic, biological muscle memory through offline simulations, ensuring you execute flawlessly under stress without requiring synthetic assists.'
    },
    {
      id: 'why-krypto-experts',
      category: 'General',
      question: 'Why Krypto AI?',
      answer: 'Krypto AI was designed from the ground up by a specialized consortium of elite HR heads, corporate recruitment directors, and talent scientists. Our experts possess extensive experience across leading world-class institutions—like McKinsey, SAP, EY, and major global software firms. This ensures every blueprint, resume highlight, and situational prompt aligns with true executive standard hiring decisions.'
    }
  ];

  const categories = ['All', 'General', 'Technology', 'Enterprise', 'Security'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="min-h-[80vh] bg-transparent text-zinc-100 font-sans px-4 sm:px-10 py-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 relative overflow-hidden">
      
      {/* Centered Large Decorative Background Magnifying Glass Watermark */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-[0.03] text-yellow-500 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px]">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full stroke-[0.35]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Corporate Intelligence Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
            Krypto <span className="gold-text-gradient">Core FAQ</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-lg mt-1">
            Browse through common structural questions about recruitment artificial intelligence, platform security, and our expert hiring methodology.
          </p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="group self-start sm:self-center px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700/50 border border-zinc-800 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-2 active:scale-95"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button>
        )}
      </div>

      {/* Filter and Search Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Search input with sleek custom style */}
        <div className="md:col-span-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs by keywords..."
            className="w-full bg-zinc-950/60 border border-zinc-900 rounded-2xl px-5 py-3.5 pl-11 text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium relative z-10"
          />
          <svg className="w-4 h-4 absolute left-4 top-4.5 text-zinc-500 pointer-events-none select-none opacity-40 z-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Categories toggler */}
        <div className="md:col-span-7 flex flex-wrap gap-2 justify-start md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                  : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Area */}
      <div className="space-y-4 relative z-10">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id}
                className={`bg-zinc-950/40 border transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden ${
                  isExpanded ? 'border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.03)] bg-zinc-950/80' : 'border-zinc-900/80 hover:border-zinc-800'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left gap-4"
                >
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850">
                      {faq.category}
                    </span>
                    <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug uppercase tracking-tight ${
                      isExpanded ? 'text-yellow-500' : 'text-zinc-200'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500 rotate-180' : 'border-zinc-800 text-zinc-500'
                  }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-[300px] border-t border-zinc-900/50 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6 sm:p-8 pt-4 pb-8 text-zinc-400 font-medium text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 border border-zinc-900 rounded-3xl text-center bg-zinc-950/20 space-y-3">
            <svg className="w-10 h-10 text-zinc-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-zinc-500 font-medium">No results matches your keyword search in Krypto FAQs.</p>
          </div>
        )}
      </div>

      {/* Expert Validation Badge */}
      <div className="bg-gradient-to-r from-transparent via-zinc-950/40 to-transparent p-6 sm:p-8 rounded-3xl border border-zinc-900 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative z-10 overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-wider">Expert Vetted Methodology</h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-medium leading-relaxed">
            Every analytical result, resume prompt pattern, and scoring mechanism on Krypto AI was built by senior human recruiters having combined extensive expertise in corporate leadership and recruitment.
          </p>
        </div>
      </div>

    </div>
  );
}
