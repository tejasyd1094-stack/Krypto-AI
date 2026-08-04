import React, { useState } from 'react';
import { CheckCircle2, Users, Award, ShieldCheck, Sparkles, Send } from 'lucide-react';

interface ConsultationBookingProps {
  className?: string;
}

export default function ConsultationBooking({ className = "" }: ConsultationBookingProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate booking with a network timeout
    setTimeout(() => {
      setIsLoading(false);
      setIsBooked(true);
    }, 1200);
  };

  return (
    <div id="expert-consultation" className={`relative bg-zinc-950 border border-zinc-900 rounded-[48px] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl ${className}`}>
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600/5 blur-[120px] pointer-events-none" />

      {!isBooked ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-[9px] uppercase font-black tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>100% Free Trial</span>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-[0.95]">
                Book An <span className="gold-text-gradient">Expert Consultation</span>
              </h3>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
                HUMAN-IN-THE-LOOP COACHING & PREMIUM RECRUITMENT ASSISTANCE
              </p>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Ready to scale your organization or supercharge your professional career? Partner directly with our elite recruitment architects. Get customized consultation, resume deep-dives, or strategic team hiring workflows.
            </p>

            {/* Premium details */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">People & Culture Veterans</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Our elite consultants are highly experienced professionals who have spent years working inside the People & Culture and HR departments of top-tier global companies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">First 15 Mins Free</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Try our premium consultation completely risk-free. The first 15 minutes are 100% free to test our coaching style and alignment methodologies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">Enterprise-Grade Match</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Perfect for both founders/hiring managers seeking purple-squirrel candidates and senior candidates seeking strategic executive coaching.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Booking Widget Column */}
          <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-[32px] p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[80px] pointer-events-none" />
            
            <form onSubmit={handleBookingSubmit} className="space-y-6 relative z-10">
              
              {/* Step 1: Fill Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-600 font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Your Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-600 font-medium"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Company / Target Role</label>
                  <input
                    type="text"
                    required
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-600 font-medium"
                    placeholder="Acme Corp / Senior Tech Lead"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Briefly state your consultation goals</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-600 resize-none font-medium"
                    placeholder="E.g., I want human-in-the-loop coaching for mock interview support or organizational headhunting help..."
                  />
                </div>
              </div>

              {/* Submit button - Supercharged Big, Professional & Impactful */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 sm:py-6 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl border-b-4 border-yellow-700 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting Request...</span>
                  </span>
                ) : (
                  <>
                    <span>Book Free 15-Min Strategy Session</span>
                    <Send className="w-4 h-4" strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto text-center py-12 space-y-8 relative z-10 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-yellow-500/20 border border-yellow-500 text-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
              Request Submitted!
            </h3>
            <p className="text-yellow-500 text-sm font-black uppercase tracking-widest">
              OUR HR EXPERTS WILL CONTACT YOU SHORTLY TO CHOOSE A DATE & TIME
            </p>
            <div className="bg-zinc-900/50 border border-zinc-900 rounded-3xl p-6 text-left space-y-3 mt-6">
              <div className="flex justify-between text-xs font-bold border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 uppercase">Consultant Name:</span>
                <span className="text-white uppercase font-black">Neal (People & Culture Specialist)</span>
              </div>
              <div className="flex justify-between text-xs font-bold border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 uppercase">Status:</span>
                <span className="text-yellow-500 font-bold uppercase">Contacting within 24 Hours</span>
              </div>
              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="text-zinc-500 uppercase">Rate:</span>
                <span className="text-yellow-500 font-black uppercase">100% Free (First 15 mins)</span>
              </div>
            </div>
          </div>

          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto">
            A confirmation email has been sent to <span className="text-zinc-300 font-bold">{email}</span>. Please look out for a calendar setup link from our People & Culture team. We look forward to partnering with you!
          </p>

          <button
            type="button"
            onClick={() => {
              setIsBooked(false);
              setName('');
              setEmail('');
              setOrg('');
              setMessage('');
            }}
            className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Submit Another Request
          </button>
        </div>
      )}
    </div>
  );
}
