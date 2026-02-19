import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { GoogleGenAI, Chat } from "@google/genai";
import { KryptoLogo } from './Branding';
import { TabType, Message } from '../types';

interface DashboardProps {
  priority?: boolean;
  onNavigatePricing: () => void;
  setActiveTab?: (tab: TabType) => void;
  userCredits: number;
  onUse: (amount: number) => boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onNewChat: () => void;
  onVerifyLocation?: () => void;
  onUpdateLocation?: (loc: string) => void;
}

const PLACEHOLDERS = [
  "How to negotiate a 30% salary hike?",
  "Analyze this job description for keywords...",
  "Draft a cold email for a FAANG recruiter.",
  "What are the top skills for AI Engineering in 2025?",
  "Analyze my attached cover letter...",
  "Explain the RIASEC model for career growth."
];

const SYSTEM_INSTRUCTION = "You are Krypto AI, a friendly and encouraging Career Coach. Your goal is to provide concise, helpful, and professional career advice. Keep your responses brief and easy to understand. Be supportive and motivating. Do not use markdown unless necessary for clarity (like lists). After your main response, you MUST use the exact separator '%%%Suggestions:' followed by 2-3 short, actionable, and contextually relevant suggestions. These should not be simple, meaningless questions. Instead, they should guide the user toward a logical next step, a deeper exploration of the topic, or a related area of interest. For example, if the user asks about salary negotiation, good suggestions would be 'Draft a negotiation script for me' or 'What are common negotiation mistakes?' or 'How do I research salary benchmarks?'. Bad suggestions would be 'Do you want to know more?' or 'Was that helpful?'. The suggestions must be separated by a pipe '|'. Example: 'This is my answer.%%%Suggestions:Suggestion 1|Suggestion 2|Suggestion 3'. Do not deviate from this format.";

