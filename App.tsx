
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ResumeScorer from './components/ResumeScorer';
import CareerPath from './components/CareerPath';
import OutreachArchitect from './components/OutreachArchitect';
import InterviewLab from './components/InterviewLab';
import History from './components/History';
import Pricing from './components/Pricing';
import UnitLedger from './components/UnitLedger';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import { TabType, UserStatus, PricingPlan, PlanId, FeatureAccess, HistoryItem } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  
  const [user, setUser] = useState<UserStatus>({
    isPro: false,
    planId: 'free',
    credits: 20, 
    trialUsed: false,
    location: '', 
    currency: 'USD',
    symbol: '$',
    history: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

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
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const geoData = await geoRes.json();
            const address = geoData.address;
            
            const area = address.suburb || address.neighbourhood || address.quarter || address.city_district || address.township || '';
            const city = address.city || address.town || address.village || '';
            const country = address.country || '';
            
            const parts = [];
            if (area) parts.push(area);
            if (city && city !== area) parts.push(city);
            if (country) parts.push(country);
            
            const locationStr = parts.length > 0 ? parts.join(', ') : 'Verified Location';
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
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const locationStr = data.city && data.country_name ? `${data.city}, ${data.country_name}` : 'Global Market';
      setUser(prev => ({ ...prev, location: locationStr }));
    } catch (err) {
      setUser(prev => ({ ...prev, location: 'Global Market' }));
    }
  };

  const setManualLocation = (loc: string) => {
    setUser(prev => ({ ...prev, location: loc }));
  };

  const handleLogout = async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    setGuestUser(null);
    setSession(null);
    setActiveTab('Home');
    setIsSidebarOpen(false);
  };

  const deductCredits = (amount: number): boolean => {
    if (user.credits < amount) { setActiveTab('Pricing'); return false; }
    setUser(prev => ({ ...prev, credits: prev.credits - amount }));
    return true;
  };

  const saveToHistory = (item: HistoryItem) => {
    setUser(prev => ({ ...prev, history: [item, ...prev.history] }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <Dashboard onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} setActiveTab={setActiveTab} userCredits={user.credits} />;
      case 'Resume Scorer': return (
        <ResumeScorer 
          userCredits={user.credits} 
          onUse={deductCredits} 
          maxImprovements={10} 
          onNavigatePricing={() => setActiveTab('Pricing')} 
          onSaveHistory={saveToHistory}
        />
      );
      case 'Career Path': return (
        <CareerPath 
          userCredits={user.credits} 
          userLocation={user.location} 
          onUse={deductCredits} 
          onNavigatePricing={() => setActiveTab('Pricing')} 
          onSaveHistory={saveToHistory} 
          onVerifyLocation={handleVerifyLocation} 
          isVerifyingLocation={isVerifyingLocation} 
          onNavigateResumeScorer={() => setActiveTab('Resume Scorer')} 
          onSetManualLocation={setManualLocation}
        />
      );
      case 'Outreach Architect': return < OutreachArchitect userCredits={user.credits} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} />;
      case 'Interview Lab': return <InterviewLab userCredits={user.credits} userLocation={user.location} onUse={deductCredits} onSaveHistory={saveToHistory} onNavigatePricing={() => setActiveTab('Pricing')} />;
      case 'History': return <History history={user.history} />;
      case 'Pricing': return <Pricing user={user} onUpgrade={(p) => setUser(prev => ({...prev, planId: p.id, credits: prev.credits + (p.credits as number)}))} />;
      case 'Credit System': return <UnitLedger />;
      default: return <Dashboard onUse={deductCredits} onNavigatePricing={() => setActiveTab('Pricing')} userCredits={user.credits} />;
    }
  };

  const currentSession = session || guestUser;

  if (!currentSession) return <Login onGuestLogin={() => setGuestUser({ user: { email: 'architect@krypto.ai' } })} />;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        user={user} 
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
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

            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden ring-2 ring-transparent hover:ring-yellow-500/20 transition-all p-0.5">
               <img 
                 src={`https://ui-avatars.com/api/?name=${currentSession.user.email}&background=18181b&color=eab308`} 
                 alt="User" 
                 className="w-full h-full rounded-full"
               />
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto pb-20">{renderContent()}</section>
      </main>
    </div>
  );
};

export default App;
