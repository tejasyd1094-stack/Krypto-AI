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


// In-component type definition as per user constraints
interface PersonalityTraitScores {
  analytic: number;
  creative: number;
  leadership: number;
  social: number;
  practical: number;
  investigative: number;
}

// In-component RadarChart, replicated from CareerPath.tsx as per user constraints
const RadarChart = ({ scores }: { scores: PersonalityTraitScores }) => {
  const max = 50;
  const size = 500;
  const center = size / 2;
  const r = 170; // Larger radius for a bigger covered area
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


const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, messages, setMessages, onNewChat }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [openSubFeatures, setOpenSubFeatures] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChatSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const session = ai.chats.create({
          model: 'gemini-flash-lite-latest',
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
    // Re-initialize chat session for the new chat
    const initChatSession = async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const session = ai.chats.create({ model: 'gemini-flash-lite-latest', config: { systemInstruction: SYSTEM_INSTRUCTION }});
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
      const response = await chatSession.sendMessage({ message: [ { text: suggestion } ] });
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
      
      const response = await chatSession.sendMessage({ message: contents });
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

  const BrandedScreenshot = ({ title, intro, children, className }: { title: string, intro: string, children?: React.ReactNode, className?: string }) => (
    <div className={`flex flex-col gap-8 items-center ${className}`}>
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
      {/* Hero Section */}
      <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none text-zinc-100 uppercase">
          Welcome, <br /><span className="gold-text-gradient">Career Architect!</span>
        </h2>
        <p className="text-zinc-500 text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
          Your dedicated AI career coach. Let's engineer your professional trajectory, validate your assets, and secure market dominance.
        </p>
        
        <div className="max-w-3xl mx-auto relative mt-12">
          {/* Chatbot UI */}
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
        <h3 className="text-2xl font-black text-zinc-500 uppercase tracking-[0.4em]">
          Explore The Labs<span className="gold-text-gradient">. Engineer Your Dominance.</span>
        </h3>
      </div>
      
      <div className="space-y-32">
        {/* ATS Optimization Lab */}
        <div className="flex flex-col gap-12 items-center">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Architecture Suite</div>
            <div className="w-24 h-24 bg-zinc-900/50 rounded-full border-4 border-zinc-800 flex items-center justify-center mx-auto relative overflow-hidden">
                <svg className="w-12 h-12 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <svg className="w-5 h-5 text-yellow-500 absolute top-5 right-5 animate-spin" style={{ animationDuration: '4s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">ATS <span className="gold-text-gradient">Optimization Lab</span></h4>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => setOpenSubFeatures(openSubFeatures === 'ats' ? null : 'ats')} className="px-8 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-lg">
                {openSubFeatures === 'ats' ? 'Collapse Attributes' : 'Explore Attributes'}
                </button>
                <button onClick={() => setActiveTab?.('Resume Scorer')} className="px-8 py-4 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-lg border-b-2 border-yellow-700">
                Explore Resume Scorer
                </button>
            </div>
          </div>
          
          {openSubFeatures === 'ats' && (
            <div className="w-full max-w-4xl space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <BrandedScreenshot title="Recruitment Index" intro="Get an instant, data-driven audit of your resume's performance against thousands of ATS algorithms and recruiter patterns.">
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

              <BrandedScreenshot title="Executive Audit Findings" intro="Receive brutally honest, line-by-line feedback. Our AI identifies structural weaknesses that signal amateurism to executive recruiters.">
                <p className="text-zinc-300 font-medium leading-relaxed italic text-lg border-l-4 border-yellow-500 pl-6">
                  "Remove the dual phone number listing; one mobile number is sufficient and cleaner. Eliminate the 'Microsoft Office tools' from the Skills section immediately—it signals technological illiteracy for a Programmer II role. Consider switching to a single-column layout to ensure 100% parsing accuracy across older ATS systems, as the current split layout can sometimes confuse reading order. Remove 'Sample preparation' unless it refers to specific data sampling techniques, then specify the technology. Your summary lacks quantifiable impact; it must be re-engineered to lead with metrics."
                </p>
              </BrandedScreenshot>

              <BrandedScreenshot title="Impact Quantization Engine" intro="Transform your responsibilities into quantified achievements. We rebuild your experience using the Google XYZ formula to prove undeniable ROI to employers.">
                  <div className="space-y-4">
                    <p className="text-xl font-black text-zinc-100 uppercase tracking-tight">Rewrite the DHI Mortgage bullet to quantify the efficiency gain rather than just stating the volume of actions.</p>
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span><span className="text-xs font-black text-yellow-500 uppercase">Logic Tier 1</span></div>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-8">
                    <div className="p-6 bg-red-500/5 border-l-4 border-red-500 rounded-r-2xl">
                      <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Original Deficiency</p>
                      <p className="text-zinc-400 italic">"Prepares programs requiring a wide variety and over 100 internal processing actions."</p>
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

              <BrandedScreenshot title="Krypto Executive Blueprint" intro="Our final blueprint isn't just a template; it's an engineered asset. We automatically handle dozens of variables: single-column ATS parsability, keyword semantic density, concurrency logic for overlapping roles, standardized date formatting, and strategic whitespace for recruiter readability—so you don't have to.">
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
              
              <BrandedScreenshot title="Overseas Optimization Protocol" intro="Deploying for an international role? Activate the Overseas Protocol. We re-architect your resume to meet regional formatting standards and visa requirements, using real-time market data.">
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Company (for Keywords)</label>
                              <input type="text" readOnly value="Siemens" className="mt-2 w-full bg-zinc-800 rounded-xl p-3 font-bold text-sm text-zinc-300 border border-zinc-700"/>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Country</label>
                              <input type="text" readOnly value="Germany" className="mt-2 w-full bg-zinc-800 rounded-xl p-3 font-bold text-sm text-zinc-300 border border-zinc-700"/>
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visa Status</label>
                          <input type="text" readOnly value="Working Visa (Valid until 2028)" className="mt-2 w-full bg-zinc-800 rounded-xl p-3 font-bold text-sm text-zinc-300 border border-zinc-700"/>
                      </div>
                      <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em]">Deploy Customization (10 CR)</button>

                      <div className="mt-8 pt-6 border-t border-zinc-800/50">
                          <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Result Snippet: Header Re-Architecture</p>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                  <p className="text-[9px] font-bold text-red-400 uppercase mb-2">Before</p>
                                  <p className="text-xs text-zinc-400"><b>San Francisco, CA</b> | <b>(123) 456-7890</b></p>
                              </div>
                              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                  <p className="text-[9px] font-bold text-green-400 uppercase mb-2">After</p>
                                  <p className="text-xs text-zinc-200"><b>San Francisco, CA</b> | <b>Germany</b> | <b>Working Visa (Valid until 2028)</b></p>
                              </div>
                          </div>
                      </div>
                  </div>
              </BrandedScreenshot>

            </div>
          )}
        </div>

        {/* Career DNA Mapping */}
        <div className="flex flex-col gap-12 items-center">
           <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Market Intelligence</div>
            <div className="w-24 h-24 bg-zinc-900/50 rounded-full border-4 border-zinc-800 flex items-center justify-center mx-auto">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V7" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 17V21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="#a5b4fc" strokeWidth="1.5"/>
                    <path d="M12 16C12 16 16 17 16 21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 8C12 8 8 7 8 3" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="1.5" className="fill-yellow-400 animate-pulse" />
                    <circle cx="8" cy="3" r="1.5" className="fill-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <circle cx="16" cy="21" r="1.5" className="fill-yellow-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </svg>
            </div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Career <span className="gold-text-gradient">DNA Mapping</span></h4>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">Map personality vectors to global talent shifts. Get deep market signals, city topography, business hub analysis, and precise salary benchmarks.</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => setOpenSubFeatures(openSubFeatures === 'career' ? null : 'career')} className="px-8 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-lg">
                {openSubFeatures === 'career' ? 'Collapse Attributes' : 'Explore Attributes'}
                </button>
                <button onClick={() => setActiveTab?.('Career Path')} className="px-8 py-4 bg-blue-500 text-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 active:scale-95 transition-all shadow-lg border-b-2 border-blue-700">
                Explore Career Path
                </button>
            </div>
          </div>
          {openSubFeatures === 'career' && (
             <div className="w-full max-w-4xl space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <BrandedScreenshot title="Career DNA: Market Topography" intro="Pinpoint your next opportunity. Our system analyzes local salary parity, business hubs, and market demand to guide your job search geographically.">
                    <div className="space-y-4 text-center max-w-sm mx-auto">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Detecting Local Salary Parity and Business Hubs.</p>
                        <button className="w-full py-4 bg-white text-black rounded-full font-bold">DETECT CITY</button>
                        <input type="text" placeholder="ENTER CITY NAME..." className="w-full py-4 bg-zinc-800 text-center rounded-full font-bold text-zinc-500 placeholder:text-zinc-700"/>
                        <button className="w-full py-4 bg-zinc-700 text-white rounded-full font-bold">UPDATE CITY</button>
                    </div>
                </BrandedScreenshot>

                 <BrandedScreenshot title="Career DNA: Protocol Selection" intro="Choose your path. Whether you're a seasoned professional executing a strategic pivot or a fresher mapping your potential, our analysis adapts to your career stage.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 bg-zinc-900 rounded-3xl text-center border border-zinc-800">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-14 h-14">
                                <path d="M5 5.39C5 4.07 6.07 3 7.39 3H16.61C17.93 3 19 4.07 19 5.39V12C19 17.35 13.38 20.38 12.34 20.85C12.13 20.94 11.87 20.94 11.66 20.85C10.62 20.38 5 17.35 5 12V5.39Z" 
                                    fill="#18181b" 
                                    stroke="#eab308" 
                                    strokeWidth="1.5"
                                />
                                <rect x="10" y="1" width="4" height="2" rx="1" fill="#eab308"/>
                                <path d="M9.5 12.5L11.5 14.5L15.5 10.5" stroke="black" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 12L11 14L15 10" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                        </div>
                        <h4 className="font-black text-2xl text-white">EXPERIENCED</h4>
                        <p className="text-xs font-bold text-zinc-500 tracking-widest">STRATEGIC PIVOT • GROWTH MAPPING</p>
                        <button className="mt-6 w-full py-3 bg-yellow-500 text-black rounded-full font-bold">35 CREDITS</button>
                      </div>
                       <div className="p-6 bg-zinc-900 rounded-3xl text-center border border-zinc-800">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500 flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-12 h-12 text-black" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path d="M12 14l9-5-9-5-9 5 9 5z" stroke-linejoin="round"/></svg></div>
                        <h4 className="font-black text-2xl text-white">FRESHER</h4>
                        <p className="text-xs font-bold text-zinc-500 tracking-widest">ACADEMIC ANALYSIS • POTENTIAL MAPPING</p>
                         <button className="mt-6 w-full py-3 bg-zinc-700 text-white rounded-full font-bold">25 CREDITS</button>
                      </div>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Neural Identity Sequence" intro="Decode your professional DNA. Our psychometric quiz maps your core traits onto a unique neural sequence, revealing your natural professional architecture.">
                    <RadarChart scores={sampleScores} />
                     <div className="text-center mt-8 space-y-4">
                        <div className="px-4 py-2 bg-zinc-800 rounded-full inline-block text-sm font-mono text-yellow-500 tracking-widest">{dnaCode}</div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sequence representing your unique professional architecture.</p>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Archetype Decoding" intro="Understand your archetype. We translate your DNA code into a clear narrative, defining your core strengths and strategic value in the marketplace.">
                   <p className="text-lg font-bold text-zinc-200 leading-relaxed">"DNA Code: S15-A10-C10-L10-P0 (The Social Catalyst). Your profile exhibits a distinct 'Human-Bridge' configuration. With a dominant Social score (15) balanced by equal Analytic, Creative, and Leadership traits (10), you excel at translating complex value propositions into human narratives. The critical zero score in Practicality indicates a strong aversion to manual, repetitive operations or purely mechanical implementation; you belong in the layer of strategy and relationship."</p>
                </BrandedScreenshot>

                <BrandedScreenshot title="Ideal Role Alignment" intro="Discover your ideal role. We match your unique archetype to high-growth, emerging careers, providing a clear match percentage and localized salary benchmarks.">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-yellow-500 uppercase">Rank #1</p>
                    <h4 className="text-3xl font-black text-white">DECENTRALIZED COMMUNITY ARCHITECT (WEB3)</h4>
                    <p className="text-3xl font-black gold-text-gradient">94% ALIGNMENT</p>
                    <p className="text-zinc-400 leading-relaxed">This role capitalizes on your peak Social score (15) to manage distributed human networks, while your Creative (10) and Leadership (10) traits allow you to design governance models and engagement campaigns. The zero Practical score is mitigated as this role relies on digital influence rather than physical logistics.</p>
                    <div className="mt-6 p-6 bg-green-500/10 border-2 border-green-500/20 rounded-3xl text-center">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Comp Benchmark</p>
                        <p className="text-3xl font-black text-green-400">$60,000 - $115,000 USD</p>
                        <p className="text-xs font-bold text-zinc-500 uppercase">(Global Remote)</p>
                    </div>
                  </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Skill Blueprint" intro="Build your arsenal. Get a curated list of baseline skills and premium, industry-verified certifications to bridge the gap between your current profile and your target role.">
                  <div className="space-y-8">
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-4">Baseline Skills</p>
                        <div className="flex flex-wrap gap-3">
                          {["DAO Governance Tools (Snapshot, Tally)", "Discord/Telegram Architecture", "Crisis Communication", "Meme Theory & Viral Marketing", "Sentiment Analysis"].map(skill => <div key={skill} className="px-4 py-2 bg-zinc-800 rounded-full text-sm font-bold text-zinc-300">{skill}</div>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-4">Premium Certifications</p>
                        <div className="space-y-3">
                           {["Certified Blockchain Expert [Blockchain Council]", "Meta Social Media Marketing Professional Certificate [Coursera]", "Web3 Community Management [Udemy]"].map(cert => (
                             <div key={cert} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
                               <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-black"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>
                               <p className="text-sm font-bold text-zinc-300">{cert}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                  </div>
                </BrandedScreenshot>

                {/* Strategy Sub-Features */}
                <div className="pt-10 border-t border-zinc-800 text-center space-y-4">
                  <h4 className="text-2xl font-black uppercase tracking-widest gold-text-gradient">Strategic Blueprints</h4>
                  <p className="text-zinc-500">Actionable roadmaps to secure your target role.</p>
                </div>

                <BrandedScreenshot title="Strategy: Simulation Parameters" intro="Design your personal career roadmap. Input your budget, timeline, and daily commitment to generate a custom, step-by-step strategy for your next career move.">
                   <div className="space-y-6">
                      <button className="w-full py-4 bg-white text-black rounded-full font-bold text-sm">UNLOCK STRATEGY (10 CR)</button>
                      <div className="p-6 bg-zinc-800 rounded-3xl space-y-4">
                         <div className="grid grid-cols-3 gap-4 text-center">
                            <div><p className="text-xs text-zinc-500 font-bold">BUDGET ($)</p><input type="text" value="500" readOnly className="w-full bg-zinc-700 text-center p-2 rounded-lg font-bold text-lg"/></div>
                            <div><p className="text-xs text-zinc-500 font-bold">MONTHS</p><input type="text" value="6" readOnly className="w-full bg-zinc-700 text-center p-2 rounded-lg font-bold text-lg"/></div>
                            <div><p className="text-xs text-zinc-500 font-bold">DAILY HRS</p><input type="text" value="2" readOnly className="w-full bg-zinc-700 text-center p-2 rounded-lg font-bold text-lg"/></div>
                         </div>
                         <button className="w-full py-3 bg-yellow-500 text-black rounded-full font-bold">DEPLOY SIMULATION</button>
                      </div>
                      <button className="w-full py-4 bg-zinc-700 text-white rounded-full font-bold text-sm">MARKET INSIGHTS (10 CR)</button>
                   </div>
                </BrandedScreenshot>

                 <BrandedScreenshot title="Strategy: I. Executive Skill Matrix" intro="To secure a role as a Creative Technologist, you must bridge the gap between 'Art Director' and 'Machine Learning Engineer.' You are not building models from scratch; you are orchestrating them to solve creative problems.">
                    <div className="text-left space-y-4 prose prose-krypto">
                      <h3>Priority Technical Hard Skills</h3>
                      <ul>
                        <li>Workflow Orchestration: Mastery of ComfyUI for node-based Stable Diffusion workflows and automatic1111.</li>
                        <li>Python Scripting: Ability to write scripts to interact with APIs and automate creative pipelines.</li>
                      </ul>
                    </div>
                 </BrandedScreenshot>

                 <BrandedScreenshot title="Strategy: II. Tactical Learning Track" intro="A 6-month roadmap of specific, high-ROI courses with estimated costs and focus areas to build your skill matrix efficiently.">
                    <div className="text-left space-y-4 prose prose-krypto">
                      <p>Total Estimated Cost: $345 (Leaving $155 buffer for API credits)</p>
                      <h3>Month 1: The Foundation (Python & Prompting)</h3>
                      <ul>
                         <li>Course: 100 Days of Code: The Complete Python Pro Bootcamp</li>
                         <li>Platform: Udemy</li>
                         <li>Focus: Python basics, scripting, API interaction. You do not need to finish the whole course; focus on the first 45 days.</li>
                         <li>Cost: ~$15 (wait for sale)</li>
                      </ul>
                       <ul>
                         <li>Course: Prompt Engineering for Developers</li>
                         <li>Platform: DeepLearning.AI</li>
                         <li>Focus: Systematic prompt construction, avoiding hallucinations, formatting outputs.</li>
                         <li>Cost: Free</li>
                      </ul>
                      <h3>Month 2-3: Visual Generative AI</h3>
                      <p>...</p>
                    </div>
                 </BrandedScreenshot>

                <BrandedScreenshot title="Strategy: III. Resume Engineering" intro="Traditional creative resumes will not work. You must present yourself as a 'Technical Multiplier,' blending creative vision with technical execution.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <h3>Headline Strategy</h3>
                        <ul>
                          <li>Current: [Your Old Title]</li>
                          <li>Target: Generative AI Creative Technologist | AI Workflow Prototyper</li>
                        </ul>
                        <h3>Experience Bullet Point Optimization</h3>
                        <ul>
                          <li>Old: "Designed marketing assets for campaigns."</li>
                          <li>New: "Architected an automated content pipeline using Python and Stable Diffusion API, reducing asset production time by 40% while maintaining brand consistency via custom LoRA training."</li>
                          <li>Old: "Managed creative teams."</li>
                          <li>New: "Led AI adoption strategy, implementing RAG workflows to ensure generated copy adhered to brand voice."</li>
                        </ul>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Strategy: IV. The Job Blitz" intro="Do not rely on 'Easy Apply.' This role is too new; you must demonstrate competence, not just claim it.">
                     <div className="text-left space-y-4 prose prose-krypto">
                        <h3>The 'Trojan Horse' Portfolio</h3>
                        <ul>
                            <li>Strategy: Instead of a PDF portfolio, build a GitHub repository titled "GenAI-Creative-Toolkit."</li>
                            <li>Content: Include 3 clean, documented scripts:
                                <ul>
                                    <li>A script that converts a blog post into an Instagram caption and generates a matching image.</li>
                                    <li>A ComfyUI workflow JSON file for consistent character generation.</li>
                                    <li>A simple chatbot trained on a specific public domain document (e.g., a technical manual).</li>
                                </ul>
                            </li>
                        </ul>
                        <h3>Target Selection</h3>
                        <p>...</p>
                    </div>
                </BrandedScreenshot>

                 {/* Market Insight Sub-Features */}
                <div className="pt-10 border-t border-zinc-800 text-center space-y-4">
                  <h4 className="text-2xl font-black uppercase tracking-widest text-blue-400">Market Insights</h4>
                  <p className="text-zinc-500">Real-time intelligence on your target market.</p>
                </div>

                <BrandedScreenshot title="Market Insights: Executive Summary" intro="A real-time audit of the hiring landscape for the 'Generative AI Creative Technologist' role, providing a high-level summary of market status, key players, and emerging opportunities.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <p><strong>Date:</strong> January 21, 2026</p>
                        <p><strong>Status:</strong> Active & Expanding</p>
                        <p><strong>Currency:</strong> USD ($)</p>
                        <h3>Executive Summary</h3>
                        <p>The "Creative Technologist" role has evolved rapidly into a Generative AI-first discipline. The hiring landscape for early 2026 shows a clear bifurcation: <strong>Big Tech (Google)</strong> is hiring for high-fidelity prototyping and "magic" making, while <strong>Global Agencies (Media.Monks, WPP)</strong> are industrializing GenAI for content supply chains. A new corridor of opportunity has opened between <strong>San Francisco, London, and Bangalore</strong>.</p>
                    </div>
                </BrandedScreenshot>
                
                <BrandedScreenshot title="Market Insights: Top Active Employers" intro="Identify the top companies actively hiring, their strategic fit for your profile, and crucial intel on their culture and key projects.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <h3>1. Google Creative Lab</h3>
                        <ul>
                            <li><strong>Hiring Zone:</strong> New York, NY / Mountain View, CA (USA)</li>
                            <li><strong>Strategic Fit:</strong> The pinnacle of "Blue Sky" creative tech. They are currently seeking technologists to "make Google's magic more magical," moving beyond simple prompting to building bespoke GenAI prototypes that define future product interactions.</li>
                            <li><strong>Key Projects/Culture:</strong> Culture is described as a "start-up inside a giant." Expect to work on unreleased LLM tools, high-fidelity storytelling, and "Vibe Coding" (using AI to code).</li>
                        </ul>
                        <h3>2. Media.Monks</h3>
                        <p>...</p>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Market Insights: Salary Analysis" intro="Get salary ranges adjusted for 'Local Parity'—the buying power and standard market rate for top-tier talent in specific global hubs.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <p>Note: Salaries reflect "Local Parity"—the buying power and standard market rate for top-tier talent in that specific hub.</p>
                        <h3>Tier 1: United States (SF / NYC / LA)</h3>
                        <ul>
                            <li><strong>Junior / Mid-Level:</strong> $105,000 - $145,000</li>
                            <li><strong>Senior / Staff:</strong> $175,000 - $265,000+ (Google offers equity packages pushing this significantly higher)</li>
                            <li><strong>Insight:</strong> US salaries remain the global ceiling. The premium is paid for "Hybrid Talent"—engineers who have art school backgrounds.</li>
                        </ul>
                        <h3>Tier 2: United Kingdom / Europe (London / Lisbon)</h3>
                        <p>...</p>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Market Insights: Cultural Audit" intro="Understand the cultural shifts in engineering and creative teams, and the key differences between agency, product, and lab environments.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <h3>The "Vibe Coder" Shift</h3>
                        <p>Teams are moving away from pure syntax proficiency (writing C++ from scratch) to "Vibe Coding"—using AI cursors and LLMs to architect solutions. The value is now on system architecture and creative taste rather than rote coding.</p>
                        <h3>Agency vs. Product</h3>
                        <ul>
                            <li><strong>Agencies (WPP, Monks):</strong> Values speed, visual impact, and "never-been-done-before" buzz. High burnout risk but incredible portfolio building.</li>
                            <li><strong>Product/Lab (Google, frog):</strong> Values depth, usability, and human interaction. Slower pace, deeper focus on "why" we are building this.</li>
                        </ul>
                    </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Market Insights: Geographical Hubs" intro="Identify the key global cities for your target role and understand their specific function in the industry ecosystem.">
                    <div className="text-left space-y-4 prose prose-krypto">
                        <ul>
                            <li><strong>San Francisco / Silicon Valley:</strong> The "Brain" of the operation. Proximity to OpenAI and Google DeepMind makes this the hub for those building the tools and models.</li>
                            <li><strong>New York City / London:</strong> The "Showroom." Where the tech is applied to culture, advertising, and media.</li>
                            <li><strong>Bangalore:</strong> The "Engine Room." Rapidly shifting from back-end maintenance to high-fidelity prototyping and creative engineering.</li>
                            <li><strong>Los Angeles:</strong> The "Studio." The central hub for Generative Video, AI filmmaking, and synthetic media.</li>
                        </ul>
                        <h3>SOURCES</h3>
                        <p>...</p>
                    </div>
                </BrandedScreenshot>
             </div>
          )}
        </div>

        {/* Outreach Architect */}
        <div className="flex flex-col gap-12 items-center">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">Outreach Suite</div>
            <div className="w-24 h-24 bg-zinc-900/50 rounded-full border-4 border-zinc-800 flex items-center justify-center mx-auto">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L7.89 11.26C9.93 12.64 12.63 13.03 14.9 12.16L21 10" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 8V16C21 18.2091 19.2091 20 17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8Z" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M7 15L9 13" stroke="#fde047" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 15L15 13" stroke="#fde047" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Outreach <span className="gold-text-gradient">Architect</span></h4>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">High-conversion protocols for cold networking. We research company trajectory in real-time to craft messages that guarantee engagement.</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => setOpenSubFeatures(openSubFeatures === 'outreach' ? null : 'outreach')} className="px-8 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-lg">
                {openSubFeatures === 'outreach' ? 'Collapse Attributes' : 'Explore Attributes'}
                </button>
                <button onClick={() => setActiveTab?.('Outreach Architect')} className="px-8 py-4 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-lg border-b-2 border-yellow-700">
                Explore Outreach Architect
                </button>
            </div>
          </div>
           {openSubFeatures === 'outreach' && (
              <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                <BrandedScreenshot title="Conversation Forge Protocol" intro="Generate hyper-personalized messages that decision-makers cannot ignore. Our engine conducts a real-time 'Google Search Study' to find high-impact advancements and crafts a narrative that ensures a reply.">
                  <div className="space-y-6">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0"><KryptoLogo size={20} /></div>
                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[24px] rounded-tl-none flex-1 space-y-4 shadow-lg">
                              <p className="text-xs font-black text-yellow-500 uppercase tracking-widest">AI Outreach Protocol Generated (94% Engagement Probability)</p>
                              <p className="text-zinc-300 leading-relaxed italic">"Hi Jensen, I noticed NVIDIA's recent advancement in Blackwell architecture—it's a massive leap for real-time generative physics..."</p>
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
        </div>

        {/* Interview Simulation Lab */}
        <div className="flex flex-col gap-12 items-center">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">Simulation Lab</div>
            <div className="w-24 h-24 bg-zinc-900/50 rounded-full border-4 border-zinc-800 flex items-center justify-center mx-auto relative">
                <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="#1e3a8a"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 19v4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 23h8" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                </div>
            </div>
            <h4 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Interview <span className="gold-text-gradient">Simulation Lab</span></h4>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">Battle-test your responses in specific technical and behavioral environments. Neural feedback on your hiring bar readiness.</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => setOpenSubFeatures(openSubFeatures === 'interview' ? null : 'interview')} className="px-8 py-4 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-lg">
                {openSubFeatures === 'interview' ? 'Collapse Attributes' : 'Explore Attributes'}
                </button>
                <button onClick={() => setActiveTab?.('Interview Lab')} className="px-8 py-4 bg-blue-500 text-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 active:scale-95 transition-all shadow-lg border-b-2 border-blue-700">
                Explore Interview Lab
                </button>
            </div>
          </div>
            {openSubFeatures === 'interview' && (
              <div className="w-full max-w-4xl space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <BrandedScreenshot title="Interview Simulation Protocol" intro="Select your session type and complexity vector for a tailored mock interview experience. Our system generates questions based on real-world intel for your target company and role.">
                  <div className="p-6 bg-zinc-800 rounded-3xl space-y-6">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Session Protocol</p>
                        <div className="p-4 bg-zinc-700 rounded-xl font-bold text-white flex justify-between items-center">BEHAVIORAL <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg></div>
                    </div>
                     <div className="space-y-3">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Complexity Vector</p>
                        <div className="p-4 bg-zinc-700 rounded-xl font-bold text-white flex justify-between items-center">STANDARD <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg></div>
                    </div>
                    <button className="w-full py-4 bg-yellow-500 text-black rounded-full font-bold text-sm">INITIALIZE SIMULATION (15 CREDITS)</button>
                  </div>
                </BrandedScreenshot>

                <BrandedScreenshot title="Personalized Worthiness Score" intro="Go beyond standard prep. Our AI analyzes your cultural fit against a company's known pain points, generating a personalized 'Go/No-Go' Worthiness Score.">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 flex flex-col items-center text-center">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r={60} className="stroke-zinc-900 fill-none" strokeWidth="8" />
                          <circle 
                            cx="50%" 
                            cy="50%" 
                            r={60} 
                            className="stroke-green-500 fill-none" 
                            strokeWidth="8" 
                            strokeDasharray={2 * Math.PI * 60} 
                            strokeDashoffset={(2 * Math.PI * 60) - (88 / 100) * (2 * Math.PI * 60)} 
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl font-black tracking-tighter text-green-500">88</span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-green-500">
                        High Potential
                      </p>
                    </div>
                    <div className="lg:col-span-2">
                      <div className="prose-krypto text-zinc-300">
                        <ReactMarkdown>
                          {`**Disclaimer:** This Worthiness Score is a personalized index calculated by simulating your attitudinal responses against real-world, data-driven challenges specific to this role and organization.

### Your Simulated Performance
Your responses indicate a strong alignment with a pragmatic, results-oriented culture, showing resilience in high-pressure scenarios which directly counters the identified pain point of 'project scope creep'.

### Final Verdict
Your profile shows a high probability of success and longevity within this specific organizational structure.`}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </BrandedScreenshot>
              </div>
           )}
        </div>
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
                  <ReactMarkdown>{`"${r.text}"`}</ReactMarkdown>
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
    </div>
  );
};

export default Dashboard;