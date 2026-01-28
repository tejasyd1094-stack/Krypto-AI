import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ResumeScorer from './components/ResumeScorer';
import CareerPath from './components/CareerPath';
import OutreachArchitect from './components/OutreachArchitect';
import InterviewLab from './components/InterviewLab';
import History from './components/History';
import Pricing from './components/Pricing';
import UnitLedger from './components/UnitLedger';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import { TabType, UserStatus, PricingPlan, PlanId, FeatureAccess, HistoryItem, ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, Message, ChatHistoryItem } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Profile & Roadmap'); // Default to Profile & Roadmap on login
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [newHistoryCount, setNewHistoryCount] = useState(0);
  
  const scrollRef = useRef<HTMLElement>(null);

  // Persisted Resume Scorer State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeResult, setResumeResult] = useState<ResumeScoreResponse | null>(null);
  const [formattedResume, setFormattedResume] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);

  // Persisted Career Path State
  const [careerResult, setCareerResult] = useState<CareerPathResponse | null>(null);
  const [careerScores, setCareerScores] = useState<PersonalityTraitScores>({ analytic: 0, creative: 0, leadership: 0, social: 0, practical: 0, investigative: 0 });
  const [careerDnaCode, setCareerDnaCode] = useState<string>('');
  const [careerUserType, setCareerUserType] = useState<'experienced' | 'fresher' | null>(null);
  const [careerResumeData, setCareerResumeData] = useState<{ data: string, mimeType: string } | string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const [user, setUser] = useState<UserStatus>({
    isPro: false,
    planId: 'free',
    credits: 0, // Initialized to 0 as requested
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setActiveTab('Profile & Roadmap');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setActiveTab('Profile & Roadmap');
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialize chat messages once on mount
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'model',
        content: "Welcome, Career Architect! I'm your personal AI Career Coach. How can I assist your mission today? Feel free to ask a question or attach a document for analysis."
      }]);
    }
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (activeTab === 'History') {
      setNewHistoryCount(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const detectLocale = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const isIndian = data.currency === 'INR';
        setUser(prev => ({ 
          ...prev, 
          currency: isIndian ? 'INR' : 'USD', 
          symbol: isIndian ? '₹' : '$'
        }));
      } catch (err) {
        setUser(prev => ({ ...prev, currency: 'USD', symbol: '$' }));
      }
    };
    detectLocale();
  }, []);

  const handleVerifyLocation = async () => {
    setIsVerifyingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`);
            const geoData = await geoRes.json();
            const address = geoData.address;
            
            const city = address.city || 
                         address.town || 
                         address.village || 
                         address.municipality || 
                         address.suburb || 
                         address.neighbourhood ||
                         address.city_district || 
                         address.state_district || 
                         address.county || 
                         address.region || '';
            
            const country = address.country || '';
            
            let locationStr = '';
            if (city) {
              locationStr = city.toUpperCase();
            } else if (country) {
              locationStr = country.toUpperCase();
            } else {
              locationStr = 'GLOBAL MARKET';
            }
            
            setUser(prev => ({ ...prev, location: locationStr }));
          } catch (e) {
            await fetchIpBasedLocation();
          } finally {
            setIsVerifyingLocation(false);
          }
        },
        async (error) => {
          await fetchIpBasedLocation();
          setIsVerifyingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      await fetchIpBasedLocation();
      setIsVerifyingLocation(false);
    }
  };

  const fetchIpBasedLocation = async () => {
    try {
      const res = await fetch('https://ipinfo.io/json');
      const data = await res.json();
      if (data.city) {
        setUser(prev => ({ ...prev, location: data.city.toUpperCase() }));
        return;
      }
      throw new Error('ipinfo failed');
    } catch (err) {
      try {
        const res = await fetch('http://ip-api.com/json/');
        const data = await res.json();
        if (data.status === 'success' && data.city) {
          setUser(prev => ({ ...prev, location: data.city.toUpperCase() }));
        } else {
          throw new Error('ip-api failed');
        }
      } catch (err2) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          const locationStr = data.city ? data.city.toUpperCase() : (data.country_name ? data.country_name.toUpperCase() : 'GLOBAL MARKET');
          setUser(prev => ({ ...prev, location: locationStr }));
        } catch (e) {
          setUser(prev => ({ ...prev, location: 'GLOBAL MARKET' }));
        }
      }
    }
  };

  const setManualLocation = (loc: string) => {
    setUser(prev => ({ ...prev, location: loc.toUpperCase() }));
  };

  const handleLogout = async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    setGuestUser(null);
    setSession(null);
    setActiveTab('Home');
    setIsSidebarOpen(false);
    setCareerResult(null);
    setResumeResult(null);
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
    setUser(prev => {
        const newState = { ...prev, history: [item, ...prev.history] };
        
        // Task tracking for first-time use
        if (item.type === 'resume-audit' && !newState.tasks.scorerUsed) {
            newState.tasks.scorerUsed = true;
            newState.credits += 5;
        }
        if (item.type === 'strategy' || item.type === 'market-insight') {
            if (!newState.tasks.careerUsed) {
                newState.tasks.careerUsed = true;
                newState.credits += 10;
            }
        }
        if (item.type === 'outreach' && !newState.tasks.outreachUsed) {
            newState.tasks.outreachUsed = true;
            newState.credits += 5;
        }
        if (item.type === 'interview-prep' && !newState.tasks.interviewUsed) {
            newState.tasks.interviewUsed = true;
            newState.credits += 5;
        }
        
        return newState;
    });
    
    if (activeTab !== 'History') {
      setNewHistoryCount(prev => prev + 1);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setUser(prev => ({ ...prev, history: prev.history.filter(item => item.id !== id) }));
  };

  const deleteChatHistoryItem = (id: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== id));
  };

  const saveChatHistory = (messages: Message[]) => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;

    const title = userMessages[0].content.substring(0, 40) + (userMessages[0].content.length > 40 ? '...' : '');
    const newChatItem: ChatHistoryItem = {
      id: `chat-${Date.now()}-${Math.random()}`,
      title: title || 'Untitled Chat',
      date: new Date().toLocaleDateString(),
      messages,
    };
    setChatHistory(prev => [newChatItem, ...prev]);
  };
  
  const handleNewChat = () => {
    if (chatMessages.length > 1) {
        saveChatHistory(chatMessages);
    }
    setChatMessages([{
        role: 'model',
        content: "Welcome, Career Architect! I'm your personal AI Career Coach. How can I assist your mission today? Feel free to ask a question or attach a document for analysis."
    }]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <Dashboard onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} setActiveTab={setActiveTab} userCredits={user.credits} messages={chatMessages} setMessages={setChatMessages} onNewChat={handleNewChat} />;
      case 'Profile & Roadmap': return <Profile user={user} onUpdateUser={(update) => setUser(prev => ({ ...prev, ...update }))} onAwardCredits={awardCredits} />;
      case 'Resume Scorer': return (
        <ResumeScorer 
          userCredits={user.credits} 
          onUse={deductCredits} 
          maxImprovements={10} 
          onNavigatePricing={() => setActiveTab('Pricing')} 
          onSaveHistory={saveToHistory}
          persistedData={{
            file: resumeFile,
            result: resumeResult,
            formattedResume: formattedResume,
            resumeData: resumeData
          }}
          setPersistedData={{
            setFile: setResumeFile,
            setResult: setResumeResult,
            setFormattedResume: setFormattedResume,
            setResumeData: setResumeData
          }}
        />
      );
      case 'Career Path': return (
        <CareerPath 
          userCredits={user.credits} 
          userLocation={user.location} 
          userSymbol={user.symbol}
          onUse={deductCredits} 
          onNavigatePricing={() => setActiveTab('Pricing')} 
          onSaveHistory={saveToHistory} 
          onVerifyLocation={handleVerifyLocation} 
          isVerifyingLocation={isVerifyingLocation} 
          onNavigateResumeScorer={() => setActiveTab('Resume Scorer')} 
          onSetManualLocation={setManualLocation}
          persistedData={{
            result: careerResult,
            scores: careerScores,
            dnaCode: careerDnaCode,
            userType: careerUserType,
            resumeData: careerResumeData
          }}
          setPersistedData={{
            setResult: setCareerResult,
            setScores: setCareerScores,
            setDnaCode: setCareerDnaCode,
            setUserType: setCareerUserType,
            setResumeData: setCareerResumeData
          }}
        />
      );
      case 'Outreach Architect': return < OutreachArchitect userCredits={user.credits} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} />;
      case 'Interview Lab': return <InterviewLab userCredits={user.credits} userLocation={user.location} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} />;
      case 'History': return <History history={user.history} chatHistory={chatHistory} onDeleteHistory={deleteHistoryItem} onDeleteChat={deleteChatHistoryItem} />;
      case 'Pricing': return <Pricing user={user} onUpgrade={(p) => setUser(prev => ({...prev, planId: p.id, credits: prev.credits + (p.credits as number)}))} />;
      case 'Credit System': return <UnitLedger />;
      default: return <Dashboard onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} userCredits={user.credits} messages={chatMessages} setMessages={setChatMessages} onNewChat={handleNewChat} />;
    }
  };

  const currentSession = session || guestUser;

  if (!currentSession) return <Login onGuestLogin={() => { setGuestUser({ user: { email: 'architect@krypto.ai' } }); setActiveTab('Profile & Roadmap'); }} />;

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
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-lg group hover:border-yellow-500/30 transition-all">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                <svg className="w-2.5 h-2.5 text-zinc-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
              </div>
              <span className="text-[10px] font-black text-yellow-500 tracking-widest">{user.credits}</span>
            </div>

            <button 
              onClick={() => setActiveTab('Profile & Roadmap')}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden ring-2 ring-transparent hover:ring-yellow-500/20 transition-all p-0.5"
            >
               <img 
                 src={user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${currentSession.user.email}&background=18181b&color=eab308`} 
                 alt="User" 
                 className="w-full h-full rounded-full"
               />
            </button>
          </div>
        </header>
        <section ref={scrollRef} className="flex-1 overflow-y-auto pb-20 bg-transparent">{renderContent()}</section>
      </main>
    </div>
  );
};

export default App;