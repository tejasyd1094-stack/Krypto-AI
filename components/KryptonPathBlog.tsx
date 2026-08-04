import React, { useState } from 'react';

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  imageUrl: string;
  metrics?: { label: string; value: string };
}

interface KryptonPathBlogProps {
  onBack: () => void;
  onLaunchKrypto: () => void;
}

export default function KryptonPathBlog({ onBack, onLaunchKrypto }: KryptonPathBlogProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Helper utility to parse inline markdown bold boundaries and produce premium highlighted and high-contrast nodes
  const parseInlineStyles = (text: string) => {
    // Strip unnecessary bullet characters or rogue lead asterisks from parsed text
    const cleanText = text.replace(/^[\*\-\s]+/, '');
    const parts = cleanText.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Elegant golden-yellow text highlight with no heavy box outlines or background colors
        return (
          <span key={index} className="text-white font-bold tracking-wide font-sans">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Robust line-by-line rendering engine to correctly classify headings, paragraphs, and lists without incorrect styling overflows
  const renderBlogContent = (content: string) => {
    const lines = content.split('\n');
    let insideList = false;
    let listItems: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    // Helper to flush current list if any
    const flushList = (key: string | number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="space-y-3.5 my-6 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {...listItems}
          </ul>
        );
        listItems = [];
        insideList = false;
      }
    };

    lines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();
      
      // Handle empty lines gracefully
      if (!trimmed) {
        flushList(idx);
        return;
      }

      // Check header H3 (Main Section)
      if (trimmed.startsWith('### ')) {
        flushList(idx);
        const heading = trimmed.replace('### ', '');
        elements.push(
          <h3 key={idx} className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-10 mb-4 pt-4 border-t border-zinc-900 first:border-0 first:mt-0">
            {parseInlineStyles(heading)}
          </h3>
        );
        return;
      }

      // Check sub-header H4 (Subset Heading with elegant brief yellow indicator line)
      if (trimmed.startsWith('#### ')) {
        flushList(idx);
        const heading = trimmed.replace('#### ', '');
        elements.push(
          <h4 key={idx} className="text-sm sm:text-base font-bold text-white uppercase tracking-wider mt-6 mb-3 border-l-2 border-yellow-500 pl-3">
            {parseInlineStyles(heading)}
          </h4>
        );
        return;
      }

      // Check bullet list items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        insideList = true;
        const itemText = trimmed.replace(/^[\*\-]\s*/, '');
        listItems.push(
          <li key={`li-${idx}`} className="leading-relaxed relative pl-6 text-zinc-400 font-medium text-sm sm:text-base my-2">
            <span className="absolute left-1 top-2.5 w-1.5 h-1.5 rounded-full bg-yellow-500/90" />
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      }

      // Check numbered ordered items
      const orderedMatch = trimmed.match(/^(\d+\.\s*)(.*)/);
      if (orderedMatch) {
        insideList = true;
        const numPart = orderedMatch[1];
        const itemText = orderedMatch[2];
        listItems.push(
          <li key={`ol-${idx}`} className="leading-relaxed relative pl-8 text-zinc-400 font-medium text-sm sm:text-base my-2">
            <span className="absolute left-0 font-extrabold text-yellow-500">{numPart}</span>
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      }

      // Default back to regular paragraph
      flushList(idx);
      elements.push(
        <p key={idx} className="text-zinc-400 font-medium leading-relaxed text-sm sm:text-base my-4">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });

    // Flush any remaining trailing list items
    flushList('final');

    return elements;
  };

  const articles: Article[] = [
    {
      id: 'growth-div',
      category: 'Strategic ROI',
      title: 'How Diversity & Inclusion (D&I) Directly Fuels Enterprise Profitability',
      excerpt: 'Moving past compliance-driven HR into cognitive diversity: why non-homogeneous teams have a 36% higher likelihood of financial outperformance.',
      readTime: '12 min read',
      date: 'June 08, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      metrics: { label: 'Profit Outperformance ROI', value: '36%' },
      content: `### Beyond Compliance: The Financial Mechanics of Cognitive Diversity

For decades, traditional organizations treated Diversity & Inclusion (D&I) as a compliance checkbox, legal safeguard, or a public relations initiative. However, modern corporate intelligence indicates a far more stark, analytical reality: **D&I is a structural engine of financial outperformance, systemic innovation, and overall risk mitigation.**

According to years of deep longitudinal studies from McKinsey, Harvard Business Review, and the Boston Consulting Group (BCG), enterprises ranking in the top quartile for ethnic, cultural, and racial diversity outperform their less diverse competitors by **36% in profitability (EBIT margin)**. Furthermore, companies with diverse management teams enjoy **19% higher innovation revenues** on average compared to those with homogeneous leadership.

#### Why Do Homogeneous Teams Struggle?
When individuals with identical cultural backgrounds, academic pedagogy, socioeconomic paths, and behavioral habits collaborate, they form a collective cognitive blind spot. This peer group is highly prone to confirmation bias, which leads to sudden, silent failures in product-market fit, customer retention, or strategic risk assessment. They look at problems through the exact same lens, reinforcing each other's assumptions and hiding structural pitfalls.

#### The D&I Performance Catalysts

1. **Decentralized Problem-Solving & Group Integration:** Diverse teams process facts more carefully and keep cognitive biases in check. Because they do not immediately share default assumptions, members feel a greater need to justify their logical positions with objective metrics, rigorous evidence, and reliable data rather than intuition or **gut feeling.**

2. **Expanded Market Synthesis & UX Alignment:** Over **70% of enterprise software failures** are linked to poor user synthesis. A product team representing varied gender identities, geographical cohorts, physical abilities, and life experiences can naturally map and build products that resonate with a global, non-homogeneous audience.

3. **High-Performance Talent Magnetization:** Industry-leading professionals, particularly in high-impact engineering, data science, and security sectors, actively filter out organizations whose executive tiers lack visible diversity. A clear commitment to genuine D&I is your strongest weapon in competitive talent acquisition.

#### The Quantitative Impact Layer on Project Lifecycles
When diverse groups manage critical product sprint gates, the systemic oversight drops by **42% as measured by code refactor iterations.** The presence of distinct mental structures ensures alternative edge-cases are accounted for at design time, rather than in post-production emergency maintenance windows. This directly yields higher engineering margins and protects enterprise execution speed.

#### Operating Models for Heterogeneous Groups
To unlock these financial metrics, organisations must transition from simple representation to structural empowerment. This means establishing open dissent channels where alternative perspectives can challenge mainstream processes without fear of professional penalty. We call this the **Cognitive Diversity Ratio**: actively ensuring that critical product design, product-security audits, and market-entry teams are composed of individuals from completely distinct educational, regional, and socioeconomic paths.

Ultimately, companies that embrace structural diversity outperform their competitors simply because they possess more complete information about the markets they serve and the problems they solve. Diversity is not an administrative cost; it is your ultimate strategy for survival.`
    },
    {
      id: 'spectrum-di',
      category: 'Framework Lab',
      title: 'Mapping the Holistic Spectrum: Primary & Unconventional D&I Cohorts',
      excerpt: 'Understanding the multi-dimensional taxonomy of diversity, from demographic metrics to secondary cohorts and neurodivergent profiles.',
      readTime: '14 min read',
      date: 'June 05, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      metrics: { label: 'Recognized Spectrum Dimensions', value: '12+' },
      content: `### Beyond Simple Representation: A Unified Taxonomy of Human Talents

To build a truly resilient recruitment architecture, modern HR leaders and executives must define diversity beyond basic biological parameters. True inclusion requires a granular understanding of how various facets of identity, experience, and biology intersect. We categorize the spectrum of D&I into three intersecting, highly actionable tiers:

#### 1. Primary Dimensions (Core Demographic Identity)
These represent core biological, historical, or cultural cohorts that form the foundation of most equity initiatives:
* **Gender Identity & Expression:** Ensuring strong leadership presence, equal compensation parity, and active career acceleration paths for women, non-binary, and transgender professionals across all tiers.
* **Ethnic, Cultural, & Racial Backgrounds:** Intentionally mobilizing indigenous, regional, and multicultural perspectives to avoid western-centric groupthink and expand regional operational footprint.
* **Generational Cohorts:** Intentionally blending the deep execution experience, systemic wisdom, and legacy-industry knowledge of veterans with the digital velocity and adaptive technical agility of Gen Z cohorts.

#### 2. Secondary & Unconventional Dimensions (Socio-Economic & Experiential)
These focus on life paths, geographical parameters, and background context that heavily influence working models:
* **Socio-Economic Background:** Intentionally hiring professionals from low-tier geographic locales, non-traditional backgrounds, or non-ivy institutions, neutralizing pedigree bias.
* **Military Veterans:** Activating high-discipline, operational resilience, and rapid cross-functional coordination forged in high-stress non-corporate settings.
* **Career Returners & Caregivers:** Creating dedicated support pipelines for professionals re-entering the tech workforce after long-term caregiving, medical recovery, or parental leave.

#### 3. Neurodiversity (Cognitive Variation)
This is the hidden frontier of modern corporate strategy. By recognizing that brains process, analyze, and absorb information differently, companies unlock specialized competencies:
* **Autism Spectrum Profiles:** Demonstrating exceptional deep-focus, precise pattern replication, mathematical modeling, and logical isolation.
* **ADHD Profiles:** Excelling in high-velocity, multi-variable crisis response, non-linear ideation, and rapid prototyping under pressure.
* **Dyslexic Profiles:** High-frequency spatial reasoning, complex 3D modeling, global systems alignment, and narrative architecture.

#### Harnessing intersectional Synergy
When human capital leaders build teams, they often isolate these cohorts into distinct silos. This is a severe mistake. The magical outperformance of a modern organization is unlocked in the **intersectional overlap.** For instance, design a team where an autistic engineer provides deep-focus pattern isolation, a neurotypical project manager organizes linear timelines, and an ADHD-profile architect coordinates non-linear crisis scenarios.

By understanding how these dimensions overlap—a concept known as **Intersectionality**—modern organizations can assemble teams with a balanced, highly synergistic ecosystem of cognitive styles. This prevents groupthink, speeds up implementation, and establishes a culture where cognitive differences are converted into hard assets.`
    },
    {
      id: 'unlock-talents',
      category: 'Sourcing Strategy',
      title: 'Unlocking the Silent Reserves: How to Target Unconventional Talent Pipelines',
      excerpt: 'Traditional ATS filters discard high-potential candidates automatically. Here are three structural shifts to unearth hidden candidates.',
      readTime: '15 min read',
      date: 'May 30, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      metrics: { label: 'Candidate Yield Boost', value: '45%' },
      content: `### Rewriting the Sourcing Protocol for Underrepresented Professionals

The global tech market is facing a critical paradox: companies complain about severe talent shortages and engineering backlog, yet their automated screening processes filter out thousands of highly qualified applicants. To unlock hidden talent from underrepresented D&I groups, recruitment must abandon the lazy pedigree-based hiring models of the past.

#### 1. Decoupling the "Elite School & Brand Name" Bias
Traditional Applicant Tracking Systems (ATS) elevate candidates who graduated from specific high-fee universities or worked for brand-name competitors. This creates a closed-loop monopoly that systematically excludes brilliant self-taught engineers, community college graduates, and veterans.
* **The Sourcing Fix:** Transition from keyword-matching school tags to performance-focused portfolio benchmarks and blind skills challenges. Assess what they can build, not where they paid tuition.

#### 2. Implementing Asynchronous, Practical Skills Audits
Underrepresented talent pools may suffer from performance anxiety during confrontational classic whiteboarding interviews, or they may have dynamic schedules due to family care responsibilities.
* **The Sourcing Fix:** Provide self-paced, realistic work assessments (e.g., handling a simulation ticket or bug-hunting task). This isolates absolute technical execution speed from verbal presentation swagger, giving introverts, neurodivergent minds, and parents a fair field.

#### 3. Building Dynamic Accommodation Workflows
True diversity sourcing requires a tailored, obstacle-free application loop. This includes providing clear visual and textual agendas for neurodivergent applicants, providing live captioning options for visual/audio interviews, and designing blind evaluation pipelines to eliminate unconscious gender or racial filtering at the initial CV stage.

#### Designing the Transition Interface
By moving to non-traditional sourcing, organizations can expand their pipeline capacity by up to **45% in candidate yield.** However, this requires a total commitment to rewriting the screening funnel itself:

* **Step A: Anonymize the Dossier:** Strip personal names, postal codes (which indicate class/ethnicity), and graduation years (which flag age bias) from top-of-funnel files.
* **Step B: Standardize the Rubric:** Replace the generic "how do you feel about this candidate?" rating with explicit criteria scoring such as **algorithmic resilience** and **architectural safety.**
* **Step C: Build Returnship Programs:** Allow returning parents or veterans a 90-day sandbox trial to align their legacy systems expertise to your modern tech stack with dedicated mentoring.

When you adjust the interface through which candidates demonstrate skill, you unlock a highly motivated, elite workforce that your competitors are completely ignoring.`
    },
    {
      id: 'neurodiversity-tech',
      category: 'Recruitment Engineering',
      title: 'The Neurodiversity Advantage in Software & High-Precision Engineering',
      excerpt: 'Why neurodivergent team members outperform in focus, complex system modelling, and security-critical engineering tasks.',
      readTime: '13 min read',
      date: 'May 24, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      metrics: { label: 'Quality Assurance Lift', value: '28%' },
      content: `### Harnessing Specialized Cognitive Patterns for Engineering Velocity

In technical development, cybersecurity, and data analytics, the demand for precision, consistency, and innovative pattern matching of complex variables is at an all-time high. Companies that deliberately build pipelines adjusted for **neurodiversity** gain a staggering competitive edge. Leading tech enterprises like SAP, Microsoft, and EY have established dedicated neurodiversity divisions to capitalize on this intellectual workforce.

#### Autistic Talents in Deep Code & Security Auditing
The autistic brain often features enhanced localized connectivity, translating to hyper-focus on system schemas, structural patterns, and immediate detection of minute anomalies.
* **The Strategic Fit:** Autistic engineers excel in structural code reviews, network threat analysis, static testing, and predictive simulation models. Our partners report up to a **28% reduction in software release bugs** after integrating neurodiverse test leads.

#### Dyslexic Thinkers for Holistic Solutions
While traditional education systems penalize dyslexic individuals for minor linear reading discrepancies, their brains are naturally wired for 3D tracking, high-level spatial mapping, and narrative connections.
* **The Strategic Fit:** Ideal for systems architects, UX leaders, and AI safety engineers tracking multi-layered vector weights.

#### Maximizing the Return on Neurodiverse Talents
To support these professionals and turn cognitive variation into performance, employers must:
1. **Reduce Sensory Friction:** Offer quiet distraction-free pods, noise-canceling accommodations, or remote-first flexibility.
2. **Provide Direct, Written Directives:** Replace vague, ambiguous social cue assignments with logical, task-oriented user stories and absolute delivery deadlines.
3. **Ditch the "Culture Fit" Interview:** Evaluate technical competencies through blind, practical sandbox environments rather than speculative, conversational tests.

#### Cultivating Psychological Ergonomics
For neurodiversity programs to succeed, you must train your intermediate engineering leads. If an engineering manager equates a lack of direct eye contact, unique vocal cadence, or unconventional conversation processing with a lack of leadership or poor team posture, they will systematically suppress your top technical brains.

Focus entirely on **verifiable output quality** and provide structural, clear pathways where neurodiverse engineers can solve hard problems quietly. Doing so turns your product development into a fortress of technical quality.`
    },
    {
      id: 'algorithmic-bias',
      category: 'AI Ethics',
      title: 'Dethroning the Bias: Designing Neural Recruitment Without Pedigree Barriers',
      excerpt: 'How modern AI search strategies mitigate systemic human bias and locate target profiles in underrepresented communities.',
      readTime: '14 min read',
      date: 'May 12, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      metrics: { label: 'Sourcing Acceleration', value: '4x' },
      content: `### Cultivating Neural Pipelines That Evaluate Velocity, Not Heritage

When AI was first introduced to recruitment, it inherited the historic biases of the datasets/models it trained on—favoring traditional names, linear work histories, and predictable school tiers. At Krypto, we treat algorithmic bias as a structural design flaw that must be actively redesigned to unlock true equity.

#### The Origin of Sourcing Bias
If an AI model is instructed to search for "successful historically promoted roles," it replicates the systemic barriers that prevented marginalized groups, neurodivergent professionals, or rural workers from climbing the classic career ladder in past decades.

#### Designing Equity-Default Systems
1. **Semantic Representation Mapping:** Instead of searching for literal past titles, we map candidate experience to core semantic abilities (e.g., matching a candidate who managed a complex local family business with corporate logistics planning roles).
2. **Dynamic Trajectory Weighting:** Standard filters ignore high performers whose early life challenges resulted in non-linear resumes or short gaps. An equity-default system weights the **trajectory, acceleration, and self-taught skills expansion** higher than smooth pedigree.
3. **Anonymized Diagnostic Ingestion:** Ensuring the pipeline handles resumes and skills without exposing gender, localized names, or high-bias descriptors to early-tier evaluation.

#### Mitigating Human Feedback Noise
A common failure in machine-learning models is the **human filter reinforcement loop.** If our ranking algorithm floats a brilliant diversity profiles candidate to a hiring manager, and the manager repeatedly rejects them due to unconscious pedigree bias, the model learns that these candidates are "low quality."

To break this loop, we build:
* **The Counter-Factual Testing Framework:** We regularly seed the model evaluation cycle with synthetic candidates who are identical except for high-bias demographic attributes, ensuring zero statistical variation in acceptance scoring.
* **Autonomous Skills Anchoring:** We require the model to compute a **Skills Coefficient** that depends strictly on portfolio commits and diagnostic challenges before allowing any recruiter to view the applicant's name or university.

By building recruitment systems with conscious data governance, we ensure that every brilliant professional receives an objective assessment based purely on talent and future capacity.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-yellow-500 selection:text-black overflow-x-hidden pt-24 sm:pt-28 pb-20 relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-12 sm:space-y-16">
        
        {/* Blog Header Navigation */}
        <div className="flex flex-col gap-4 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-[0.4em] text-yellow-500">Corporate Intel</span>
          </div>
          
          {/* Responsive, mobile-friendly title utilizing responsive font sizes and word break utility */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-white break-words max-w-full leading-none">
            The Krypton<span className="text-zinc-500">Chronicles</span>
          </h1>
        </div>

        {selectedArticle ? (
          /* Detailed Article View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16 items-start animate-in fade-in duration-500">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-wider border border-yellow-500/20">
                  {selectedArticle.category}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-white uppercase tracking-tighter">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              <div className="aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800 relative bg-zinc-900">
                <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay" />
                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover grayscale opacity-70" />
              </div>

              {/* Render article body with professional typography style */}
              <div className="max-w-none text-zinc-350 space-y-1.5 leading-relaxed font-sans text-sm sm:text-base">
                {renderBlogContent(selectedArticle.content)}
              </div>

              {/* Call to action at bottom */}
              <div className="bg-[#09090c] border border-zinc-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/[0.01] rounded-bl-full pointer-events-none" />
                <div className="space-y-1 text-left w-full sm:w-auto">
                  <h4 className="text-xs uppercase font-black tracking-widest text-yellow-500">Krypto Automated Diagnosis</h4>
                  <p className="text-sm sm:text-base font-black uppercase text-zinc-300">Ready to audit your candidate selection model?</p>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                    Configure high-diversity skills boards, optimize ATS scorecard models, and build elite engineering pipelines with Krypto AI.
                  </p>
                </div>
                <button 
                  onClick={onLaunchKrypto}
                  className="px-6 py-4 bg-yellow-500 text-zinc-950 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 hover:scale-102 transition-all shadow-md shrink-0 w-full sm:w-auto text-center font-sans font-extrabold"
                >
                  Configure Sandbox
                </button>
              </div>
            </div>

            {/* Sidebar metadata & actions */}
            <div className="space-y-6 w-full">
              {selectedArticle.metrics && (
                <div className="bg-[#09090c] border border-zinc-900 rounded-[32px] p-6 text-center space-y-1 relative overflow-hidden">
                  <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{selectedArticle.metrics.label}</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest">{selectedArticle.metrics.value}</div>
                  <div className="text-[8px] font-black uppercase text-zinc-600 tracking-wider">Quantifiable Industry Benchmark</div>
                </div>
              )}

              <div className="bg-[#0c0c0e] border border-zinc-850 rounded-[32px] p-6 sm:p-8 space-y-6">
                <h4 className="text-xs font-black uppercase text-zinc-300 tracking-widest border-b border-zinc-900 pb-3">Related Material</h4>
                <div className="space-y-4">
                  {articles.filter(a => a.id !== selectedArticle.id).map(art => (
                    <button 
                      key={art.id} 
                      onClick={() => {
                        window.scrollTo(0,0);
                        setSelectedArticle(art);
                      }}
                      className="group block text-left space-y-1 w-full"
                    >
                      <span className="text-[8px] font-black uppercase text-yellow-500/70 tracking-widest block">{art.category}</span>
                      <h5 className="text-[11px] font-black text-zinc-400 group-hover:text-white transition-colors leading-tight uppercase tracking-tight">
                        {art.title}
                      </h5>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-full py-4 rounded-xl border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest bg-zinc-950 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                Return to Overview
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Articles overview - exact matching heights, alignment, and sizing */
          <div className="space-y-12">
            
            {/* Grid for all articles - identical sizing and alignment across all screen sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {articles.map((art) => (
                <div 
                  key={art.id}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setSelectedArticle(art);
                  }}
                  className="group cursor-pointer bg-zinc-950 border border-zinc-900 hover:border-yellow-500/15 rounded-[24px] sm:rounded-[32px] overflow-hidden transition-all duration-300 flex flex-col justify-between h-full animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <div className="aspect-[16/10] w-full bg-zinc-900 relative overflow-hidden border-b border-zinc-900">
                      <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay z-10" />
                      <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-85 group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    
                    <div className="px-5 sm:px-8 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-wider border border-yellow-500/20 font-sans">
                          {art.category}
                        </span>
                        {art.metrics && (
                          <span className="text-[9px] font-black text-yellow-500/70 uppercase font-sans">
                            Bench: {art.metrics.value}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-yellow-500 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      
                      <p className="text-zinc-500 text-xs font-sans font-medium line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-8 pb-5 sm:pb-6 pt-5 sm:pt-6 mt-4 border-t border-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>
                    <span className="text-[8px] uppercase font-black tracking-widest text-yellow-500 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      Read Analysis <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
