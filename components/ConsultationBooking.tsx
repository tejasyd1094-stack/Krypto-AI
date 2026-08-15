import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Video, Users, Award, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface ConsultationBookingProps {
  className?: string;
}

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2EwI-Bc4z-u9ogjxlBLZrEcpQ7C6h8B4N-VgyGWIF1Uipks3kD86dGbUsS0wuvvaDK1etaE8NE?gv=true';

export default function ConsultationBooking({ className = "" }: ConsultationBookingProps) {
  const calendarButtonRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const initCalendarButton = () => {
      if (typeof window !== 'undefined' && (window as any).calendar?.schedulingButton && calendarButtonRef.current) {
        if (isInitializedRef.current) return;
        
        calendarButtonRef.current.innerHTML = '';
        try {
          (window as any).calendar.schedulingButton.load({
            url: GOOGLE_CALENDAR_URL,
            color: '#F6BF26',
            label: 'Book an appointment',
            target: calendarButtonRef.current,
          });
          isInitializedRef.current = true;
        } catch (err) {
          console.warn('Google Calendar schedulingButton load error:', err);
        }
      }
    };

    // If script is already loaded
    if ((window as any).calendar?.schedulingButton) {
      initCalendarButton();
    } else {
      // Load CSS
      const cssHref = 'https://calendar.google.com/calendar/scheduling-button-script.css';
      if (!document.querySelector(`link[href="${cssHref}"]`)) {
        const link = document.createElement('link');
        link.href = cssHref;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      // Load Script
      const scriptSrc = 'https://calendar.google.com/calendar/scheduling-button-script.js';
      let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        document.body.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if ((window as any).calendar?.schedulingButton) {
          initCalendarButton();
          clearInterval(checkInterval);
        }
      }, 150);

      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 6000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <div id="expert-consultation" className={`relative bg-zinc-950 border border-zinc-900 rounded-[48px] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl ${className}`}>
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600/5 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Information Column */}
        <div className="lg:col-span-6 space-y-8">
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

        {/* Google Calendar Interactive Scheduling Column */}
        <div className="lg:col-span-6 bg-zinc-900/40 border border-zinc-800/80 rounded-[36px] p-8 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between space-y-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[90px] pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-yellow-500 shadow-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                Live Google Calendar
              </span>
            </div>

            <div>
              <h4 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                Schedule Your Session
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                Pick a date and convenient time slot directly on our official Google Calendar appointment scheduler.
              </p>
            </div>

            {/* Session Highlights Card */}
            <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span><strong className="text-white">Duration:</strong> 15 Minutes (1-on-1 Strategy Session)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <Video className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span><strong className="text-white">Format:</strong> Google Meet (Video Call Link Included)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span><strong className="text-white">Specialist:</strong> Neal (People & Culture Specialist)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span><strong className="text-white">Cost:</strong> 100% Free (Zero Commitment)</span>
              </div>
            </div>
          </div>

          {/* Embedded Google Calendar Button Container */}
          <div className="relative z-10 space-y-4 pt-2">
            {/* Google Calendar embedded button will be injected into this container */}
            <div 
              ref={calendarButtonRef} 
              id="google-calendar-schedule-target" 
              className="w-full flex items-center justify-center min-h-[58px]"
            />

            <p className="text-[10px] text-center text-zinc-500 font-medium tracking-wide pt-2">
              Instant automated confirmation with Google Meet invite will be sent directly to your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
