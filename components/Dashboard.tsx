import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';
import { GoogleGenAI, Chat } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { CheckCircle2, XCircle, Zap, Shield, Target, TrendingUp, Users, FileText, Briefcase, Cpu } from 'lucide-react';
import { KryptoLogo } from './Branding';
import { TabType, Message } from '../types';

const AnimatedCounter: React.FC<{ target: number, duration?: number, suffix?: string }> = ({ target, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return <div ref={elementRef}>{count.toLocaleString()}{suffix}</div>;
};

const CircularScorer: React.FC<{ score: number, label: string, color: string, subLabel: string }> = ({ score, label, color, subLabel }) => {
  const [currentScore, setCurrentScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / 2000, 1);
      setCurrentScore(progress * score);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, score]);

  const offset = circumference - (currentScore / 100) * circumference;

  return (
    <div ref={elementRef} className="flex flex-col items-center space-y-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-zinc-800/50"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-100`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white tracking-tighter">{Math.round(currentScore)}%</span>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{subLabel}</span>
        </div>
      </div>
      <div className="text-center">
        <h5 className="text-sm font-black text-white uppercase tracking-widest">{label}</h5>
      </div>
    </div>
  );
};

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
# Privacy Intelligence Framework
**Operational Level: Grade-A Secure**

At Krypto AI, your professional DNA and career metadata are treated with absolute strategic integrity. Our infrastructure is built on the principle of "Data Zero," ensuring that your personal identifiers are never commoditized.

- **Data Encapsulation**: All uploaded resumes and personality metrics are encrypted in transit via TLS 1.3 and at rest using AES-256 standards.
- **Neural Isolation**: We operate a strict firewall between user data and model training. Your unique professional history is used exclusively to power your individual Career Evolution simulations and is never used to train third-party LLMs.
- **Identity Obfuscation**: Any visual data, including headshots or PII (Personally Identifiable Information) detected in document scans, is processed in volatile memory and purged immediately after the simulation concludes.
- **Vault Sovereignty**: You retain 100% legal ownership of your career vault. At any moment, you may trigger a "Hard Purge," which executes a recursive deletion of all session logs and optimized assets from our nodes.
  `,
  terms: `
# Terms of Usage & Engagement
**Service Agreement v5.0**

By initializing a session with Krypto AI, you agree to the following rigorous operational parameters. Any violation of these terms may result in immediate terminal suspension.

- **Non-Malicious Optimization**: Krypto AI is designed for professional enhancement. Users are strictly prohibited from using the platform to generate fraudulent credentials, misrepresent identities, or maliciously attempt to disrupt automated recruitment systems through "prompt injection" techniques in resumes.
- **Neural Protection**: Users agree not to scrape, reverse-engineer, or attempt "model extraction" on our proprietary Career Path Logic or the Krypto Intelligence Layer.
- **Credit Allocation & Ledger**: Usage of high-performance neural compute is subject to the Krypto Unit Ledger. Credits are consumed upon successful inference and are non-transferable.
- **Professional Liability**: While our simulations use 2026 market signals and RIASEC psychometrics to provide elite-level guidance, these results are strategic projections and do not constitute a guarantee of legal employment or salary contracts.
  `,
  cookies: `
# Cookie & Session Framework
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

- **IP Protection**: All brand assets, including the "KryptonPath" identity, "Krypto AI" neural engine, and "Executive Blueprint" templates, are the exclusive intellectual property of KryptonPath. Unauthorized reproduction or commercial resale of our platform's logic is strictly prohibited.
- **AI Ethics Framework**: Our models are audited monthly for socioeconomic bias to ensure that our "Recruitment Index" provides meritocratic assessments regardless of geography or background.
- **Regulatory Alignment**: Fully aligned with GDPR (EU), CCPA (USA), and emerging global AI safety frameworks.
- **Attribution**: "Crafted by KryptonPath" represents our commitment to strategic excellence in career technology. All AI-generated outputs for users are licensed for personal professional development.
  `
};

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, messages, setMessages, onNewChat, onVerifyLocation, onUpdateLocation }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [activePolicy, setActivePolicy] = useState<keyof typeof POLICY_CONTENT | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.querySelector('section.overflow-y-auto')) {
      document.querySelector('section.overflow-y-auto')!.scrollTop = 0;
    }
  }, []);

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
            message: "Crafting the perfect networking message is an art. Our **Outreach Aspirant** is specifically designed for this, using real-time company data to create high-conversion messages.",
            buttonLabel: 'Go to Outreach Aspirant'
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
            content: "My apologies, but my systems are strictly dedicated to being your Career Aspirant. Requests outside of professional development, recruitment, and career strategy are beyond my scope. How can I assist with your career goals today?"
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

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-32 pb-40">
      <div className="text-center space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="space-y-4">
          <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-100 uppercase">
            Engineer Your <br /><span className="gold-text-gradient">Career DNA.</span>
          </h2>
          <p className="text-zinc-500 text-lg sm:text-xl font-black max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.4em]">
            The Intelligence Layer for Professional Identity Framework.
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
        <p className="text-zinc-600 font-medium max-w-xl mx-auto uppercase text-[10px] tracking-[0.3em]">Access specialized strategic modules to accelerate your career evolution.</p>
      </div>
      
      {/* LABS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Lab 1: ATS Optimization */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 shadow-xl`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">Aspirants Suite</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">ATS <span className="gold-text-gradient">Optimizer</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Turn your resume into a performance beast. We audit keywords, detect formatting discrepancies, and rebuild assets using the Google XYZ formula.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setActiveTab?.('Lab-ATS')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                View Attributes
              </button>
              <button onClick={() => setActiveTab?.('Resume Scorer')} className="flex-1 py-4 bg-transparent text-yellow-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500/10 border border-yellow-500/50 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 2: Career DNA Mapping */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 shadow-xl`}>
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
              <button onClick={() => setActiveTab?.('Lab-Career')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                View Attributes
              </button>
              <button onClick={() => setActiveTab?.('Career Path')} className="flex-1 py-4 bg-transparent text-blue-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/10 border border-blue-500/50 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 3: Outreach Architect */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 shadow-xl`}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-700"></div>
           <div className="space-y-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/40 transition-all duration-500 shadow-xl">
                  <svg className="w-8 h-8 text-zinc-500 group-hover:text-yellow-500 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L7.89 11.26C9.93 12.64 12.63 13.03 14.9 12.16L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 8V16C21 18.2091 19.2091 20 17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="space-y-3">
                 <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">Outreach Suite</span>
                 <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Conversation <span className="gold-text-gradient">Forge</span></h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">High-conversion strategies for cold networking. We research company trajectory in real-time to craft messages that guarantee engagement.</p>
              </div>
           </div>
           <div className="flex gap-4 mt-12 relative z-10">
              <button onClick={() => setActiveTab?.('Lab-Outreach')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                View Attributes
              </button>
              <button onClick={() => setActiveTab?.('Outreach Architect')} className="flex-1 py-4 bg-transparent text-yellow-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500/10 border border-yellow-500/50 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>

        {/* Lab 4: Interview Simulation */}
        <div className={`p-10 rounded-[56px] border transition-all duration-700 flex flex-col justify-between group relative overflow-hidden bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 shadow-xl`}>
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
              <button onClick={() => setActiveTab?.('Lab-Interview')} className="flex-1 py-4 bg-zinc-950 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all shadow-lg active:scale-95">
                View Attributes
              </button>
              <button onClick={() => setActiveTab?.('Interview Lab')} className="flex-1 py-4 bg-transparent text-blue-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/10 border border-blue-500/50 transition-all shadow-xl active:scale-95">
                Enter Lab
              </button>
           </div>
        </div>
      </div>

      {/* WHY USE KRYPTO LABS */}
      <div className="pt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">The Krypto Advantage</span>
          <h3 className="text-4xl sm:text-5xl font-black tracking-tight uppercase leading-tight">Why Use <br /><span className="gold-text-gradient">Krypto Labs</span></h3>
        </div>
        
        <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory custom-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {[
            { title: "Precision ATS Scoring", desc: "Our proprietary algorithm reverse-engineers enterprise Applicant Tracking Systems to ensure your resume never gets filtered out.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "Data-Driven DNA Mapping", desc: "We don't just guess your career path. We use RIASEC psychometrics combined with real-time market data to find your perfect fit.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { title: "Hyper-Personalized Outreach", desc: "Generate cold emails and LinkedIn messages that actually convert, tailored to the specific recruiter and company culture.", icon: "M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { title: "Neural Interview Feedback", desc: "Practice with our AI interviewer that adapts to your responses and provides actionable, real-time feedback on your delivery.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
            { title: "Bank-Grade Privacy", desc: "Your career data is encrypted and isolated. We operate on a strict Data Zero policy—your information is never used to train external models.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
          ].map((adv, i) => (
            <div key={i} className="min-w-[300px] sm:min-w-[400px] snap-center bg-zinc-900/40 border border-zinc-800 p-8 rounded-[40px] hover:bg-zinc-900/60 hover:border-yellow-500/30 transition-all group flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/50 transition-colors shadow-lg">
                <svg className="w-7 h-7 text-zinc-500 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={adv.icon} />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">{adv.title}</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON SECTION */}
      <div className="pt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Performance Benchmark</span>
          <h3 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">The <span className="gold-text-gradient">Krypto Edge</span></h3>
          <p className="text-zinc-500 text-sm font-medium mt-6 max-w-2xl mx-auto uppercase tracking-widest">Quantifying the strategic superiority of our neural systems against standard industry tools.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Scorer Container */}
          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-12 relative z-10">
              <CircularScorer 
                score={96} 
                label="Krypto AI" 
                color="text-yellow-500" 
                subLabel="Efficiency Index"
              />
              <div className="hidden sm:block h-32 w-px bg-zinc-800/50"></div>
              <CircularScorer 
                score={42} 
                label="Standard Industry Tools" 
                color="text-zinc-700" 
                subLabel="Efficiency Index"
              />
            </div>
            
            <div className="mt-16 border-t border-zinc-800/50 pt-12">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neural Accuracy</p>
                <p className="text-xl font-black text-white">99.8%</p>
              </div>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[40px] space-y-8">
              <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Target className="w-6 h-6 text-yellow-500" />
                Why Krypto Wins
              </h4>
              
              <div className="space-y-6">
                {[
                  { label: "Neural Context Awareness", krypto: true, others: false },
                  { label: "Real-time Market Signals", krypto: true, others: false },
                  { label: "Strategic Resume Rebuild", krypto: true, others: "Basic" },
                  { label: "End-to-end Career DNA", krypto: true, others: false },
                  { label: "Zero-Data Privacy Framework", krypto: true, others: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">{item.label}</span>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-zinc-600 font-black mb-1 uppercase">Krypto</span>
                        <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="flex flex-col items-center w-10">
                        <span className="text-[8px] text-zinc-600 font-black mb-1 uppercase">Others</span>
                        {typeof item.others === 'string' ? (
                          <span className="text-[9px] font-black text-zinc-500 uppercase">{item.others}</span>
                        ) : item.others ? (
                          <CheckCircle2 className="w-5 h-5 text-zinc-700" />
                        ) : (
                          <XCircle className="w-5 h-5 text-zinc-800" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setActiveTab?.('Pricing')}
                className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 border-b-4 border-yellow-700 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro Aspirants
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS COUNTER SECTION */}
      <div className="pt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Resumes Optimized", value: 12400, suffix: "+", icon: FileText, color: "text-yellow-500" },
            { label: "Placements Secured", value: 3850, suffix: "+", icon: Briefcase, color: "text-blue-400" },
            { label: "Neural Simulations", value: 85000, suffix: "+", icon: Cpu, color: "text-yellow-500" },
            { label: "Avg. Salary Hike", value: 42, suffix: "%", icon: TrendingUp, color: "text-blue-400" }
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[40px] flex flex-col items-center text-center space-y-4 group hover:bg-zinc-900/60 transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors shadow-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPANY LOGOS SECTION */}
      <div className="pt-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Our Alumni Build Careers At</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
          {[
            { name: "Google", url: "https://www.vectorlogo.zone/logos/google/google-ar21.svg" },
            { name: "Stripe", url: "https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" },
            { name: "Airbnb", url: "https://www.vectorlogo.zone/logos/airbnb/airbnb-ar21.svg" },
            { name: "Microsoft", url: "https://www.vectorlogo.zone/logos/microsoft/microsoft-ar21.svg" },
            { name: "Shopify", url: "https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" },
            { name: "Spotify", url: "https://www.vectorlogo.zone/logos/spotify/spotify-ar21.svg" },
            { name: "HubSpot", url: "https://www.vectorlogo.zone/logos/hubspot/hubspot-ar21.svg" },
            { name: "Slack", url: "https://www.vectorlogo.zone/logos/slack/slack-ar21.svg" }
          ].map((company, i) => (
            <div key={i} className="h-8 sm:h-10 flex items-center justify-center group">
              <img 
                src={company.url} 
                alt={company.name} 
                className="h-full w-auto object-contain brightness-0 invert opacity-60 group-hover:opacity-100 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="pt-32 border-t border-zinc-900">
        <div className="text-center mb-24">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Executive Testimonials</span>
          <h3 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-tight">Trusted by <br /><span className="gold-text-gradient">Global Career Aspirants</span></h3>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 no-scrollbar pb-8">
           {[
             { name: "Priya Sharma", role: "Sr. SDE @ Bangalore Tech Hub", text: "I was on the fence about a senior role at a top firm. The **Personalized Worthiness Score** gave me an 88%, highlighting my fit for their 'scope creep' problem. That insight was the key—I tailored my final interview answers around it and secured the offer.", imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop" },
             { name: "Maria Garcia", role: "Marketing to Product Strategy @ Fusion Dynamics", text: "Pivoting careers felt impossible. Krypto's **Personalized Strategy** feature gave me a 6-month, step-by-step blueprint. It wasn't just advice; it was a tactical roadmap from course selection to resume re-engineering. Absolutely essential.", imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80" },
             { name: "David Chen", role: "Data Scientist @ QuantumLeap", text: "My resume was getting zero traction. The **Resume Aspirant** rebuilt it using the XYZ formula. The difference was night and day. Went from no replies to three interviews in one week. The impact quantization is a cheat code.", imgSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" }
           ].map((r, i) => (
             <div key={i} className="min-w-full snap-center bg-zinc-900/40 border border-zinc-800 p-10 rounded-[48px] space-y-8 hover:bg-zinc-900/60 transition-all">
                <div className="flex text-yellow-500 gap-1">{'★★★★★'.split('').map((s, idx) => <span key={idx}>{s}</span>)}</div>
                <div className="text-zinc-400 text-base italic font-medium leading-relaxed prose-krypto">
                  <ReactMarkdown>{`"${r.text}"`}</ReactMarkdown>
                </div>
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
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Aspirants • Intelligence • Career</p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm">Engineering the next generation of professional identity through high-precision recruitment systems. Crafted with absolute technical rigor by <span className="text-zinc-300">KryptonPath</span>.</p>
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
                 <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div><span className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.5em]">Intel Framework: {activePolicy}</span></div>
                 <button onClick={() => setActivePolicy(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-yellow-500/40 transition-all group"><svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 sm:p-20 custom-scrollbar"><div className="prose prose-invert prose-krypto max-w-none"><ReactMarkdown>{POLICY_CONTENT[activePolicy]}</ReactMarkdown></div></div>
              <div className="h-20 flex items-center justify-between px-12 border-t border-zinc-900 bg-zinc-900/20"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Verified Compliance Node • 2026 Strategic Sync</p><button onClick={() => setActivePolicy(null)} className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-[8px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all">Acknowledge Framework</button></div>
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