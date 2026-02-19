import React, { useState, useRef, useEffect } from 'react';
import { UserStatus, ProfileMetadata, ProfileTasks } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from 'mammoth';

interface ProfileProps {
  user: UserStatus;
  onUpdateUser: (update: Partial<UserStatus>) => void;
  onAwardCredits: (amount: number) => void;
}

const TASK_CREDITS = {
  profilePic: 5,
  resumeAdded: 20,
  compAdded: 10,
  noticeAdded: 5,
  scorerUsed: 5,
  careerUsed: 10,
  outreachUsed: 5,
  interviewUsed: 5
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar ($)' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar ($)' },
  { code: 'SGD', symbol: '$', label: 'Singapore Dollar ($)' },
];

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onAwardCredits }) => {
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileMetadata>(user.profile || {
    compensation: { fixed: '', variable: '' }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Profile Missions logic
  const profileTaskKeys: (keyof ProfileTasks)[] = ['profilePic', 'resumeAdded', 'compAdded', 'noticeAdded'];
  const completedProfileTasks = profileTaskKeys.filter(key => user.tasks[key]).length;
  const profileProgress = Math.round((completedProfileTasks / profileTaskKeys.length) * 100);
  const profileRewards = profileTaskKeys.reduce((sum, key) => sum + (user.tasks[key] ? TASK_CREDITS[key] : 0), 0);

  // Career Missions logic
  const careerTaskKeys: (keyof ProfileTasks)[] = ['scorerUsed', 'careerUsed', 'outreachUsed', 'interviewUsed'];
  const completedCareerTasks = careerTaskKeys.filter(key => user.tasks[key]).length;
  const careerProgress = Math.round((completedCareerTasks / careerTaskKeys.length) * 100);
  const careerRewards = careerTaskKeys.reduce((sum, key) => sum + (user.tasks[key] ? TASK_CREDITS[key] : 0), 0);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const updatedProfile = { ...tempProfile, avatarUrl: url };
      setTempProfile(updatedProfile);
      
      const newTasks = { ...user.tasks };
      if (!newTasks.profilePic) {
        newTasks.profilePic = true;
        onAwardCredits(TASK_CREDITS.profilePic);
      }
      onUpdateUser({ profile: updatedProfile, tasks: newTasks });
    };
    reader.readAsDataURL(file);
  };

  const handleResumeParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      let text = '';
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            parts: [
              { inlineData: { data: base64, mimeType: file.type } },
              { text: "Extract the following details from this resume into a JSON object: name, email, phone, currentCompany, currentDesignation, educationGraduate (degree and school), educationMasters (degree and school, if exists). If a field is missing, use an empty string." }
            ]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                currentCompany: { type: Type.STRING },
                currentDesignation: { type: Type.STRING },
                educationGraduate: { type: Type.STRING },
                educationMasters: { type: Type.STRING }
              }
            }
          }
        });
        
        const data = JSON.parse(response.text || '{}');
        const updatedProfile: ProfileMetadata = {
          ...tempProfile,
          name: data.name,
          email: data.email,
          phone: data.phone,
          currentCompany: data.currentCompany,
          currentDesignation: data.currentDesignation,
          education: {
            graduate: data.educationGraduate,
            masters: data.educationMasters
          }
        };
        setTempProfile(updatedProfile);
        return;
      } else {
        text = await file.text();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract info from this resume text into JSON: name, email, phone, currentCompany, currentDesignation, educationGraduate, educationMasters.\n\n${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              currentCompany: { type: Type.STRING },
              currentDesignation: { type: Type.STRING },
              educationGraduate: { type: Type.STRING },
              educationMasters: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const updatedProfile: ProfileMetadata = {
        ...tempProfile,
        name: data.name,
        email: data.email,
        phone: data.phone,
        currentCompany: data.currentCompany,
        currentDesignation: data.currentDesignation,
        education: {
          graduate: data.educationGraduate,
          masters: data.educationMasters
        }
      };
      setTempProfile(updatedProfile);
    } catch (err) {
      console.error("Resume parsing failed", err);
      alert("AI Parsing failed. Please fill in details manually.");
    } finally {
      setParsing(false);
    }
  };

  const saveResumeInfo = (profileData: ProfileMetadata) => {
    const newTasks = { ...user.tasks };
    if (!newTasks.resumeAdded) {
      newTasks.resumeAdded = true;
      onAwardCredits(TASK_CREDITS.resumeAdded);
    }
    onUpdateUser({ profile: profileData, tasks: newTasks });
  };

  const handleManualSave = () => {
    saveResumeInfo(tempProfile);
    alert("Profile information secured.");
  };

  const handleCompSave = () => {
    const newTasks = { ...user.tasks };
    if (!newTasks.compAdded) {
      newTasks.compAdded = true;
      onAwardCredits(TASK_CREDITS.compAdded);
    }
    onUpdateUser({ profile: tempProfile, tasks: newTasks });
    alert("Compensation architecture saved.");
  };

  const handleNoticeSave = () => {
    const newTasks = { ...user.tasks };
    if (!newTasks.noticeAdded) {
      newTasks.noticeAdded = true;
      onAwardCredits(TASK_CREDITS.noticeAdded);
    }
    onUpdateUser({ profile: tempProfile, tasks: newTasks });
    alert("Notice period calibrated.");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CURRENCIES.find(c => c.code === e.target.value);
    if (selected) {
      // Logic: Selecting INR switches plan to INR environment. 
      // Selecting anything else defaults payment plan to USD, regardless of compensation currency.
      onUpdateUser({ currency: selected.code, symbol: selected.symbol });
    }
  };

  const TaskItem = ({ num, label, credits, completed, intro, attributes }: { num: number, label: string, credits: number, completed: boolean, intro?: string, attributes?: string[] }) => (
    <div className={`p-6 bg-zinc-900/50 border border-zinc-800 rounded-[32px] group hover:border-yellow-500/30 transition-all ${intro ? 'flex flex-col gap-6' : 'flex items-center justify-between'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${completed ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600 group-hover:border-yellow-500/30'}`}>
          {completed ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <span className="text-xs font-black">{num}</span>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-black uppercase tracking-tight ${completed ? 'text-zinc-400' : 'text-zinc-100'}`}>{label}</p>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Award: <span className="text-yellow-500 font-black">{credits} Free Credits</span></p>
        </div>
        {!intro && completed && (
          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Claimed</span>
        )}
      </div>
      
      {intro && (
        <div className="space-y-4 ml-14 border-l border-zinc-800 pl-6 relative">
          <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">{intro}</p>
          {attributes && (
            <div className="flex flex-wrap gap-2">
              {attributes.map(attr => (
                <span key={attr} className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-yellow-500/80 group-hover:border-yellow-500/30 transition-all">
                  {attr}
                </span>
              ))}
            </div>
          )}
          {completed && (
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              <span className="text-[8px] font-black uppercase tracking-widest text-green-500">Milestone Secured</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-24 pb-40 animate-in fade-in duration-700">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl sm:text-7xl font-black tracking-tight uppercase text-zinc-100">
          Architect <span className="gold-text-gradient">Profile</span>
        </h2>
        <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Engineer your professional footprint. Complete tasks to unlock high-performance recruitment credits.
        </p>
      </div>

      {/* SECTION 1: PROFESSIONAL DATA INPUTS */}
      <div className="space-y-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">Profile Completion</span>
              <span className="text-lg font-black text-zinc-100">{profileProgress}%</span>
            </div>
            <div className="h-3 bg-zinc-900/50 rounded-full border border-zinc-800 p-0.5 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                style={{ width: `${profileProgress}%` }}
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Profile Rewards Accrued</span>
            <span className="text-xl font-black text-yellow-500">{profileRewards} <span className="text-[10px] text-zinc-600">CR</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Data Architecture Panels */}
          <div className="lg:col-span-8 space-y-12">
            {/* Avatar & Basic Info */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-10 shadow-3xl space-y-10">
              <div className="flex flex-col sm:flex-row items-center gap-10">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-yellow-500/50">
                     {tempProfile.avatarUrl ? (
                       <img src={tempProfile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                     ) : (
                       <svg className="w-10 h-10 text-zinc-700 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     )}
                   </div>
                   <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                 </div>
                 
                 <div className="flex-1 space-y-4 w-full">
                    <button 
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={parsing}
                      className={`w-full py-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${parsing ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-zinc-800 hover:border-yellow-500/20 bg-zinc-950'}`}
                    >
                      {parsing ? <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">Parsing Intelligence...</span> : <><svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Auto-Parse Resume DNA</span></>}
                    </button>
                    <input type="file" ref={resumeInputRef} onChange={handleResumeParse} className="hidden" accept=".pdf,.docx,.txt" />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-zinc-900">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Architect Name</label>
                   <input value={tempProfile.name || ''} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder="LEO ARCHITECT" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Secure Email</label>
                   <input value={tempProfile.email || ''} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder="leo@krypto.ai" />
                 </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Education Hierarchy</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input value={tempProfile.education?.graduate || ''} onChange={e => setTempProfile({...tempProfile, education: {...tempProfile.education, graduate: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder="GRADUATE CREDENTIALS" />
                  <input value={tempProfile.education?.masters || ''} onChange={e => setTempProfile({...tempProfile, education: {...tempProfile.education, masters: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder="MASTERS SPECIALIZATION" />
                </div>
              </div>

              <button onClick={handleManualSave} className="w-full py-5 bg-zinc-100 text-zinc-950 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-500 transition-all shadow-xl active:scale-95 border-b-4 border-zinc-300">
                 Save Professional Architecture
              </button>
            </div>

            {/* Compensation & Notice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 shadow-3xl space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-zinc-100 uppercase tracking-tight">Compensation</h4>
                      <div className="relative group">
                         <select 
                           value={user.currency} 
                           onChange={handleCurrencyChange}
                           className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[9px] font-black text-yellow-500 uppercase tracking-widest outline-none focus:border-yellow-500/50 transition-all appearance-none cursor-pointer"
                         >
                           {CURRENCIES.map(c => (
                             <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                           ))}
                         </select>
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover:text-yellow-500">
                           <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                       <input value={tempProfile.compensation?.fixed || ''} onChange={e => setTempProfile({...tempProfile, compensation: {...(tempProfile.compensation || {fixed: '', variable: ''}), fixed: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder={`FIXED (${user.symbol})`} />
                       <input value={tempProfile.compensation?.variable || ''} onChange={e => setTempProfile({...tempProfile, compensation: {...(tempProfile.compensation || {fixed: '', variable: ''}), variable: e.target.value}})} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-100 outline-none focus:border-yellow-500/50" placeholder={`VARIABLE (${user.symbol})`} />
                    </div>
                  </div>
                  <button onClick={handleCompSave} className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-yellow-500/30 transition-all active:scale-95">Update Compensation</button>
               </div>

               <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[48px] p-8 shadow-3xl space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <h4 className="text-lg font-black text-zinc-100 uppercase tracking-tight">Availability</h4>
                    <select value={tempProfile.noticePeriod || ''} onChange={e => setTempProfile({...tempProfile, noticePeriod: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold uppercase text-zinc-100 outline-none focus:border-yellow-500/50">
                       <option value="">SELECT PROTOCOL...</option>
                       <option value="Immediate">IMMEDIATE AVAILABILITY</option>
                       <option value="30 Days">30 DAYS PROTOCOL</option>
                       <option value="60 Days">60 DAYS PROTOCOL</option>
                       <option value="90 Days">90 DAYS PROTOCOL</option>
                    </select>
                  </div>
                  <button onClick={handleNoticeSave} className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-yellow-500/30 transition-all active:scale-95">Update Availability</button>
               </div>
            </div>
          </div>

          {/* Static Missions Summary */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] px-4">Identity Missions</h3>
            <div className="space-y-3">
               <TaskItem num={1} label="Add Profile Picture" credits={TASK_CREDITS.profilePic} completed={user.tasks.profilePic} />
               <TaskItem num={2} label="Integrate Resume DNA" credits={TASK_CREDITS.resumeAdded} completed={user.tasks.resumeAdded} />
               <TaskItem num={3} label="Calibrate Compensation" credits={TASK_CREDITS.compAdded} completed={user.tasks.compAdded} />
               <TaskItem num={4} label="Define Availability" credits={TASK_CREDITS.noticeAdded} completed={user.tasks.noticeAdded} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAREER ROADMAP */}
      <div className="space-y-16 pt-16 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black uppercase text-zinc-100 tracking-tighter">Career <span className="text-blue-500">Roadmap</span></h3>
            <p className="text-zinc-500 text-sm font-medium">Stepwise strategic deployment for professional market entry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Mission Completion</span>
                <span className="text-lg font-black text-zinc-100">{careerProgress}%</span>
              </div>
              <div className="h-3 bg-zinc-900/50 rounded-full border border-zinc-800 p-0.5 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  style={{ width: `${careerProgress}%` }}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex items-center justify-between">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Career Rewards Accrued</span>
              <span className="text-xl font-black text-blue-400">{careerRewards} <span className="text-[10px] text-zinc-600">CR</span></span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 relative before:absolute before:left-[31px] before:top-10 before:bottom-10 before:w-px before:bg-zinc-800/50 before:z-0">
            <TaskItem 
              num={5} 
              label="Step 1: Execute First Resume Audit" 
              credits={TASK_CREDITS.scorerUsed} 
              completed={user.tasks.scorerUsed}
              intro="The foundational validation layer. Our audit identifies semantic gaps and technical rejection triggers before a human ever sees your application. Upgrading to a **Fully Optimized Resume** applies the elite Google XYZ formula, providing a blueprint engineered for 100% ATS compatibility and recruiter impact."
              attributes={['Semantic Gap Analysis', 'ATS Parsability Audit', 'Google XYZ Optimization']}
            />
            <TaskItem 
              num={6} 
              label="Step 2: Generate Career Intelligence" 
              credits={TASK_CREDITS.careerUsed} 
              completed={user.tasks.careerUsed}
              intro="Strategic positioning is critical for long-term yield. **Strategy Blueprints** provide an actionable technical track and course roadmap, while **Market Insights** utilize real-time search intelligence to identify hiring hubs and localized salary benchmarks—ensuring you pivot into high-velocity opportunity zones."
              attributes={['Tactical Strategy Blueprints', 'Localized Market Insights', 'Hub Signal Analysis']}
            />
            <TaskItem 
              num={7} 
              label="Step 3: Deploy Outreach Protocol" 
              credits={TASK_CREDITS.outreachUsed} 
              completed={user.tasks.outreachUsed}
              intro="Direct engagement with high-status decision-makers. The **Conversation Forge** re-architects standard networking into a high-conversion protocol by using real-time company trajectory signals and personalized hook logic that virtually guarantees a stakeholder response."
              attributes={['Conversation Forge', 'Hyper-Personalized Hooks', 'Vision Tone Modulation']}
            />
            <TaskItem 
              num={8} 
              label="Step 4: Final Interview Validation" 
              credits={TASK_CREDITS.interviewUsed} 
              completed={user.tasks.interviewUsed}
              intro="The final hurdle. Our simulation uses organization-specific data to stress-test your technical and behavioral responses. The proprietary **Personalized Worthiness Index** is our definitive signal, predicting your attitudinal resilience and long-term cultural alignment within the target organizational structure."
              attributes={['Worthiness Index', 'Behavioral Stress Vectors', 'Technical Readiness Lab']}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;