import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Linkedin, Facebook, MessageCircle, Mail, Copy, Check, Share2, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { getOutreachMessage } from '../services/geminiService';
import { HistoryItem, ProfileMetadata } from '../types';

const OUTREACH_STEPS = [
  "Synthesizing Professional Persona...",
  "Analyzing Company Trajectory & Website...",
  "Identifying Engagement Hooks...",
  "Architecting Narrative Flow...",
  "Finalizing High-Conversion Message..."
];

interface OutreachArchitectProps {
  userCredits: number;
  userProfile?: ProfileMetadata;
  onUse: (amt: number) => boolean;
  onSaveHistory: (item: HistoryItem) => void;
  onNavigatePricing: () => void;
}

const OutreachArchitect: React.FC<OutreachArchitectProps> = ({ userCredits, userProfile, onUse, onSaveHistory, onNavigatePricing }) => {
  const getInitialExperience = (profile?: ProfileMetadata) => {
    if (!profile) return '';
    const parts = [
      profile.currentDesignation && profile.currentCompany ? `${profile.currentDesignation} at ${profile.currentCompany}` : (profile.currentDesignation || ''),
      profile.education?.graduate || profile.education?.masters ? `Education: ${[profile.education?.graduate, profile.education?.masters].filter(Boolean).join(', ')}` : '',
      profile.resumeFileName ? `Resume: ${profile.resumeFileName}` : ''
    ].filter(Boolean);
    return parts.join(' | ');
  };

  const [inputs, setInputs] = useState({ 
    company: '', 
    role: '', 
    contactPerson: '', 
    tone: 'Professional', 
    context: '',
    website: '',
    senderName: userProfile?.name || '',
    senderDesignation: userProfile?.currentDesignation || '',
    userExperience: getInitialExperience(userProfile)
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotData, setScreenshotData] = useState<{ data: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [grounding, setGrounding] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [companyError, setCompanyError] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setInputs(prev => ({
        ...prev,
        senderName: prev.senderName || userProfile.name || '',
        senderDesignation: prev.senderDesignation || userProfile.currentDesignation || '',
        userExperience: prev.userExperience || getInitialExperience(userProfile)
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + (Math.random() * 0.6 + 0.3); 
          return next > 99 ? 99 : next;
        });
        setAnalysisStep(p => (p < OUTREACH_STEPS.length - 1 && loadingProgress > (p + 1) * 19 ? p + 1 : p));
      }, 150);
    } else {
      setLoadingProgress(0);
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingProgress]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setScreenshotData({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.company.trim()) {
      setCompanyError(true);
      companyInputRef.current?.focus();
      companyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setCompanyError(false);
    if (userCredits < 5) { onNavigatePricing(); return; }
    
    setLoading(true);
    setResult(null);
    setGrounding([]);

    try {
      const { text, grounding: chunks } = await getOutreachMessage(inputs, screenshotData || undefined);
      
      if (text.includes('[REFUSAL]')) {
        setResult(text.replace('[REFUSAL]', '').trim());
        setLoading(false);
      } else {
        onUse(5);
        setLoadingProgress(100);
        setTimeout(() => {
          setResult(text);
          if (chunks) setGrounding(chunks);
          onSaveHistory({
            id: Math.random().toString(36).substr(2, 9),
            type: 'outreach',
            title: `Expert Outreach: ${inputs.company} (${inputs.role})`,
            date: new Date().toLocaleDateString(),
            inputs: { ...inputs, hasScreenshot: !!screenshot ? 'Yes' : 'No' } as any,
            result: text
          });
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getCleanShareText = (text: string) => {
    let msgOnly = text;
    if (msgOnly.includes('---EXECUTIVE_INSIGHT_TIP---')) {
      msgOnly = msgOnly.split('---EXECUTIVE_INSIGHT_TIP---')[0];
    } else if (msgOnly.includes('### 💡 Executive Outreach Strategy Tip')) {
      msgOnly = msgOnly.split('### 💡 Executive Outreach Strategy Tip')[0];
    }
    return msgOnly
      .replace(/^###?\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/---/g, '\n')
      .trim();
  };

  const handleShareLinkedIn = () => {
    if (!result) return;
    const clean = getCleanShareText(result);
    navigator.clipboard.writeText(clean);
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(clean)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    if (!result) return;
    const clean = getCleanShareText(result);
    navigator.clipboard.writeText(clean);
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(clean)}&u=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const clean = getCleanShareText(result);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(clean)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    if (!result) return;
    const clean = getCleanShareText(result);
    let subject = `Outreach: ${inputs.role || 'Opportunity'} at ${inputs.company || 'Target Company'}`;
    const subjectMatch = result.match(/Subject:\s*(.*)/i);
    if (subjectMatch && subjectMatch[1]) {
      subject = subjectMatch[1].trim().replace(/\*/g, '').replace(/\?/g, '');
    }
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(clean)}`;
    window.open(url, '_self');
  };

  const handleCopy = () => {
    if (!result) return;
    const clean = getCleanShareText(result);
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isProfileComplete = Boolean(userProfile?.name || userProfile?.currentDesignation);

  // Parse result into main message and executive strategy tip
  let mainMessage = result || '';
  let insightTip = '';

  if (result) {
    if (result.includes('---EXECUTIVE_INSIGHT_TIP---')) {
      const parts = result.split('---EXECUTIVE_INSIGHT_TIP---');
      mainMessage = parts[0].trim();
      insightTip = parts[1] ? parts[1].trim() : '';
    } else if (result.includes('### 💡 Executive Outreach Strategy Tip')) {
      const parts = result.split('### 💡 Executive Outreach Strategy Tip');
      mainMessage = parts[0].trim();
      insightTip = parts[1] ? parts[1].trim() : '';
    }

    // Sanitize subject line in mainMessage: remove question marks and leading asterisks/markdown headers
    mainMessage = mainMessage.replace(/^(\*\*|\#\#)?\s*Subject:\s*(.*)$/im, (match, prefix, content) => {
      const cleanSubject = content.replace(/\?/g, '').replace(/\*/g, '').trim();
      return `Subject: ${cleanSubject}`;
    });

    if (mainMessage.startsWith('**Subject:')) {
      mainMessage = mainMessage.replace(/^\*\*Subject:\s*/i, 'Subject: ');
    } else if (mainMessage.startsWith('**')) {
      mainMessage = mainMessage.replace(/^\*\*/, '');
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700 text-zinc-100 pb-40">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
          Hyper-Personalization Engine v2.0
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase">
          Outreach <span className="gold-text-gradient">Architect</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          Engineer messages that stop the scroll. Our engine researches target companies in real-time to guarantee engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Status Banner */}
            {isProfileComplete ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Profile Persona Active</p>
                    <p className="text-xs font-bold text-zinc-200">
                      {userProfile?.name || 'Candidate'} {userProfile?.currentDesignation ? `• ${userProfile.currentDesignation}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Signing Messages
                </span>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-xs text-zinc-300 font-medium">
                    <strong className="text-yellow-500 font-bold">Pro Tip:</strong> Complete your Name & Designation in Profile to automatically sign your outreach, or specify them below.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center justify-between">
                  <span>Target Company <span className="text-red-500 font-bold ml-0.5">*</span></span>
                </label>
                <input 
                  ref={companyInputRef}
                  value={inputs.company} 
                  onChange={e => {
                    setInputs({...inputs, company: e.target.value});
                    if (e.target.value.trim()) setCompanyError(false);
                  }} 
                  className={`w-full bg-zinc-950 border rounded-2xl px-6 py-4 text-sm outline-none uppercase font-bold text-zinc-100 transition-all ${
                    companyError 
                      ? 'border-red-500 ring-2 ring-red-500/30 bg-red-950/20' 
                      : 'border-zinc-800 focus:border-yellow-500'
                  }`} 
                  placeholder="e.g. NVIDIA" 
                />
                {companyError && (
                  <p className="text-red-400 text-[11px] font-semibold px-1 mt-1 animate-in fade-in duration-200">
                    * Please enter target company name
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Target Role / Designation</label>
                <input required value={inputs.role} onChange={e => setInputs({...inputs, role: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. VP Engineering" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Your Name (Sender Signature)</label>
                <input 
                  value={inputs.senderName} 
                  onChange={e => setInputs({...inputs, senderName: e.target.value})} 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold text-zinc-100" 
                  placeholder="e.g. Alex Mercer" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Your Designation / Title</label>
                <input 
                  value={inputs.senderDesignation} 
                  onChange={e => setInputs({...inputs, senderDesignation: e.target.value})} 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold text-zinc-100" 
                  placeholder="e.g. Senior Software Architect" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Your Experience / Resume Highlights</span>
                {userProfile?.resumeFileName ? (
                  <span className="text-blue-400 text-[9px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" /> Resume Linked ({userProfile.resumeFileName})
                  </span>
                ) : userProfile?.currentDesignation ? (
                  <span className="text-green-400 text-[9px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Synced from Profile
                  </span>
                ) : (
                  <span className="text-zinc-500 text-[9px] font-medium lowercase">(optional - auto-synced if added in profile)</span>
                )}
              </label>
              <input 
                value={inputs.userExperience} 
                onChange={e => setInputs({...inputs, userExperience: e.target.value})} 
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-medium text-zinc-200" 
                placeholder="e.g. 7+ years in AI engineering, scaled microservices to 10M DAU, M.S. Computer Science" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Contact Person Name</label>
                <input value={inputs.contactPerson} onChange={e => setInputs({...inputs, contactPerson: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none uppercase font-bold text-zinc-100" placeholder="e.g. Jensen Huang (Optional)" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Communication Tone</label>
                <select value={inputs.tone} onChange={e => setInputs({...inputs, tone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold uppercase text-zinc-100">
                  <option>Professional</option>
                  <option>Bold & Visionary</option>
                  <option>Curiosity-Based</option>
                  <option>Direct & Results-Oriented</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Company Website URL</span>
                <span className="text-zinc-500 text-[9px] font-medium lowercase">(optional - AI searches web if omitted)</span>
              </label>
              <input value={inputs.website} onChange={e => setInputs({...inputs, website: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-sm focus:border-yellow-500/50 outline-none font-bold text-zinc-100" placeholder="https://company.com" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Company Advancement / Exciting News</label>
              <div className="flex flex-col gap-4">
                <textarea 
                  value={inputs.context} 
                  onChange={e => setInputs({...inputs, context: e.target.value})} 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-[32px] px-8 py-6 text-sm focus:border-yellow-500/50 outline-none min-h-[120px] font-medium text-zinc-100" 
                  placeholder="Tell us what excites you about their current path, or upload a screenshot below..." 
                />
                
                <div className="flex items-center gap-4">
                   <button 
                     type="button" 
                     onClick={() => fileInputRef.current?.click()}
                     className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${screenshot ? 'border-green-500/50 bg-green-500/5 text-green-500' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-500'}`}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {screenshot ? screenshot.name : 'Upload Screenshot of Advancement'}
                     </span>
                   </button>
                   {screenshot && (
                     <button type="button" onClick={() => { setScreenshot(null); setScreenshotData(null); }} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2 italic">
                  For pro results, consider uploading a screenshot of company advancement or website.
                </p>
              </div>
            </div>

            <button disabled={loading} className="w-full py-6 bg-zinc-100 text-zinc-950 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-zinc-300 cursor-pointer">
              {loading ? "Searching Web & Architecting Outreach..." : "Generate Hyper-Personalized Message (5 Credits)"}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-32 space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="relative w-48 h-12 mx-auto bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden shadow-2xl">
               <div 
                 className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_#eab308]" 
                 style={{ width: `${loadingProgress}%` }}
               ></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
               </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{OUTREACH_STEPS[analysisStep]}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-0"></span>
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-150"></span>
                <span className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div ref={resultRef} className="bg-[#0c0c0e] border border-yellow-500/20 rounded-[56px] p-8 sm:p-14 animate-in slide-in-from-bottom-8 scroll-mt-24 shadow-3xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-100">Hyper-Personalized Outreach Result</h3>
              </div>
              <span className="text-[9px] font-black text-yellow-500/90 uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                Single High-Conversion Draft
              </span>
            </div>

            {/* Direct Sharing Suite */}
            <div className="p-6 bg-zinc-950 border border-zinc-850 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-yellow-500" />
                  <span className="text-[11px] font-black text-zinc-200 uppercase tracking-widest">Direct Sharing Suite</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Click any platform symbol below to share or send directly</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="px-4 py-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer shadow-lg"
                  title="Share or send on LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-4 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer shadow-lg"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer shadow-lg"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareEmail}
                  className="px-4 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer shadow-lg"
                  title="Send via Default Mail Client"
                >
                  <Mail className="w-4 h-4 text-yellow-500" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer sm:ml-auto ${
                    copied
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Copied Message</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Primary Unified Message Container with Spacing */}
            <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
              <div className="prose-krypto text-zinc-200 text-sm sm:text-base leading-relaxed font-sans [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-yellow-400">
                <ReactMarkdown>{mainMessage}</ReactMarkdown>
              </div>
            </div>

            {/* Executive Strategy Insight Bubble */}
            {insightTip && (
              <div className="p-6 sm:p-8 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-3xl space-y-3 shadow-xl backdrop-blur-sm relative">
                <div className="flex items-center gap-3 text-yellow-400 font-black text-xs uppercase tracking-widest border-b border-yellow-500/20 pb-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span>Executive Strategy Insight</span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium pt-1">
                  <ReactMarkdown>{insightTip}</ReactMarkdown>
                </div>
              </div>
            )}

            {grounding.length > 0 && (
              <div className="pt-6 border-t border-zinc-900">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Web Intelligence Sources</p>
                 <div className="flex flex-wrap gap-3">
                   {grounding.map((chunk, i) => chunk.web && (
                     <a 
                       key={i} 
                       href={chunk.web.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black text-zinc-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all truncate max-w-[200px]"
                     >
                       {chunk.web.title || 'Source'}
                     </a>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachArchitect;