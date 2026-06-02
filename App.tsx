import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ResumeScorer from './components/ResumeScorer';
import CareerPath from './components/CareerPath';
import OutreachArchitect from './components/OutreachArchitect';
import InterviewLab from './components/InterviewLab';
import SimulationUI from './components/SimulationUI';
import History from './components/History';
import Pricing from './components/Pricing';
import UnitLedger from './components/UnitLedger';
import Login from './components/Login';
import AtsLabAttributes from './components/labs/AtsLabAttributes';
import CareerLabAttributes from './components/labs/CareerLabAttributes';
import OutreachLabAttributes from './components/labs/OutreachLabAttributes';
import InterviewLabAttributes from './components/labs/InterviewLabAttributes';
import { supabase } from './lib/supabase';
import { TabType, UserStatus, PricingPlan, PlanId, FeatureAccess, HistoryItem, ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, Message, ChatHistoryItem } from './types';

const SYMBOL_MAP: Record<string, string> = {
  'USD': '$',
  'INR': '₹'
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Profile & Roadmap'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [newHistoryCount, setNewHistoryCount] = useState(0);
  
  const scrollRef = useRef<HTMLElement>(null);

  // Simulation State
  const [simInputs, setSimInputs] = useState<any>(null);
  const [simJd, setSimJd] = useState<string | null>(null);

  // Persisted States
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeResult, setResumeResult] = useState<ResumeScoreResponse | null>(null);
  const [formattedResume, setFormattedResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);

  const [careerResult, setCareerResult] = useState<CareerPathResponse | null>(null);
  const [careerScores, setCareerScores] = useState<PersonalityTraitScores>({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  const [careerDnaCode, setCareerDnaCode] = useState<string>('');
  const [careerUserType, setCareerUserType] = useState<'experienced' | 'fresher' | null>(null);
  const [careerResumeData, setCareerResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [showCreditPopup, setShowCreditPopup] = useState(false);

  const [user, setUser] = useState<UserStatus>({
    isPro: false,
    planId: 'free',
    credits: 0, 
    trialUsed: false,
    location: '', 
    currency: 'USD',
    symbol: '$',
    history: [],
    tasks: {
      profilePic: false,
      resumeAdded: false,
      compAdded: false,
      noticeAdded: false,
      scorerUsed: false,
      careerUsed: false,
      outreachUsed: false,
      interviewUsed: false
    }
  });

  useEffect(() => {
    if (activeTab === 'Simulation') {
      document.body.classList.add('simulation-active');
    } else {
      document.body.classList.remove('simulation-active');
    }
    return () => {
      document.body.classList.remove('simulation-active');
    };
  }, [activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setActiveTab('Home');
        setShowCreditPopup(true);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setActiveTab('Home');
        setShowCreditPopup(true);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'model',
        content: "Welcome, Career Aspirant! I'm your personal AI Career Coach. How can I assist your mission today?"
      }]);
    }
  }, []);

  useEffect(() => {
    // Reset scroll when switching tabs
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleVerifyLocation = async () => {
    setIsVerifyingLocation(true);
    
    const detectByIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const isIndia = data.country_code === 'IN';
        const detectedCurrency = isIndia ? 'INR' : 'USD';
        const detectedLocation = data.city ? `${data.city.toUpperCase()}, ${data.country_name.toUpperCase()}` : (isIndia ? 'INDIA' : '');
        
        setUser(prev => ({ 
          ...prev, 
          location: detectedLocation,
          currency: detectedCurrency, 
          symbol: SYMBOL_MAP[detectedCurrency] || '$'
        }));
      } catch (err) {
        console.warn("Location detection completely failed.", err);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`);
            const geoData = await geoRes.json();
            const city = geoData.address.city || geoData.address.town || geoData.address.village || '';
            const countryCode = geoData.address.country_code || '';
            const isIndia = countryCode === 'in';
            const locationStr = `${city.toUpperCase()}, ${geoData.address.country.toUpperCase()}`;
            
            setUser(prev => ({ 
              ...prev, 
              location: locationStr,
              currency: isIndia ? 'INR' : 'USD',
              symbol: isIndia ? '₹' : '$'
            }));
          } catch (e) {
            await detectByIP();
          } finally {
            setIsVerifyingLocation(false);
          }
        },
        async (err) => {
          console.warn("Geolocation access denied, falling back to IP detection.", err);
          await detectByIP();
          setIsVerifyingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      await detectByIP();
      setIsVerifyingLocation(false);
    }
  };

  const handleLogout = async () => {
    if (session) await supabase.auth.signOut();
    setGuestUser(null);
    setSession(null);
    setActiveTab('Home');
  };

  const deductCredits = (amount: number): boolean => {
    if (user.credits < amount) { setActiveTab('Pricing'); return false; }
    setUser(prev => ({ ...prev, credits: prev.credits - amount }));
    return true;
  };

  const awardCredits = (amount: number) => {
    setUser(prev => ({ ...prev, credits: prev.credits + amount }));
  };

  const saveToHistory = (item: HistoryItem) => {
    setUser(prev => ({ ...prev, history: [item, ...prev.history] }));
    if (activeTab !== 'History') setNewHistoryCount(prev => prev + 1);
  };

  const handleNewChat = () => {
    setChatMessages([{
        role: 'model',
        content: "Welcome, Career Aspirant! I'm your personal AI Career Coach. How can I assist your mission today?"
    }]);
  };

  const currentSession = session || guestUser;

  if (!currentSession) return <Login onGuestLogin={() => { setGuestUser({ user: { email: 'aspirant@krypto.ai' } }); setActiveTab('Home'); setShowCreditPopup(true); }} />;

  return (
    <div className="flex min-h-screen bg-transparent text-zinc-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        user={user} 
        onLogout={handleLogout}
        newHistoryCount={newHistoryCount}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        <header className="h-20 flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <div className="flex items-center gap-4 ml-auto relative">
            {showCreditPopup && (
              <div className="absolute top-full right-0 mt-4 w-64 bg-zinc-900 border border-yellow-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-in fade-in slide-in-from-top-4 duration-500 z-50">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Free Credits</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    Complete your profile to claim your <span className="text-yellow-500 font-bold">Free Credits</span>.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveTab('Profile & Roadmap');
                      setShowCreditPopup(false);
                    }}
                    className="w-full py-2 bg-yellow-500 text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg"
                  >
                    Claim Now
                  </button>
                  <button 
                    onClick={() => setShowCreditPopup(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="absolute -top-2 right-12 w-4 h-4 bg-zinc-900 border-t border-l border-yellow-500/50 rotate-45"></div>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-lg group hover:border-yellow-500/30 transition-all">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                <svg className="w-2.5 h-2.5 text-zinc-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
              </div>
              <span className="text-[10px] font-black text-yellow-500 tracking-widest">{user.credits}</span>
            </div>
            <button onClick={() => setActiveTab('Profile & Roadmap')} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
               <img src={user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${currentSession.user.email}&background=18181b&color=eab308`} alt="User" className="w-full h-full rounded-full" />
            </button>
          </div>
        </header>
        <section ref={scrollRef} className="flex-1 overflow-y-auto pb-20 bg-transparent">
          {(() => {
            switch (activeTab) {
              case 'Home': return (
                <Dashboard 
                  onUse={deductCredits} 
                  onNavigatePricing={() => setActiveTab('Pricing')} 
                  setActiveTab={setActiveTab} 
                  userCredits={user.credits} 
                  messages={chatMessages} 
                  setMessages={setChatMessages} 
                  onNewChat={handleNewChat} 
                  onVerifyLocation={handleVerifyLocation}
                  onUpdateLocation={(l) => setUser(prev => ({...prev, location: l.toUpperCase()}))}
                />
              );
              case 'Profile & Roadmap': return <Profile user={user} onUpdateUser={(update) => setUser(prev => ({ ...prev, ...update }))} onAwardCredits={awardCredits} />;
              case 'Resume Scorer': return <ResumeScorer userProfile={user.profile} userCredits={user.credits} onUse={deductCredits} maxImprovements={10} onNavigatePricing={() => setActiveTab('Pricing')} onSaveHistory={saveToHistory} persistedData={{ file: resumeFile, result: resumeResult, formattedResume: formattedResume, resumeData: resumeData }} setPersistedData={{ setFile: setResumeFile, setResult: setResumeResult, setFormattedResume: setFormattedResume, setResumeData: setResumeData }} />;
              case 'Career Path': return <CareerPath userCredits={user.credits} userLocation={user.location} userSymbol={user.symbol} onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} onSaveHistory={saveToHistory} onVerifyLocation={handleVerifyLocation} isVerifyingLocation={isVerifyingLocation} onNavigateResumeScorer={() => setActiveTab('Resume Scorer')} onSetManualLocation={(l) => setUser(prev => ({...prev, location: l.toUpperCase()}))} persistedData={{ result: careerResult, scores: careerScores, dnaCode: careerDnaCode, userType: careerUserType, resumeData: careerResumeData }} setPersistedData={{ setResult: setCareerResult, setScores: setCareerScores, setDnaCode: setCareerDnaCode, setUserType: setCareerUserType, setResumeData: setCareerResumeData }} />;
              case 'Outreach Architect': return < OutreachArchitect userCredits={user.credits} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} />;
              case 'Interview Lab': return <InterviewLab userCredits={user.credits} userLocation={user.location} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} onStartSimulation={(inputs, jd) => { setSimInputs(inputs); setSimJd(jd); setActiveTab('Simulation'); }} />;
              case 'Simulation': return <SimulationUI user={user} inputs={simInputs} jdData={simJd} onAwardCredits={awardCredits} onExit={() => setActiveTab('Interview Lab')} onComplete={(audit) => { saveToHistory({ id: Math.random().toString(36).substr(2, 9), type: 'interview-simulation', title: `Audit: ${simInputs.company}`, date: new Date().toLocaleDateString(), inputs: simInputs, result: audit }); setActiveTab('History'); }} />;
              case 'History': return <History history={user.history} chatHistory={chatHistory} onDeleteHistory={(id) => setUser(prev => ({...prev, history: prev.history.filter(h => h.id !== id)}))} onDeleteChat={(id) => setChatHistory(prev => prev.filter(c => c.id !== id))} />;
              case 'Pricing': return <Pricing user={user} onUpgrade={(p) => setUser(prev => ({...prev, planId: p.id, credits: prev.credits + (p.credits as number)}))} />;
              case 'Credit System': return <UnitLedger />;
              
              /* Attribute Deep Dive Pages */
              case 'Lab-ATS': return <AtsLabAttributes />;
              case 'Lab-Career': return <CareerLabAttributes />;
              case 'Lab-Outreach': return <OutreachLabAttributes />;
              case 'Lab-Interview': return <InterviewLabAttributes />;

              default: return <Dashboard onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} userCredits={user.credits} messages={chatMessages} setMessages={setChatMessages} onNewChat={handleNewChat} />;
            }
          })()}
        </section>
      </main>
    </div>
  );
};

export default App;