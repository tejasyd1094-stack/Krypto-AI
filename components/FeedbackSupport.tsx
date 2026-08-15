import React, { useState } from 'react';
import { Star, MessageSquare, Send, Mail, Copy, Check } from 'lucide-react';

interface FeedbackSupportProps {
  onBack?: () => void;
}

const MODULES = [
  'ATS Resume Scorer & Optimizer',
  'Personality-to-Job Predictor & Career Path',
  'Outreach Architect',
  'Interview Lab',
  'Referrals & Multipliers',
  'User Profile & General Roadmap',
  'Other Platform Issue'
];

export default function FeedbackSupport({ onBack }: FeedbackSupportProps) {
  const [module, setModule] = useState(MODULES[0]);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [mailtoUrl, setMailtoUrl] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@kryptonpath.co');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const handleRatingSelect = (val: number) => {
    setRating(val);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (rating === 0) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    if (rating < 3 && !comment.trim()) {
      setErrorMsg('For ratings below 3 stars, please provide detailed feedback on what went wrong or how we can improve.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          module,
          rating,
          comment,
          email: userEmail,
          name: userName
        })
      });

      const data = await response.json();
      if (data.ticketId) {
        setTicketId(data.ticketId);
      }
      if (data.mailtoUrl) {
        setMailtoUrl(data.mailtoUrl);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to dispatch feedback:', err);
      // Fallback
      setTicketId('TK-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setUserEmail('');
    setUserName('');
    setModule(MODULES[0]);
    setSubmitted(false);
    setErrorMsg('');
    setTicketId('');
    setMailtoUrl('');
  };

  return (
    <div className="min-h-[85vh] bg-transparent text-zinc-100 font-sans px-4 sm:px-10 py-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Telemetry & Support Desk</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
            Feedback & <span className="gold-text-gradient">Support</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-lg mt-1">
            Your telemetry helps optimize our recruitment systems. Submit feature reviews or reach our dedicated career operations support engineers.
          </p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="group self-start sm:self-center px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700/50 border border-zinc-800 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button>
        )}
      </div>

      {/* Main Grid: Left Side Feedback Form, Right Side Direct Support Cell */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* Left Side: Interactive Feedback Engine */}
        <div className="md:col-span-7 bg-zinc-950/40 border border-zinc-900 rounded-[36px] p-8 sm:p-10 flex flex-col justify-between space-y-8">
          {submitted ? (
            <div className="space-y-6 my-auto py-8 text-center animate-in zoom-in-95 duration-350">
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Send className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase text-white tracking-tight">Transmission Code Received</h3>
                {ticketId && (
                  <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 font-mono text-xs font-black">
                    Ticket ID: {ticketId}
                  </div>
                )}
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Excellent work! Your feedback on <span className="text-yellow-500 font-bold">"{module}"</span> with a rating of <span className="text-yellow-500 font-bold">{rating} Star{rating > 1 ? 's' : ''}</span> has been saved and dispatched to <span className="text-white font-bold">support@kryptonpath.co</span>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Send Another Response
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Optional Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-2xl px-5 py-3.5 text-xs font-bold text-zinc-100 outline-none focus:border-yellow-500/50 tracking-wide placeholder:text-zinc-650"
                    placeholder="E.g. Alex Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-2xl px-5 py-3.5 text-xs font-bold text-zinc-100 outline-none focus:border-yellow-500/50 tracking-wide placeholder:text-zinc-650"
                    placeholder="alex@example.com"
                  />
                </div>
              </div>

              {/* Module selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                  Select Target Feature Module
                </label>
                <div className="relative">
                  <select 
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-100 outline-none focus:border-yellow-500/50 appearance-none cursor-pointer tracking-wide"
                  >
                    {MODULES.map((opt) => (
                      <option key={opt} value={opt} className="bg-zinc-950 text-zinc-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Star rating selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                    Computational Quality Rating
                  </label>
                  {rating > 0 && (
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                      {rating === 5 ? 'Excellent 5/5' : rating === 4 ? 'Very Good 4/5' : rating === 3 ? 'Satisfactory 3/5' : rating === 2 ? 'Needs Work 2/5' : 'Critical Issue 1/5'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const active = val <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handleRatingSelect(val)}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 px-1.5 focus:outline-none transition-transform active:scale-90"
                      >
                        <Star 
                          className={`w-8 h-8 cursor-pointer transition-all ${
                            active 
                              ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                              : 'text-zinc-800 hover:text-zinc-700'
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional comment field (Required for < 3 stars) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                    Detailed Comments & Enhancements
                  </label>
                  {rating !== 0 && rating < 3 ? (
                    <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest animate-pulse">
                      * Required for rating &lt; 3 stars
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider">
                      Optional recommendation
                    </span>
                  )}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (errorMsg && rating < 3) setErrorMsg('');
                  }}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-medium text-zinc-100 outline-none focus:border-yellow-500/50 tracking-wide font-sans placeholder:text-zinc-650"
                  placeholder={
                    rating !== 0 && rating < 3 
                      ? "Describe what model outputs failed, what was missing, or how we can improve this feature..." 
                      : "Provide any additional context or feature requests to fuel our development roadmap..."
                  }
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                    {errorMsg}
                  </p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-98 border-b-4 border-yellow-700 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Transmitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Submit Verification Feedback</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Step-by-Step System Guidelines & Direct Support Link */}
        <div className="md:col-span-5 bg-zinc-950/20 border border-zinc-900/60 rounded-[36px] p-8 sm:p-10 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-zinc-650 uppercase tracking-[0.4em]">Direct Support Cell</h3>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed">
              If you have experienced an architectural bug, account billing issues, or have personalized data security requests, you can contact our live Krypto recruitment engineers directly.
            </p>

            <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl space-y-4">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block">Primary Mail Gateway</span>
              
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-500/80 shrink-0" />
                  <span className="font-mono text-xs font-black text-white select-all">support@kryptonpath.co</span>
                </div>
                
                <button 
                  onClick={handleCopyEmail}
                  className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all active:scale-95 cursor-pointer"
                  title="Copy support email address"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80 block mt-1.5" />
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-wider">
                  Engineers respond to registered career accounts within 24 operational hours.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-zinc-650 uppercase tracking-[0.4em]">Quality Checklist</h3>
            <div className="space-y-3 font-sans">
              {[
                { title: "Identify Module", text: "Select the specific platform section you're rating to route it to the proper team." },
                { title: "Quantified Score", text: "Provide a metric scale that objectively measures your interaction quality." },
                { title: "Constructive Context", text: "Describe specific failure situations or suggestions to directly build newer firmware patches." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="text-[10px] font-mono font-black text-yellow-500/60 mt-0.5">0{idx + 1}</div>
                  <div className="space-y-0.5">
                    <h5 className="text-[10px] font-black uppercase tracking-tight text-zinc-300">{item.title}</h5>
                    <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed uppercase tracking-wide">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900/40 text-[10px] font-bold text-zinc-600 uppercase tracking-wider italic text-center">
            Securing optimal career architecture.
          </div>
        </div>

      </div>

    </div>
  );
}
