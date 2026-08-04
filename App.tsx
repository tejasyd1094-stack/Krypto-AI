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
import KryptonPath from './components/KryptonPath';
import KryptoFaq from './components/KryptoFaq';
import Refer from './components/Refer';
import FeedbackSupport from './components/FeedbackSupport';
import ConsultationBooking from './components/ConsultationBooking';
import AtsLabAttributes from './components/labs/AtsLabAttributes';
import CareerLabAttributes from './components/labs/CareerLabAttributes';
import OutreachLabAttributes from './components/labs/OutreachLabAttributes';
import InterviewLabAttributes from './components/labs/InterviewLabAttributes';
import { auth, db } from './lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { TabType, UserStatus, PricingPlan, PlanId, FeatureAccess, HistoryItem, ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, Message, ChatHistoryItem } from './types';

const SYMBOL_MAP: Record<string, string> = {
  'USD': '$',
  'INR': '₹'
};

import { Toaster } from 'sonner';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">System Malfunction</h1>
            <p className="text-zinc-500 font-medium">A critical error occurred in the neural interface. Please refresh the page to reconnect.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-yellow-500 text-zinc-950 rounded-full font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all"
            >
              Restart System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const CookieBanner: React.FC<{ onAccept: () => void; onDecline: () => void }> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[1000] animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#09090c] border border-zinc-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/[0.02] rounded-bl-full pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 109 9c0-.42-.03-.84-.09-1.25A2.5 2.5 0 0118.5 8c-.68 0-1.29-.41-1.44-1.07A2.5 2.5 0 0114.5 5c-.75 0-1.41-.49-1.63-1.2C12.55 3.27 12.28 3 12 3z" />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
              <circle cx="11" cy="16" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Cookie Policy</h4>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed font-sans">
              We leverage cookies to authenticate identity sessions, optimize analytics, and execute diagnostic calculations for Krypto AI.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-1">
          <button 
            onClick={onAccept}
            className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-98 shadow-md"
          >
            Accept All
          </button>
          <button 
            onClick={onDecline}
            className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800 transition-all text-center shrink-0"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [cookieConsent, setCookieConsent] = useState<string | null>(() => {
    return localStorage.getItem('krypto-cookie-consent');
  });

  const handleCookieAccept = (status: 'accepted' | 'denied') => {
    localStorage.setItem('krypto-cookie-consent', status);
    setCookieConsent(status);
  };

  const [session, setSession] = useState<any>(null);
  const [guestUser, setGuestUser] = useState<any>(null);
  const currentSession = session || guestUser;
  const [requireLogin, setRequireLogin] = useState(false);
  const [activeTab, setActiveTab ] = useState<TabType>('Home'); 
  const pendingTabRef = useRef<TabType | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [newHistoryCount, setNewHistoryCount] = useState(0);
  
  const [appMode, setAppMode] = useState<'kryptonpath' | 'krypto-ai'>('kryptonpath');
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
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn') || '';
      if (!email) {
        email = window.prompt('Please confirm your signing email address for validation:') || '';
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            const pendingUsername = window.localStorage.getItem('pendingUsername');
            if (pendingUsername && result.user) {
              await updateProfile(result.user, {
                displayName: pendingUsername
              });
              window.localStorage.removeItem('pendingUsername');
            }
            // Clear location search criteria
            window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
          })
          .catch((error) => {
            console.error("Passwordless Sign In Error:", error);
          });
      }
    }
  }, []);

  const handleVerifyLocation = async (overrideUid?: string) => {
    setIsVerifyingLocation(true);
    
    const detectByIP = async () => {
      // Multiple highly precise, HTTPS-enabled IP geolocators with high free tiers
      const providers = [
        {
          url: 'https://ipwho.is/',
          parse: (data: any) => ({
            city: data.city,
            country: data.country,
            country_code: data.country_code
          })
        },
        {
          url: 'https://freeipapi.com/api/json',
          parse: (data: any) => ({
            city: data.cityName,
            country: data.countryName,
            country_code: data.countryCode
          })
        },
        {
          url: 'https://ipapi.co/json/',
          parse: (data: any) => ({
            city: data.city,
            country: data.country_name,
            country_code: data.country_code
          })
        }
      ];

      const targetUid = overrideUid || auth.currentUser?.uid;

      for (const provider of providers) {
        try {
          const res = await fetch(provider.url);
          if (!res.ok) continue;
          const data = await res.json();
          const parsed = provider.parse(data);
          
          if (parsed.country_code || parsed.city) {
            const isIndia = parsed.country_code === 'IN';
            const detectedCurrency = isIndia ? 'INR' : 'USD';
            const detectedSymbol = isIndia ? '₹' : '$';
            const detectedLocation = parsed.city && parsed.country
              ? `${parsed.city.toUpperCase()}, ${parsed.country.toUpperCase()}`
              : (isIndia ? 'INDIA' : (parsed.country ? parsed.country.toUpperCase() : 'GLOBAL'));
            
            setUser(prev => ({ 
              ...prev, 
              location: detectedLocation,
              currency: detectedCurrency, 
              symbol: detectedSymbol
            }));

            if (targetUid) {
              const userRef = doc(db, 'users', targetUid);
              await setDoc(userRef, {
                location: detectedLocation,
                currency: detectedCurrency,
                symbol: detectedSymbol
              }, { merge: true });
            }
            return; // Successful resolution
          }
        } catch (e) {
          console.warn(`IP geolocation provider ${provider.url} failed:`, e);
        }
      }
      
      // Fallback if IP geolocation providers fail or are blocked
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const isIndiaZone = timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Asia/Calcutta') || timeZone.includes('Asia/Colombo');
      const fallbackCurrency = isIndiaZone ? 'INR' : 'USD';
      const fallbackLocation = isIndiaZone ? 'MUMBAI, INDIA' : 'UNITED STATES';
      const fallbackSymbol = isIndiaZone ? '₹' : '$';

      setUser(prev => ({ 
        ...prev, 
        location: fallbackLocation,
        currency: fallbackCurrency,
        symbol: fallbackSymbol
      }));

      if (targetUid) {
        const userRef = doc(db, 'users', targetUid);
        await setDoc(userRef, {
          location: fallbackLocation,
          currency: fallbackCurrency,
          symbol: fallbackSymbol
        }, { merge: true });
      }
    };

    await detectByIP();
    setIsVerifyingLocation(false);
  };

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubHistory: (() => void) | null = null;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setSession(firebaseUser ? { user: firebaseUser } : null);
      if (firebaseUser) {
        if (pendingTabRef.current) {
          setActiveTab(pendingTabRef.current);
          pendingTabRef.current = null;
        }
        setShowCreditPopup(true);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;

        // Initialize user document if not exists
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              isPro: false,
              planId: 'free',
              credits: 0,
              trialUsed: false,
              location: '',
              currency: 'USD',
              symbol: '$',
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
          }
        } catch (err) {
          console.error("Error setting up user document in Firestore:", err);
        }

        // Detect user location & update currency pricing on successful login
        handleVerifyLocation(firebaseUser.uid);

        // Real-time synchronization for user profile document
        unsubUser = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUser(prev => ({
              ...prev,
              isPro: data.isPro ?? prev.isPro,
              planId: data.planId ?? prev.planId,
              credits: data.credits ?? prev.credits,
              trialUsed: data.trialUsed ?? prev.trialUsed,
              location: data.location ?? prev.location,
              currency: data.currency ?? prev.currency,
              symbol: data.symbol ?? prev.symbol,
              tasks: data.tasks ?? prev.tasks,
              profile: data.profile ?? prev.profile
            }));
          }
        });

        // Real-time synchronization for user's history collection
        const historyRef = collection(db, 'users', firebaseUser.uid, 'history');
        unsubHistory = onSnapshot(historyRef, (snapshot) => {
          const list: HistoryItem[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as HistoryItem);
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setUser(prev => ({
            ...prev,
            history: list
          }));
        });
      } else {
        // Clean up listeners
        if (unsubUser) unsubUser();
        if (unsubHistory) unsubHistory();
        setUser({
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
      }
    });

    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
      if (unsubHistory) unsubHistory();
    };
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

  // Media access is requested on-demand directly inside the SimulationUI component now.

  const handleLogout = async () => {
    await auth.signOut();
    setGuestUser(null);
    setSession(null);
    setActiveTab('Home');
  };

  const deductCredits = (amount: number): boolean => {
    if (user.credits < amount) { setActiveTab('Pricing'); return false; }
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { credits: user.credits - amount }, { merge: true }).catch(err => {
        console.error("Firestore credits deduction error:", err);
      });
    } else {
      setUser(prev => ({ ...prev, credits: prev.credits - amount }));
    }
    return true;
  };

  const awardCredits = (amount: number) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { credits: user.credits + amount }, { merge: true }).catch(err => {
        console.error("Firestore credits award error:", err);
      });
    } else {
      setUser(prev => ({ ...prev, credits: prev.credits + amount }));
    }
  };

  const handleUpdateUser = (update: Partial<UserStatus>) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const cleanUpdate: any = {};
      if (update.isPro !== undefined) cleanUpdate.isPro = update.isPro;
      if (update.planId !== undefined) cleanUpdate.planId = update.planId;
      if (update.credits !== undefined) cleanUpdate.credits = update.credits;
      if (update.trialUsed !== undefined) cleanUpdate.trialUsed = update.trialUsed;
      if (update.location !== undefined) cleanUpdate.location = update.location;
      if (update.currency !== undefined) cleanUpdate.currency = update.currency;
      if (update.symbol !== undefined) cleanUpdate.symbol = update.symbol;
      if (update.tasks !== undefined) cleanUpdate.tasks = update.tasks;
      if (update.profile !== undefined) cleanUpdate.profile = update.profile;

      setDoc(userRef, cleanUpdate, { merge: true }).catch(err => {
        console.error("Firestore user update error:", err);
      });
    } else {
      setUser(prev => ({ ...prev, ...update }));
    }
  };

  const saveToHistory = (item: HistoryItem) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'history', item.id), item).catch(err => {
        console.error("Firestore history save error:", err);
      });
    } else {
      setUser(prev => ({ ...prev, history: [item, ...prev.history] }));
    }
    if (activeTab !== 'History') setNewHistoryCount(prev => prev + 1);
  };

  const handleDeleteHistory = (id: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'history', id)).catch(err => {
        console.error("Firestore history delete error:", err);
      });
    } else {
      setUser(prev => ({ ...prev, history: prev.history.filter(h => h.id !== id) }));
    }
  };

  const handleNewChat = () => {
    setChatMessages([{
        role: 'model',
        content: "Welcome, Career Aspirant! I'm your personal AI Career Coach. How can I assist your mission today?"
    }]);
  };

  const handleTabChange = (tab: TabType) => {
    const isPublicTab = tab === 'Home' || tab.startsWith('Lab-');
    if (!currentSession && !isPublicTab) {
      pendingTabRef.current = tab;
      setRequireLogin(true);
    } else {
      setActiveTab(tab);
    }
  };

  if (appMode === 'kryptonpath') {
    return (
      <>
        <KryptonPath onLaunchKrypto={() => setAppMode('krypto-ai')} />
        {!cookieConsent && (
          <CookieBanner 
            onAccept={() => handleCookieAccept('accepted')} 
            onDecline={() => handleCookieAccept('denied')} 
          />
        )}
      </>
    );
  }

  if (requireLogin && !currentSession) {
    return (
      <Login 
        onClose={() => {
          pendingTabRef.current = null;
          setRequireLogin(false);
        }} 
      />
    );
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="flex min-h-screen bg-transparent text-zinc-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
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
                      handleTabChange('Profile & Roadmap');
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
            {session ? (
              <button onClick={() => handleTabChange('Profile & Roadmap')} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                <img src={user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${session?.user?.email || 'guest@krypto.ai'}&background=18181b&color=eab308`} alt="User" className="w-full h-full rounded-full" />
              </button>
            ) : (
              <button 
                onClick={() => setRequireLogin(true)} 
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)] header-login-btn font-sans shrink-0"
              >
                Log In
              </button>
            )}
          </div>
        </header>
        <section ref={scrollRef} className="flex-1 overflow-y-auto bg-transparent flex flex-col justify-between">
          <div className="flex-1 pb-12">
            {(() => {
              switch (activeTab) {
                case 'Home': return (
                  <Dashboard 
                    onUse={deductCredits} 
                    onNavigatePricing={() => handleTabChange('Pricing')} 
                    setActiveTab={handleTabChange} 
                    userCredits={user.credits} 
                    messages={chatMessages} 
                    setMessages={setChatMessages} 
                    onNewChat={handleNewChat} 
                    onVerifyLocation={handleVerifyLocation}
                    onUpdateLocation={(l) => handleUpdateUser({ location: l.toUpperCase() })}
                    isLoggedIn={!!currentSession}
                    onRequireLogin={() => setRequireLogin(true)}
                  />
                );
                case 'Profile & Roadmap': return <Profile user={user} userEmail={currentSession?.user?.email} onUpdateUser={handleUpdateUser} onAwardCredits={awardCredits} />;
                case 'Resume Scorer': return <ResumeScorer userProfile={user.profile} userCredits={user.credits} onUse={deductCredits} maxImprovements={10} onNavigatePricing={() => handleTabChange('Pricing')} onSaveHistory={saveToHistory} persistedData={{ file: resumeFile, result: resumeResult, formattedResume: formattedResume, resumeData: resumeData }} setPersistedData={{ setFile: setResumeFile, setResult: setResumeResult, setFormattedResume: setFormattedResume, setResumeData: setResumeData }} />;
                case 'Career Path': return <CareerPath userPlanId={user.planId} userCredits={user.credits} userLocation={user.location} userSymbol={user.symbol} onUse={deductCredits} onNavigatePricing={() => handleTabChange('Pricing')} onSaveHistory={saveToHistory} onVerifyLocation={handleVerifyLocation} isVerifyingLocation={isVerifyingLocation} onNavigateResumeScorer={() => handleTabChange('Resume Scorer')} onSetManualLocation={(l) => handleUpdateUser({ location: l.toUpperCase() })} persistedData={{ result: careerResult, scores: careerScores, dnaCode: careerDnaCode, userType: careerUserType, resumeData: careerResumeData }} setPersistedData={{ setResult: setCareerResult, setScores: setCareerScores, setDnaCode: setCareerDnaCode, setUserType: setCareerUserType, setResumeData: setCareerResumeData }} />;
                case 'Outreach Architect': return <OutreachArchitect userProfile={user.profile} userCredits={user.credits} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => handleTabChange('Pricing')} />;
                case 'Interview Lab': return <InterviewLab userCredits={user.credits} userLocation={user.location} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => handleTabChange('Pricing')} onStartSimulation={(inputs, jd) => { setSimInputs(inputs); setSimJd(jd); handleTabChange('Simulation'); }} />;
                case 'Simulation': return <SimulationUI user={user} inputs={simInputs} jdData={simJd} onAwardCredits={awardCredits} onExit={() => handleTabChange('Interview Lab')} onComplete={(audit) => { saveToHistory({ id: Math.random().toString(36).substr(2, 9), type: 'interview-simulation', title: `Audit: ${simInputs.company}`, date: new Date().toLocaleDateString(), inputs: simInputs, result: audit }); handleTabChange('History'); }} />;
                case 'History': return <History history={user.history} chatHistory={chatHistory} onDeleteHistory={handleDeleteHistory} onDeleteChat={(id) => setChatHistory(prev => prev.filter(c => c.id !== id))} />;
                case 'Pricing': return <Pricing user={user} onUpgrade={(p) => handleUpdateUser({ planId: p.id, credits: user.credits + (p.credits as number) })} />;
                case 'Consultation': return (
                  <div className="max-w-6xl mx-auto px-6 py-12">
                    <ConsultationBooking />
                  </div>
                );
                case 'Credit System': return <UnitLedger />;
                case 'Refer': return (
                  <Refer 
                    user={user} 
                    userEmail={currentSession?.user?.email} 
                    onUpdateUser={handleUpdateUser} 
                    onAwardCredits={awardCredits} 
                    onBack={() => handleTabChange('Home')} 
                  />
                );
                case 'Feedback': return (
                  <FeedbackSupport 
                    onBack={() => handleTabChange('Home')} 
                  />
                );
                
                /* Attribute Deep Dive Pages */
                case 'Lab-ATS': return <AtsLabAttributes />;
                case 'Lab-Career': return <CareerLabAttributes onNavigatePricing={() => handleTabChange('Pricing')} />;
                case 'Lab-Outreach': return <OutreachLabAttributes />;
                case 'Lab-Interview': return <InterviewLabAttributes />;
                case 'FAQ': return <KryptoFaq onBack={() => handleTabChange('Home')} />;
  
                default: return <Dashboard onUse={deductCredits} onNavigatePricing={() => handleTabChange('Pricing')} userCredits={user.credits} messages={chatMessages} setMessages={setChatMessages} onNewChat={handleNewChat} isLoggedIn={!!currentSession} onRequireLogin={() => setRequireLogin(true)} />;
              }
            })()}
          </div>
          {activeTab !== 'Simulation' && (
            <footer className="mt-auto border-t border-zinc-900/60 py-8 px-6 text-center bg-[#050505]/20 backdrop-blur-sm shrink-0">
              <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">© 2026 KryptonPath Organization. All rights reserved.</p>
            </footer>
          )}
        </section>
      </main>
      {!cookieConsent && (
        <CookieBanner 
          onAccept={() => handleCookieAccept('accepted')} 
          onDecline={() => handleCookieAccept('denied')} 
        />
      )}

    </div>
    </ErrorBoundary>
  );
};

export default App;