const POLICY_CONTENT = {
  privacy: `
# Privacy Intelligence Protocol
**Operational Level: Grade-A Secure**

At Krypto AI, your professional DNA and career metadata are treated with absolute architectural integrity. Our infrastructure is built on the principle of \"Data Zero,\" ensuring that your personal identifiers are never commoditized.

- **Data Encapsulation**: All uploaded resumes and personality metrics are encrypted in transit via TLS 1.3 and at rest using AES-256 protocols.
- **Neural Isolation**: We operate a strict firewall between user data and model training. Your unique professional history is used exclusively to power your individual Career Architecture simulations and is never used to train third-party LLMs.
- **Identity Obfuscation**: Any visual data, including headshots or PII (Personally Identifiable Information) detected in document scans, is processed in volatile memory and purged immediately after the simulation concludes.
- **Vault Sovereignty**: You retain 100% legal ownership of your career vault. At any moment, you may trigger a \"Hard Purge,\" which executes a recursive deletion of all session logs and optimized assets from our nodes.
  `,
  terms: `
# Terms of Usage & Engagement
**Architectural Agreement v5.0**

By initializing a session with Krypto AI, you agree to the following rigorous operational parameters. Any violation of these terms may result in immediate terminal suspension.

- **Non-Malicious Optimization**: Krypto AI is designed for professional enhancement. Users are strictly prohibited from using the platform to generate fraudulent credentials, misrepresent identities, or maliciously attempt to disrupt automated recruitment systems through \"prompt injection\" techniques in resumes.
- **Neural Protection**: Users agree not to scrape, reverse-engineer, or attempt \"model extraction\" on our proprietary Career Path Logic or the Krypto Intelligence Layer.
- **Credit Allocation & Ledger**: Usage of high-performance neural compute is subject to the Krypto Unit Ledger. Credits are consumed upon successful inference and are non-transferable.
- **Professional Liability**: While our simulations use 2026 market signals and RIASEC psychometrics to provide elite-level guidance, these results are strategic projections and do not constitute a guarantee of legal employment or salary contracts.
  `,
  cookies: `
# Cookie & Session Protocol
**Persistence & Verification Layers**

Krypto AI utilizes essential persistence identifiers to ensure your career trajectory remains synchronized across the global network.

- **Vault Synchronization**: Small-footprint identifiers are used to maintain your session state across secure labs (Resume Scorer to Interview Lab).
- **Security Tokens**: Necessary for identity verification and protecting your Ledger credits from unauthorized access.
- **Global Load Balancing**: Anonymous metadata is used to route your request to the nearest compute node, ensuring low-latency neural responses.
- **Zero Third-Party Tracking**: We do not allow external trackers or marketing cookies within the Career Vault environment. Your professional journey remains private and focused.
  `,
  compliance: `
# Global Compliance & Intellectual Property
**Legal Sovereignty Node 2026**

Krypto AI adheres to the leading global standards in AI ethics and data protection sovereignty.

- **IP Protection**: All brand assets, including the \"KryptonPath\" identity, \"Krypto AI\" neural engine, and \"Executive Blueprint\" templates, are the exclusive intellectual property of KryptonPath. Unauthorized reproduction or commercial resale of our platform's logic is strictly prohibited.
- **AI Ethics Framework**: Our models are audited monthly for socioeconomic bias to ensure that our \"Recruitment Index\" provides meritocratic assessments regardless of geography or background.
- **Regulatory Alignment**: Fully aligned with GDPR (EU), CCPA (USA), and emerging global AI safety frameworks.
- **Attribution**: \"Crafted by KryptonPath\" represents our commitment to architectural excellence in career technology. All AI-generated outputs for users are licensed for personal professional development.
  `
};

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

  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const getPoint = (i: number, factor: number) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const distance = (factor / max) * r;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const points = labels.map((label, i) => getPoint(i, scores[label]));
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto flex items-center justify-center select-none group/radar bg-zinc-950/40 rounded-[64px] border border-zinc-900 shadow-inner">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <filter id="sci-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id="data-pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => (
          <circle key={`circle-${idx}`} cx={center} cy={center} r={r * lvl} className="fill-none stroke-zinc-800/10" strokeWidth="0.5" />
        ))}

        {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => {
          const gridPoints = labels.map((_, i) => `${getPoint(i, lvl * max).x},${getPoint(i, lvl * max).y}`).join(' ');
          return <polygon key={`hex-${idx}`} points={gridPoints} className={`fill-none ${idx % 2 === 0 ? 'stroke-zinc-800/60' : 'stroke-zinc-800/25'}`} strokeWidth={idx === 4 ? "4" : "1.5"} />;
        })}

        {labels.map((_, i) => {
          const p = getPoint(i, max);
          return <line key={`spoke-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-zinc-800/50" strokeWidth="2" />;
        })}

        <g className={`transition-transform duration-500 ease-in-out ${activeIdx !== null ? 'scale-110' : ''}`} style={{ transformOrigin: 'center center', filter: activeIdx !== null ? 'url(#sci-glow)' : 'none' }}>
          <polygon points={polygonPath} className="stroke-yellow-500 fill-yellow-500/15" style={{ strokeWidth: '6', strokeLinejoin: 'round' }} />
          <polygon points={polygonPath} className="fill-[url(#data-pulse-grad)] animate-pulse" />
        </g>

        {labels.map((label, i) => {
          const scorePoint = getPoint(i, scores[label]);
          const labelDistFactor = max + 26;
          const labelPoint = getPoint(i, labelDistFactor);
          const isActive = activeIdx === i;

          return (
            <g key={i}>
              <circle cx={labelPoint.x} cy={labelPoint.y} r="60" fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(isActive ? null : i)}
                onTouchStart={() => setActiveIdx(i)} />
              
              <g className="pointer-events-none transition-all duration-500 ease-out" transform={isActive ? `translate(${labelPoint.x}, ${labelPoint.y}) scale(1.3) translate(${-labelPoint.x}, ${-labelPoint.y})` : ''}>
                <text x={labelPoint.x} y={labelPoint.y} className={`text-[16px] font-black uppercase tracking-[0.2em] ${isActive ? 'fill-yellow-400' : 'fill-zinc-400'}`} textAnchor="middle" alignmentBaseline="middle" style={{ textShadow: isActive ? '0 0 20px rgba(234, 179, 8, 1)' : 'none' }}>
                  {label}
                </text>
              </g>

              {isActive && (
                <g className="animate-in fade-in zoom-in duration-300 pointer-events-none">
                  {(() => {
                    const midX = (center + labelPoint.x) / 2;
                    const midY = (center + labelPoint.y) / 2;
                    return (
                      <>
                        <line x1={center} y1={center} x2={labelPoint.x} y2={labelPoint.y} className="stroke-yellow-500/40" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx={scorePoint.x} cy={scorePoint.y} r={8} className="fill-yellow-500 shadow-xl shadow-yellow-500" />
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect x="-28" y="-16" width="56" height="32" rx="12" className="fill-zinc-950 stroke-yellow-500" strokeWidth="3" />
                          <text className="fill-yellow-500 font-black text-[18px]" textAnchor="middle" alignmentBaseline="middle">{scores[label]}</text>
                        </g>
                      </>
                    );
                  })()}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-zinc-800 rounded-tl-3xl"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-zinc-800 rounded-br-3xl"></div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, messages, setMessages, onNewChat, onVerifyLocation, onUpdateLocation }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [openSubFeatures, setOpenSubFeatures] = useState<string | null>(null);
  const [activePolicy, setActivePolicy] = useState<keyof typeof POLICY_CONTENT | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Precision Scrolling Refs
  const atsFirstAttrRef = useRef<HTMLDivElement>(null);
  const careerFirstAttrRef = useRef<HTMLDivElement>(null);
  const outreachFirstAttrRef = useRef<HTMLDivElement>(null);
  const interviewFirstAttrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (openSubFeatures) {
      const targetMap: Record<string, React.RefObject<HTMLDivElement>> = {
        'ats': atsFirstAttrRef,
        'career': careerFirstAttrRef,
        'outreach': outreachFirstAttrRef,
        'interview': interviewFirstAttrRef
      };

      const activeRef = targetMap[openSubFeatures];
      if (activeRef?.current) {
        setTimeout(() => {
          activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [openSubFeatures]);

  useEffect(() => {
    const initChatSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const session = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        setChatSession(session);
      } catch (error) {
        console.error("Chat session initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initChatSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        setFileData(mammothResult.value);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        setFileData({ data: base64, mimeType: file.type });
      } else {
        const text = await file.text();
        setFileData(text);
      }
    } catch (err) {
      console.error("File processing error", err);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNewChatClick = () => {
    onNewChat();
    removeFile();
    setCurrentInput('');
    const initChatSession = async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const session = ai.chats.create({ model: 'gemini-3-flash-preview', config: { systemInstruction: SYSTEM_INSTRUCTION }});
        setChatSession(session);
    };
    initChatSession();
  };

  const analyzeAndIntercept = (prompt: string): Message | null => {
    const lowerPrompt = prompt.toLowerCase();

    const featureMap: { keywords: string[], tab: TabType, message: string, buttonLabel: string }[] = [
        {
            keywords: ['resume', 'cv', 'ats', 'score my resume', 'review my cv'],
            tab: 'Resume Scorer',
            message: "For a comprehensive resume analysis, including an ATS score and line-by-line improvements, I highly recommend our **Resume Scorer** lab. It provides a much deeper audit than a standard chat.",
            buttonLabel: 'Go to Resume Scorer'
        },
        {
            keywords: ['career path', 'what job', 'personality', 'riasec', 'my future job'],
            tab: 'Career Path',
            message: "To discover career paths that align with your unique personality, our **Career Path DNA Mapping** tool is the perfect instrument. It uses a psychometric quiz to provide tailored recommendations.",
            buttonLabel: 'Go to Career Path'
        },
        {
            keywords: ['outreach', 'cold email', 'linkedin message', 'networking'],
            tab: 'Outreach Architect',
            message: "Crafting the perfect networking message is an art. Our **Outreach Architect** is specifically designed for this, using real-time company data to create high-conversion messages.",
            buttonLabel: 'Go to Outreach Architect'
        },
        {
            keywords: ['interview', 'mock interview', 'interview prep'],
            tab: 'Interview Lab',
            message: "For targeted interview practice, I recommend using the **Interview Simulation Lab**. It can generate company-specific questions and simulate various interview formats for a more realistic experience.",
            buttonLabel: 'Go to Interview Lab'
        }
    ];

    for (const feature of featureMap) {
        if (feature.keywords.some(kw => lowerPrompt.includes(kw))) {
            return {
                role: 'model',
                content: feature.message,
                action: { tab: feature.tab, label: feature.buttonLabel }
            };
        }
    }

    const outOfScopeKeywords = ['poem', 'joke', 'story', 'weather', 'president', 'recipe', 'song', 'movie', 'game', 'translate', 'love', 'date', 'personal advice', 'who are you'];
    if (outOfScopeKeywords.some(kw => lowerPrompt.includes(kw))) {
        return {
            role: 'model',
            content: "My apologies, but my protocols are strictly dedicated to being your Career Architect. Requests outside of professional development, recruitment, and career strategy are beyond my scope. How can I assist with your career goals today?"
        };
    }

    return null;
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!chatSession) return;
    
    const userMessage: Message = {
      role: 'user',
      content: suggestion,
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
  
    try {
      const response = await chatSession.sendMessage({ message: suggestion });
      let responseText = response.text || "Sorry, I couldn't generate a response.";
      let suggestions: string[] = [];
  
      const suggestionSeparator = /%+\s*Suggestions:/i;
      if (suggestionSeparator.test(responseText)) {
        const parts = responseText.split(suggestionSeparator);
        responseText = parts[0].trim();
        suggestions = parts[1] ? parts[1].split('|').map(s => s.trim()).filter(Boolean) : [];
      }
      setMessages(prev => [...prev, { role: 'model', content: responseText, suggestions }]);
    } catch (error) {
      console.error("Chat submission error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "An error occurred while communicating with the neural engine. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!currentInput.trim() && !attachedFile) || !chatSession) return;
    
    const userMessage: Message = {
      role: 'user',
      content: currentInput,
      file: attachedFile ? { name: attachedFile.name } : undefined
    };
    setMessages(prev => [...prev, userMessage]);

    const interceptMessage = analyzeAndIntercept(currentInput);
    if (interceptMessage) {
        setMessages(prev => [...prev, interceptMessage]);
        setCurrentInput('');
        removeFile();
        return;
    }

    setLoading(true);
    setCurrentInput('');
    setAttachedFile(null);

    try {
      const contents: any[] = [];
      if (fileData) {
        if (typeof fileData === 'string') {
          contents.push({ text: `Attached Document Content:\n${fileData}` });
        } else {
          contents.push({ inlineData: fileData });
        }
      }
      contents.push({ text: currentInput });
      
      const response = await chatSession.sendMessage({ message: currentInput });
      let responseText = response.text || "Sorry, I couldn't generate a response.";
      let suggestions: string[] = [];

      const suggestionSeparator = /%+\s*Suggestions:/i;
      if (suggestionSeparator.test(responseText)) {
          const parts = responseText.split(suggestionSeparator);
          responseText = parts[0].trim();
          suggestions = parts[1] ? parts[1].split('|').map(s => s.trim()).filter(Boolean) : [];
      }
            
      setMessages(prev => [...prev, { role: 'model', content: responseText, suggestions }]);

    } catch (error) {
      console.error("Chat submission error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "An error occurred while communicating with the neural engine. Please try again." }]);
    } finally {
      setLoading(false);
      setFileData(null);
      removeFile();
    }
  };

  const BrandedScreenshot = ({ title, intro, children, className, containerRef }: { title: string, intro: string, children?: React.ReactNode, className?: string, containerRef?: React.RefObject<HTMLDivElement> }) => (
    <div ref={containerRef} className={`flex flex-col gap-8 items-center ${className}`}>
      <p className="text-center text-zinc-300 font-normal max-w-2xl mx-auto text-lg leading-relaxed">{intro}</p>
      <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[32px] p-2 shadow-2xl backdrop-blur-sm">
        <div className="bg-black rounded-[24px] overflow-hidden border border-zinc-900">
          <div className="h-10 bg-zinc-900/80 flex items-center px-6 border-b border-zinc-800/50">
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em]">{title}</span>
          </div>
          <div className="p-6 text-zinc-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  const sampleScores: PersonalityTraitScores = {
    analytic: 40,
    creative: 25,
    leadership: 30,
    social: 45,
    practical: 10,
    investigative: 20,
  };
  
  const dnaCode = `KRYP-A${sampleScores.analytic}C${sampleScores.creative}L${sampleScores.leadership}S${sampleScores.social}P${sampleScores.practical}I${sampleScores.investigative}`;

  const score = 62;
  const getScoreColors = (s: number) => s <= 35 ? { stroke: 'stroke-red-500', text: 'text-red-500' } : s <= 75 ? { stroke: 'stroke-yellow-500', text: 'text-yellow-500' } : { stroke: 'stroke-green-500', text: 'text-green-500' };
  const scoreColors = getScoreColors(score);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-32 pb-40">
      <div className="text-center space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="space-y-4">
          <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-100 uppercase">
            Engineer Your <br /><span className="gold-text-gradient">Career DNA.</span>
          </h2>
          <p className="text-zinc-500 text-lg sm:text-xl font-black max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.4em]">
            The Intelligence Layer for Professional Identity Architecture.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto relative mt-12">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[40px] p-2 focus-within:border-yellow-500/40 focus-within:ring-[12px] focus-within:ring-yellow-500/5 transition-all shadow-3xl backdrop-blur-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="h-[450px] overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <KryptoLogo size={16} />
                    </div>
                  )}
                  <div className={`max-w-md p-4 rounded-[24px] ${msg.role === 'user' ? 'bg-yellow-500 text-zinc-950 rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                    {msg.file && (
                      <div className="mb-2 p-2 bg-black/10 rounded-lg flex items-center gap-2 text-xs font-bold border border-black/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        <span>{msg.file.name}</span>
                      </div>
                    )}
                    <div className={`${msg.role === 'user' ? '' : 'prose-krypto'} prose-sm text-inherit`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.action && (
                      <div className="mt-4">
                        <button
                          onClick={() => setActiveTab?.(msg.action!.tab)}
                          className="px-6 py-3 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-lg border-b-2 border-zinc-300"
                        >
                          {msg.action.label}
                        </button>
                      </div>
                    )}
                    {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && !loading && index === messages.length - 1 && (
                      <div className="mt-6 pt-4 border-t border-zinc-700/50 flex flex-wrap gap-2">
                        {msg.suggestions.map((suggestion, sIndex) => (
                          <button
                            key={sIndex}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-5 py-2.5 bg-transparent border border-yellow-500/40 text-yellow-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500/10 transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <KryptoLogo size={16} />
                  </div>
                  <div className="max-w-md p-4 rounded-[24px] bg-zinc-800 text-zinc-300 rounded-bl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800/50">
              {attachedFile && (
                <div className="px-2 pb-3 flex items-center gap-3 relative z-10">
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1.5 animate-in slide-in-from-left-4">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest truncate max-w-[200px]">{attachedFile.name}</span>
                    <button type="button" onClick={removeFile} className="ml-1 hover:text-white text-yellow-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {messages.length > 1 && !loading && (
                   <button type="button" onClick={handleNewChatClick} className="p-3.5 bg-yellow-500 text-zinc-950 rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all shadow-lg animate-in zoom-in-95 duration-200 flex items-center justify-center border-b-2 border-yellow-700" title="Start New Chat">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12m6-6H6" /></svg>
                  </button>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-zinc-500 hover:text-yellow-500 transition-all bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-yellow-500/30 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <input 
                  type="text" 
                  value={currentInput} 
                  onChange={(e) => setCurrentInput(e.target.value)} 
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                  className="w-full bg-transparent border-none focus:outline-none text-zinc-100 text-sm font-medium py-3 placeholder:transition-opacity placeholder:duration-500"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
                />
                <button type="submit" disabled={loading || (!currentInput.trim() && !attachedFile)} className="px-6 py-4 bg-yellow-500 text-zinc-950 rounded-[20px] hover:bg-yellow-400 active:scale-95 transition-all shadow-lg disabled:opacity-30 flex items-center justify-center border-b-4 border-yellow-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,image/*" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center mt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">
          The <span className="gold-text-gradient">Krypto Labs</span>
        </h3>
        <p className="text-zinc-600 font-medium max-w-xl mx-auto uppercase text-[10px] tracking-[0.3em]">Access specialized architectural modules to accelerate your career evolution.</p>
      </div>
      
      {/* LABS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Lab 1: ATS Optimization */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden ${openSubFeatures === 'ats' ? 'bg-zinc-900 border-yellow-500/40 shadow-2xl scale-[1.02]' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">Architecture Suite</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">ATS <span className="gold-text-gradient">Optimizer</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setOpenSubFeatures(openSubFeatures === 'ats' ? null : 'ats')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                {openSubFeatures === 'ats' ? 'Hide Details' : 'View Attributes'}
              </button>
              <button onClick={() => setActiveTab?.('Resume Scorer')} className="flex-1 py-4 bg-yellow-500 text-zinc-950 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 border-b-4 border-yellow-700 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 2: Career DNA Mapping */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden ${openSubFeatures === 'career' ? 'bg-zinc-900 border-blue-500/40 shadow-2xl scale-[1.02]' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-blue-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 16C12 16 16 17 16 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 8C12 8 8 7 8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Market Intelligence</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">DNA <span className="gold-text-gradient">Mapping</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Map personality vectors to global talent shifts. Get deep market signals, city topography, business hub analysis, and precise salary benchmarks.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setOpenSubFeatures(openSubFeatures === 'career' ? null : 'career')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                {openSubFeatures === 'career' ? 'Hide Details' : 'View Attributes'}
              </button>
              <button onClick={() => setActiveTab?.('Career Path')} className="flex-1 py-4 bg-blue-500 text-zinc-100 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-400 border-b-4 border-blue-700 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 3: Outreach Architect */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden ${openSubFeatures === 'outreach' ? 'bg-zinc-900 border-yellow-500/40 shadow-2xl scale-[1.02]' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-yellow-500 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L7.89 11.26C9.93 12.64 12.63 13.03 14.9 12.16L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 8V16C21 18.2091 19.2091 20 17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">Outreach Suite</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Conversation <span className="gold-text-gradient">Forge</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">High-conversion protocols for cold networking. We research company trajectory in real-time to craft messages that guarantee engagement.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setOpenSubFeatures(openSubFeatures === 'outreach' ? null : 'outreach')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                {openSubFeatures === 'outreach' ? 'Hide Details' : 'View Attributes'}
              </button>
              <button onClick={() => setActiveTab?.('Outreach Architect')} className="flex-1 py-4 bg-yellow-500 text-zinc-950 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 border-b-4 border-yellow-700 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 4: Interview Simulation */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden ${openSubFeatures === 'interview' ? 'bg-zinc-900 border-blue-500/40 shadow-2xl scale-[1.02]' : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-blue-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Simulation Lab</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Interview <span className="gold-text-gradient">Simulator</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Battle-test your responses in specific technical and behavioral environments. Get real-time neural feedback on your hiring readiness.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setOpenSubFeatures(openSubFeatures === 'interview' ? null : 'interview')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                {openSubFeatures === 'interview' ? 'Hide Details' : 'View Attributes'}
              </button>
              <button onClick={() => setActiveTab?.('Interview Lab')} className="flex-1 py-4 bg-blue-500 text-zinc-100 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-400 border-b-4 border-blue-700 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>
      </div>
      
      {/* DETAILED FEATURES SECTIONS (Rendered below grid when open) */}
      <div className="space-y-32">
        {/* Detail: ATS Optimization Lab */}
        {openSubFeatures === 'ats' && (
          <div className="w-full max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <BrandedScreenshot containerRef={atsFirstAttrRef} title="Recruitment Index" intro="Leverage a multi-dimensional algorithmic audit that quantifies your marketability. Our engine simulates the decision-making patterns of thousands of ATS systems and elite recruiters to verify your asset's competitive standing.">
              <div className="flex flex-col items-center gap-10">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                  <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r={radius} className="stroke-zinc-800" strokeWidth="12" fill="none" />
                      <circle
                          cx="50%" cy="50%"
                          r={radius}
                          className={`fill-none transition-all duration-1500 ease-out ${scoreColors.stroke}`}
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={scoreOffset}
                          strokeLinecap="round"
                      />
                  </svg>
                  <div className={`absolute inset-0 flex items-center justify-center flex-col`}>
                      <span className={`text-6xl font-black tracking-tighter ${scoreColors.text}`}>{score}</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${scoreColors.text}`}>Recruitment Index</span>
                  </div>
                </div>
                  <div className="w-full space-y-8">
                     {[
                        { l: 'Impact Quantization', v: 25, d: "Metric-driven accomplishments and quantifiable performance indicators.", color: 'bg-red-500' },
                        { l: 'Keyword Alignment', v: 35, d: "Industry-specific terminology and skill-set semantic density.", color: 'bg-yellow-500' },
                        { l: 'Recruiter Readability', v: 60, d: "Visual hierarchy optimization for the 6-second recruiter glance.", color: 'bg-blue-500' },
                        { l: 'ATS Parsability', v: 72, d: "Structural compliance with automated parsing and ranking algorithms.", color: 'bg-purple-500' }
                     ].map((item) => (
                       <div key={item.l}>
                           <div className="flex justify-between items-baseline">
                               <p className="text-sm font-black text-zinc-300 uppercase tracking-widest">{item.l}</p>
                               <p className="text-sm font-black text-zinc-300">{item.v}%</p>
                           </div>
                           <p className="text-xs font-medium text-zinc-500 mt-1">{item.d}</p>
                           <div className="mt-3 h-2 w-full bg-zinc-800 rounded-full">
                              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.v}%` }}></div>
                           </div>
                       </div>
                     ))}
                  </div>
              </div>
            </BrandedScreenshot>

            <BrandedScreenshot title="Executive Audit Findings" intro="Identify critical structural vulnerabilities that trigger rejection filters. Our diagnostic engine performs a granular sweep of your document's logic, tone, and hierarchy to meet the high bar of executive-level hiring teams.">
              <p className="text-zinc-300 font-medium leading-relaxed italic text-lg border-l-4 border-yellow-500 pl-6">
                \"Remove the dual phone number listing; one mobile number is sufficient and cleaner. Eliminate the 'Microsoft Office tools' from the Skills section immediately—it signals technological illiteracy for a Programmer II role. Consider switching to a single-column layout to ensure 100% parsing accuracy across older ATS systems, as the current split layout can sometimes confuse reading order. Remove 'Sample preparation' unless it refers to specific data sampling techniques, then specify the technology. Your summary lacks quantifiable impact; it must be re-engineered to lead with metrics.\"
              </p>
            </BrandedScreenshot>

            <BrandedScreenshot title="Impact Quantization Engine" intro="Convert passive task descriptions into measurable outcomes that demonstrate immediate ROI. By applying the Google XYZ architectural logic, we ensure every bullet point proves your technical value through data-driven performance indicators.">
                <div className="space-y-4">
                  <p className="text-xl font-black text-zinc-100 uppercase tracking-tight">Rewrite the DHI Mortgage bullet to quantify the efficiency gain rather than just stating the volume of actions.</p>
                  <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span><span className="text-xs font-black text-yellow-500 uppercase">Logic Tier 1</span></div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-8">
                  <div className="p-6 bg-red-500/5 border-l-4 border-red-500 rounded-r-2xl">
                    <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Original Deficiency</p>
                    <p className="text-zinc-400 italic">\"Prepares programs requiring a wide variety and over 100 internal processing actions.\"</p>
                  </div>
                  <div className="p-6 bg-green-500/5 border-l-4 border-green-500 rounded-r-2xl">
                    <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-2">Architected (XYZ Formula)</p>
                    <p className="font-bold text-zinc-100">ENGINEERED A MORTGAGE PROCESSING AUTOMATION SCRIPT HANDLING 100+ DAILY INTERNAL ACTIONS, REDUCING MANUAL DATA ENTRY TIME BY 30% USING PYTHON AND SQL.</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                  <p className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">Rationale / Why:</p>
                  <p className="text-zinc-400 text-sm">The original bullet describes a task (preparing programs). The improvement uses the XYZ formula to demonstrate value (time reduction) and specific tools, proving ROI to the employer.</p>
                </div>
            </BrandedScreenshot>

            <BrandedScreenshot title="Krypto Executive Blueprint" intro="Deploy a master-tier career asset engineered for maximum parsability and psychological impact. Our blueprint optimizes whitespace, semantic density, and typographic hierarchy to capture a recruiter's attention in the critical 6-second window.">
              <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-inner-lg max-w-full overflow-x-auto">
                  <div className="prose prose-slate">
                      <h1><b>JANE DOE</b></h1>
                      <h3><b>SENIOR SOFTWARE ENGINEER</b></h3>
                      <blockquote>
                        <p><b>San Francisco, CA</b> | <b>(123) 456-7890</b> | <b>jane.doe@email.com</b> | <b>linkedin.com/in/janedoe</b></p>
                      </blockquote>
                      <hr />
                      <h2><b>SUMMARY</b></h2>
                      <p>Results-driven Senior Software Engineer with 8+ years of experience architecting and deploying scalable backend systems. Proven ability to lead cross-functional teams in agile environments, resulting in a <b>40% reduction</b> in server costs and a <b>15% improvement</b> in application performance. Seeking to leverage expertise in cloud infrastructure and distributed systems to solve complex challenges at a forward-thinking tech company.</p>
                      <hr />
                      <h2><b>KEY SKILLS</b></h2>
                      <ul>
                        <li><b>Technical:</b> <b>Python</b>, Golang, Java, <b>AWS</b>, GCP, Docker, Kubernetes, Terraform</li>
                        <li><b>Strategic:</b> System Design, Microservices Architecture, CI/CD, Agile Methodologies</li>
                      </ul>
                      <hr />
                      <h2><b>PROFESSIONAL EXPERIENCE</b></h2>
                      <h3><b>Senior Software Engineer</b></h3>
                      <blockquote>
                          <p><b>Tech Solutions Inc.</b> | <b>San Francisco, CA</b> | <b>Jan 2020 – Present</b></p>
                      </blockquote>
                      <ul>
                          <li>Architected a new microservices-based platform using <b>Golang</b> and <b>Kubernetes</b>, improving system reliability by <b>99.95%</b> and supporting a <b>200% increase</b> in user traffic.</li>
                          <li>Led a team of <b>5 engineers</b> to migrate legacy infrastructure to AWS, reducing monthly operational costs by <b>$50,000</b>.</li>
                      </ul>
                  </div>
              </div>
            </BrandedScreenshot>
          </div>
        )}

        {/* Detail: Career DNA Mapping */}
        {openSubFeatures === 'career' && (
          <div className="w-full max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <BrandedScreenshot containerRef={careerFirstAttrRef} title="Career DNA: Market Topography" intro="Architect your career around high-yield economic corridors. We analyze the intersection of regional salary parity, emerging business hubs, and sector-specific demand to identify the precise locations where your skills command the highest premium.">
                 <div className="space-y-4 text-center max-w-sm mx-auto">
                     <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Detecting Local Salary Parity and Business Hubs.</p>
                     <button className="w-full py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-[10px]" onClick={onVerifyLocation}>Detect City</button>
                     <input type="text" placeholder="ENTER CITY NAME..." className="w-full py-4 bg-zinc-800 text-center rounded-full font-bold text-zinc-500 placeholder:text-zinc-700 outline-none focus:border-blue-500/50 border border-transparent transition-all" onChange={(e) => onUpdateLocation?.(e.target.value)} />
                     <button className="w-full py-4 bg-zinc-700 text-white rounded-full font-bold uppercase tracking-widest text-[10px]">Update City</button>
                 </div>
             </BrandedScreenshot>

              <BrandedScreenshot title="Career DNA: Protocol Selection" intro="Calibrate the AI's logic engine based on your specific career trajectory. Protocol selection ensures that our neural simulations apply the appropriate depth of analysis for leadership pivots or initial market entry.">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-6 bg-zinc-900 rounded-3xl text-center border border-zinc-800">
                     <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                         <svg viewBox="0 0 24 24" className="w-14 h-14">
                             <path d="M5 5.39C5 4.07 6.07 3 7.39 3H16.61C17.93 3 19 4.07 19 5.39V12C19 17.35 13.38 20.38 12.34 20.85C12.13 20.94 11.87 20.94 11.66 20.85C10.62 20.38 5 17.35 5 12V5.39Z" fill="#18181b" stroke="#eab308" strokeWidth="1.5"/>
                             <rect x="10" y="1" width="4" height="2" rx="1" fill="#eab308"/>
                             <path d="M9.5 12.5L11.5 14.5L15.5 10.5" stroke="black" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                             <path d="M9 12L11 14L15 10" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                         </svg>
                     </div>
                     <h4 className="font-black text-2xl text-white">EXPERIENCED</h4>
                     <p className="text-xs font-bold text-zinc-500 tracking-widest">STRATEGIC PIVOT • GROWTH MAPPING</p>
                     <button className="mt-6 w-full py-3 bg-yellow-500 text-black rounded-full font-bold uppercase text-[9px] tracking-widest">35 Credits</button>
                   </div>
                    <div className="p-6 bg-zinc-900 rounded-3xl text-center border border-zinc-800">
                     <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500 flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-12 h-12 text-black" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg></div>
                     <h4 className="font-black text-2xl text-white">FRESHER</h4>
                     <p className="text-xs font-bold text-zinc-500 tracking-widest">ACADEMIC ANALYSIS • POTENTIAL MAPPING</p>
                      <button className="mt-6 w-full py-3 bg-zinc-700 text-white rounded-full font-bold uppercase text-[9px] tracking-widest">25 Credits</button>
                   </div>
                 </div>
             </BrandedScreenshot>

             <BrandedScreenshot title="Neural Identity Sequence" intro="Capture your professional essence through a proprietary psychometric vector. This sequence acts as a digital fingerprint of your natural aptitude, mapping traits into a visualize strategic baseline.">
                 <RadarChart scores={sampleScores} />
                  <div className="text-center mt-8 space-y-4">
                     <div className="px-4 py-2 bg-zinc-800 rounded-full inline-block text-sm font-mono text-yellow-500 tracking-widest">{dnaCode}</div>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sequence representing your unique professional architecture.</p>
                 </div>
             </BrandedScreenshot>
          </div>
        )}

        {/* Detail: Outreach Architect */}
        {openSubFeatures === 'outreach' && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <BrandedScreenshot containerRef={outreachFirstAttrRef} title="Conversation Forge Protocol" intro="Break through the noise of standard networking with hyper-personalized engagement logic. Our engine identifies recent company milestones to craft high-status narratives that virtually guarantee a reply from decision-makers.">
              <div className="space-y-6">
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0"><KryptoLogo size={20} /></div>
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[24px] rounded-tl-none flex-1 space-y-4 shadow-lg">
                          <p className="text-xs font-black text-yellow-500 uppercase tracking-widest">AI Outreach Protocol Generated (94% Engagement Probability)</p>
                          <p className="text-zinc-300 leading-relaxed italic">\"Hi Jensen, I noticed NVIDIA's recent advancement in Blackwell architecture—it's a massive leap for real-time generative physics...\"</p>
                          <div className="p-3 bg-yellow-500/5 border-l-4 border-yellow-500 rounded-r-lg">
                              <p className="text-xs font-black text-yellow-500 uppercase">Strategic Hook Detection</p>
                              <p className="text-xs text-zinc-400">System identified current company milestone via real-time Google Search Study.</p>
                          </div>
                      </div>
                  </div>
              </div>
            </BrandedScreenshot>
          </div>
        )}

        {/* Detail: Interview Lab */}
        {openSubFeatures === 'interview' && (
          <div className="w-full max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <BrandedScreenshot containerRef={interviewFirstAttrRef} title="Interview Simulation Protocol" intro="Battle-test your composure in a simulated high-stakes environment. Calibrating the session protocol and complexity vector ensures you eliminate anxiety and perfect your responses through exposure to elite-level technical inquiries.">
              <div className="p-6 bg-zinc-800 rounded-3xl space-y-6">
                <div className="space-y-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Session Protocol</p>
                    <div className="p-4 bg-zinc-700 rounded-xl font-bold text-white flex justify-between items-center text-[10px] tracking-widest uppercase">BEHAVIORAL <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg></div>
                </div>
                 <div className="space-y-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Complexity Vector</p>
                    <div className="p-4 bg-zinc-700 rounded-xl font-bold text-white flex justify-between items-center text-[10px] tracking-widest uppercase">STANDARD <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg></div>
                </div>
                <button onClick={() => setActiveTab?.('Interview Lab')} className="w-full py-4 bg-yellow-500 text-black rounded-full font-bold text-[10px] tracking-widest uppercase">Initialize Simulation (15 Credits)</button>
              </div>
            </BrandedScreenshot>

            <BrandedScreenshot title="Personalized Worthiness Score" intro="Quantify your cultural compatibility through attitudinal mapping. This score predicts your resilience within a specific organizational structure, providing a definitive signal on whether a company is a high-potential environment for your archetype.">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-12">
                <div className="lg:col-span-1 flex flex-col items-center text-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r={60} className="stroke-zinc-900 fill-none" strokeWidth="8" />
                      <circle cx="50%" cy="50%" r={60} className="stroke-green-500 fill-none" strokeWidth="8" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={(2 * Math.PI * 60) - (88 / 100) * (2 * Math.PI * 60)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-5xl font-black tracking-tighter text-green-500">88</span></div>
                  </div>
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-green-500">High Potential</p>
                </div>
                <div className="lg:col-span-2">
                  <div className="prose-krypto text-zinc-300">
                    <ReactMarkdown>{`**Disclaimer:** This Worthiness Score is a personalized index calculated by simulating your attitudinal responses against real-world, data-driven challenges.\n\n### Final Verdict\nYour profile shows a high probability of success and longevity within this specific organizational structure.`}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </BrandedScreenshot>
          </div>
        )}
      </div>


      {/* Testimonials */}
      <div className="pt-32 border-t border-zinc-900">
        <div className="text-center mb-24">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Executive Testimonials</span>
          <h3 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Trusted by <br /><span className="gold-text-gradient">Global Career Architects</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: "Priya Sharma", role: "Sr. SDE @ Bangalore Tech Hub", text: "I was on the fence about a senior role at a top firm. The **Personalized Worthiness Score** gave me an 88%, highlighting my fit for their 'scope creep' problem. That insight was the key—I tailored my final interview answers around it and secured the offer.", imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
             { name: "Maria Garcia", role: "Marketing to Product Strategy @ Fusion Dynamics", text: "Pivoting careers felt impossible. Krypto's **Personalized Strategy** feature gave me a 6-month, step-by-step blueprint. It wasn't just advice; it was a tactical roadmap from course selection to resume re-engineering. Absolutely essential.", imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80" },
             { name: "David Chen", role: "Data Scientist @ QuantumLeap", text: "My resume was getting zero traction. The **Resume Architect** rebuilt it using the XYZ formula. The difference was night and day. Went from no replies to three interviews in one week. The impact quantization is a cheat code.", imgSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" }
           ].map((r, i) => (
             <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[48px] space-y-8 hover:bg-zinc-900/60 transition-all">
                <div className="flex text-yellow-500 gap-1">{'★★★★★'.split('').map((s, idx) => <span key={idx}>{s}</span>)}</div>
                <p className="text-zinc-400 text-base italic font-medium leading-relaxed prose-krypto">
                  <ReactMarkdown>{`\"${r.text}\"`}</ReactMarkdown>
                </p>
                <div className="pt-6 border-t border-zinc-800 flex items-center gap-4">
                  <img 
                    src={r.imgSrc} 
                    alt={r.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700/50"
                  />
                  <div>
                    <p className="text-zinc-100 font-black text-[10px] uppercase tracking-widest">{r.name}</p>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{r.role}</p>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <footer className="pt-48 pb-24 border-t border-zinc-900/50 relative overflow-hidden bg-gradient-to-b from-transparent to-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 items-start">
            <div className="md:col-span-5 space-y-10">
              <div className="group cursor-default inline-flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-yellow-500/40 to-transparent shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <img src="https://i.postimg.cc/7YdGjhgV/IMG-1149.jpg" alt="KryptonPath Logo" className="w-full h-full rounded-full object-cover border-2 border-zinc-950" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tighter gold-text-gradient uppercase leading-none">KryptonPath</h4>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Architecture • Intelligence • Career</p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm">Engineering the next generation of professional identity through high-precision recruitment protocols. Crafted with absolute technical rigor by <span className="text-zinc-300">KryptonPath</span>.</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/1AeBLY3qN2/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-yellow-500 hover:border-yellow-500/30 transition-all cursor-pointer group"><svg className="w-5 h-5 fill-current opacity-60 group-hover:opacity-100" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg></a>
                <a href="https://www.instagram.com/kryptonpath?igsh=MTdtem9jMXd5amluNw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-yellow-500 hover:border-yellow-500/30 transition-all cursor-pointer group"><svg className="w-5 h-5 fill-current opacity-60 group-hover:opacity-100" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                <a href="https://www.linkedin.com/company/kryptonpath/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-yellow-500 hover:border-yellow-500/30 transition-all cursor-pointer group"><svg className="w-5 h-5 fill-current opacity-60 group-hover:opacity-100" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.3em] border-b border-zinc-800 pb-3">Products</h5>
                <nav className="flex flex-col gap-4">
                  {(['Home', 'Resume Scorer', 'Career Path', 'Outreach Architect', 'Interview Lab'] as TabType[]).map(item => (
                    <button key={item} onClick={() => { if (item === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' }); else setActiveTab?.(item); }} className="text-left text-xs font-bold text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest">{item}</button>
                  ))}
                </nav>
              </div>
              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.3em] border-b border-zinc-800 pb-3">Legal</h5>
                <nav className="flex flex-col gap-4">
                  {(['privacy', 'terms', 'cookies', 'compliance'] as const).map((slug) => (
                    <button key={slug} onClick={() => setActivePolicy(slug)} className="text-left text-xs font-bold text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest">{slug === 'cookies' ? 'Cookies' : slug.charAt(0).toUpperCase() + slug.slice(1)}</button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div className="mt-32 pt-12 border-t border-zinc-900/80 flex flex-col sm:flex-row justify-between items-center gap-8">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em]">© 2026 Krypto AI • All Rights Reserved</p>
            <div className="flex items-center gap-4">
               <div className="h-px w-12 bg-zinc-900"></div>
               <div className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span><span className="w-1.5 h-1.5 rounded-full bg-yellow-500/40 animate-pulse"></span><span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span></div>
               <div className="h-px w-12 bg-zinc-900"></div>
            </div>
            <div className="w-20 lg:block hidden"></div>
          </div>
        </div>
      </footer>

      {activePolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-400">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setActivePolicy(null)}></div>
           <div className="relative w-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-[64px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border-t-yellow-500/20">
              <div className="h-24 flex items-center justify-between px-12 border-b border-zinc-900 bg-zinc-900/30">
                 <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div><span className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.5em]">Intel Protocol: {activePolicy}</span></div>
                 <button onClick={() => setActivePolicy(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-yellow-500/40 transition-all group"><svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 sm:p-20 custom-scrollbar"><div className="prose prose-invert prose-krypto max-w-none"><ReactMarkdown>{POLICY_CONTENT[activePolicy]}</ReactMarkdown></div></div>
              <div className="h-20 flex items-center justify-between px-12 border-t border-zinc-900 bg-zinc-900/20"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Verified Compliance Node • 2026 Architectural Sync</p><button onClick={() => setActivePolicy(null)} className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-[8px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all">Acknowledge Protocol</button></div>
           </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;