import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SimulationMessage, UserStatus } from '../types';
import { getStreamingInterviewQuestion, getInterviewSummary, auditFullInterview, generateTTS } from '../services/geminiService';
import { KryptoLogo } from './Branding';
import { GoogleGenAI } from "@google/genai";

interface SimulationUIProps {
  inputs: any;
  jdData: string | null;
  onComplete: (audit: string) => void;
  onExit: () => void;
  onAwardCredits: (amt: number) => void;
  user: UserStatus;
}

const STATIC_VIDEOS = {
  US: {
    SPEAK: "https://vjs.zencdn.net/v/oceans.mp4#t=5,13",
    WAIT: "https://vjs.zencdn.net/v/oceans.mp4#t=15,25"
  },
  INDIA: {
    SPEAK: "https://vjs.zencdn.net/v/oceans.mp4#t=30,38",
    WAIT: "https://vjs.zencdn.net/v/oceans.mp4#t=40,50"
  }
};

const SimulationUI: React.FC<SimulationUIProps> = ({ inputs, jdData, onComplete, onExit, onAwardCredits, user }) => {
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [historySummary, setHistorySummary] = useState('Simulation initialized.');
  const [isComplete, setIsComplete] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [silentAttempts, setSilentAttempts] = useState(0);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  
  // Audio/Video Controls
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // Interaction & Video States
  const [mode, setMode] = useState<'initializing' | 'speaking' | 'waiting' | 'thinking'>('initializing');
  const [speakVideo, setSpeakVideo] = useState<string | null>(null);
  const [waitVideo, setWaitVideo] = useState<string | null>(null);
  const [assetProgress, setAssetProgress] = useState(0);
  const [timerCount, setTimerCount] = useState(10);
  const [visualContext, setVisualContext] = useState("Candidate is engaged.");

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const idleTimerRef = useRef<number | null>(null);
  const visualAnalysisInterval = useRef<number | null>(null);
  const activeAudioRef = useRef<{ stop: () => void } | null>(null);
  const currentSpeechIdRef = useRef<number>(0);

  const isIndia = (inputs.location?.toUpperCase().includes('INDIA') || user.location?.toUpperCase().includes('INDIA') || user.currency === 'INR');
  const region = isIndia ? 'INDIA' : 'US';
  const personaName = isIndia ? "Ananya" : "Marcus";
  const voiceLang = isIndia ? "en-IN" : "en-US";

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Camera/Mic access denied or unavailable.");
      }

      setMode('initializing');
      setAssetProgress(20);
      
      setTimeout(() => {
        setAssetProgress(60);
        const assets = STATIC_VIDEOS[region];
        setSpeakVideo(assets.SPEAK);
        setWaitVideo(assets.WAIT);
        
        setTimeout(() => {
          setAssetProgress(100);
          setMode('waiting');
          handleNextTurn("");
        }, 1500);
      }, 1000);
    };

    initSession();
    setupSpeechRecognition();

    return () => {
      if (visualAnalysisInterval.current) clearInterval(visualAnalysisInterval.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      window.speechSynthesis.cancel();
      if (activeAudioRef.current) activeAudioRef.current.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceLang;
      recognitionRef.current.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => (r as any)[0].transcript).join('');
        setCurrentInput(transcript);
        resetIdleTimer();
      };
    }
  };

  useEffect(() => {
    if (mode === 'initializing' || isComplete) return;

    visualAnalysisInterval.current = window.setInterval(async () => {
      if (!userVideoRef.current || !cameraEnabled) return;

      const canvas = canvasRef.current;
      const video = userVideoRef.current;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            parts: [
              { inlineData: { data: base64, mimeType: 'image/jpeg' } },
              { text: "Briefly note candidate's vibe (e.g. 'Focused'). 1 word." }
            ]
          }]
        });
        setVisualContext(response.text || "Engaged.");
      } catch (e) {}
    }, 60000);

    return () => {
      if (visualAnalysisInterval.current) clearInterval(visualAnalysisInterval.current);
    };
  }, [mode, isComplete, cameraEnabled]);

  const handleNoResponse = () => {
    setSilentAttempts(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowQuitDialog(true);
        if (idleTimerRef.current) clearInterval(idleTimerRef.current);
        return next;
      }
      // Re-read the last question instead of asking a new one
      const lastMsg = messages.filter(m => m.role === 'interviewer').pop();
      if (lastMsg) {
        setMode('thinking');
        speakText(lastMsg.content);
      }
      return next;
    });
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    setTimerCount(10);
    idleTimerRef.current = window.setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(idleTimerRef.current!);
          handleNoResponse();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const speakText = async (text: string) => {
    window.speechSynthesis.cancel();
    if (activeAudioRef.current) activeAudioRef.current.stop();
    
    currentSpeechIdRef.current += 1;
    const mySpeechId = currentSpeechIdRef.current;
    
    // We strictly use the generated TTS directly from Gemini now.
    const ttsData = await generateTTS(text);
    
    // If a new speech request was made while we were generating TTS, abort this one
    if (currentSpeechIdRef.current !== mySpeechId) return;

    if (ttsData && ttsData.data) {
      if (ttsData.mimeType.includes("pcm") || ttsData.mimeType.includes("l16")) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const binaryStr = atob(ttsData.data);
          const audioBuffer = audioCtx.createBuffer(1, binaryStr.length / 2, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < binaryStr.length / 2; i++) {
            let ls = binaryStr.charCodeAt(i * 2);
            let ms = binaryStr.charCodeAt(i * 2 + 1);
            let val = (ms << 8) | ls;
            if (val >= 0x8000) val -= 0x10000;
            channelData[i] = val / 0x8000;
          }
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          
          activeAudioRef.current = {
            stop: () => source.stop()
          };
          
          setMode('speaking');
          if (idleTimerRef.current) clearInterval(idleTimerRef.current);
          recognitionRef.current?.stop();
          
          source.onended = () => {
            if (currentSpeechIdRef.current !== mySpeechId) return;
            setMode('waiting');
            if (micEnabled) recognitionRef.current?.start();
            resetIdleTimer();
          };
          source.start();
          return;
        } catch (e) {
          console.error("Audio Context Error", e);
        }
      } else {
        try {
          const binaryStr = atob(ttsData.data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: ttsData.mimeType });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          activeAudioRef.current = {
            stop: () => {
              audio.pause();
              audio.currentTime = 0;
            }
          };

          setMode('speaking');
          if (idleTimerRef.current) clearInterval(idleTimerRef.current);
          recognitionRef.current?.stop();
          
          audio.onended = () => {
            if (currentSpeechIdRef.current !== mySpeechId) return;
            setMode('waiting');
            if (micEnabled) recognitionRef.current?.start();
            resetIdleTimer();
            URL.revokeObjectURL(url);
          };
          audio.play();
          return;
        } catch (e) {
          console.error("HTML Audio Error", e);
        }
      }
    }
    
    // Fallback if TTS fails: just advance state
    setTimeout(() => {
      if (currentSpeechIdRef.current !== mySpeechId) return;
      setMode('waiting');
      if (micEnabled) recognitionRef.current?.start();
      resetIdleTimer();
    }, 2000);
  };

  const isProcessingTurnRef = useRef(false);

  const handleNextTurn = async (userAnswer: string) => {
    if (isProcessingTurnRef.current) return;
    isProcessingTurnRef.current = true;
    
    // Clear idle timer explicitly so it doesn't fire while AI is generating
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    recognitionRef.current?.stop();
    
    // Reset silent attempts if user responded
    if (userAnswer && userAnswer !== "... (No response detected) ...") {
      setSilentAttempts(0);
      setCurrentInput(''); // Clear the input field immediately
    }
    
    if (userAnswer) {
      setMessages(prev => [...prev, { role: 'candidate', content: userAnswer, timestamp: Date.now() }]);
    }

    if (questionCount >= 10) {
      finalizeSimulation();
      return;
    }

    setIsAiTyping(true);
    setMode('thinking');
    let fullContent = "";
    try {
      const stream = await getStreamingInterviewQuestion(
        inputs, 
        jdData, 
        `${historySummary} | Vibe: ${visualContext}`, 
        userAnswer, 
        questionCount
      );
      
      const newAiMsg: SimulationMessage = { role: 'interviewer', content: "", timestamp: Date.now() };
      setMessages(prev => [...prev, newAiMsg]);

      for await (const chunk of stream) {
        fullContent += chunk.text || "";
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullContent;
          return updated;
        });
      }

      speakText(fullContent);
      setQuestionCount(prev => prev + 1);

      if (messages.length > 0) {
        const summary = await getInterviewSummary([...messages, { role: 'interviewer', content: fullContent, timestamp: Date.now() }]);
        setHistorySummary(summary);
      }
    } catch (e) {
      setMode('waiting');
    } finally {
      setIsAiTyping(false);
      isProcessingTurnRef.current = false;
    }
  };

  const finalizeSimulation = async () => {
    setIsComplete(true);
    setAuditLoading(true);
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    window.speechSynthesis.cancel();
    
    try {
      const audit = await auditFullInterview(messages, inputs);
      onComplete(audit);
    } catch (e) {
      onExit();
    } finally {
      setAuditLoading(false);
    }
  };

  const visibleMessages = messages.slice(-1);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden animate-in fade-in duration-500 font-sans">
      
      {/* 1. INTERVIEWER LAYER (TEAMS BG) */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#121212] to-black">
        <div className={`relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-zinc-900 border-4 border-zinc-800 transition-all duration-700 ${mode === 'speaking' ? 'shadow-[0_0_80px_rgba(234,179,8,0.15)] border-yellow-500/50' : ''}`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500/5 to-transparent"></div>
          <KryptoLogo size={80} className={`text-zinc-500 transition-all duration-500 ${mode === 'speaking' ? 'text-yellow-500 scale-110' : ''}`} />
          {mode === 'speaking' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/10 animate-ping delay-500" style={{ animationDuration: '2s' }} />
            </>
          )}
        </div>
        <p className="mt-8 text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em]">
          {mode === 'speaking' ? 'AI Interviewer • Speaking' : 'AI Interviewer • Listening'}
        </p>
      </div>

      {/* 2. USER PIP WEBCAM (Teams Style Overlay) */}
      <div className="absolute top-24 right-4 sm:top-auto sm:bottom-44 sm:right-8 w-28 sm:w-72 aspect-[3/4] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-40 bg-zinc-900 animate-in slide-in-from-top-8 sm:slide-in-from-right-8 duration-1000">
         {cameraEnabled ? (
           <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-zinc-800">
             <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500">
               <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </div>
           </div>
         )}
         
         {/* Teams style control bar overlay */}
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button onClick={toggleMic} className={`p-2 rounded-full transition-all ${micEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`} title={micEnabled ? "Mute Mic" : "Unmute Mic"}>
              {micEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              )}
            </button>
            <button onClick={toggleCamera} className={`p-2 rounded-full transition-all ${cameraEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`} title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}>
              {cameraEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              )}
            </button>
         </div>

         <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
            {mode === 'waiting' ? 'LISTENING' : 'YOU'}
         </div>
         {mode === 'waiting' && (
           <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-600/20 backdrop-blur-md flex items-center justify-center border border-red-500/40">
             <span className="text-[10px] font-black text-white">{timerCount}s</span>
           </div>
         )}
      </div>

      {/* 3. TEAMS HEADER */}
      <div className="relative z-30 h-20 sm:h-24 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <KryptoLogo size={32} className="drop-shadow-2xl sm:w-[40px] sm:h-[40px]" />
          <div className="h-6 sm:h-8 w-px bg-white/10" />
          <div>
            <h2 className="text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">{inputs.company}</h2>
            <p className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{personaName} • {inputs.location || 'Global'}</p>
          </div>
        </div>
        <button onClick={onExit} className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-3xl transition-all active:scale-90 group" title="End Call">
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
             <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
           </svg>
        </button>
      </div>

      {/* 4. OVERLAY: INITIALIZING */}
      {mode === 'initializing' && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-700">
             <div className="space-y-16 max-w-lg">
               <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
                 <div className="absolute inset-0 border-[12px] sm:border-[16px] border-yellow-500/10 rounded-full" />
                 <div className="absolute inset-0 border-[12px] sm:border-[16px] border-yellow-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                 <div className="absolute inset-0 flex items-center justify-center font-black text-white text-2xl sm:text-3xl">{Math.round(assetProgress)}%</div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Initializing Session</h3>
                  <p className="text-zinc-600 text-[10px] sm:text-sm font-black uppercase tracking-[0.4em] animate-pulse">Syncing regional assets for {inputs.location}...</p>
               </div>
             </div>
        </div>
      )}

      {/* 5. FLOATING HUD: CHAT (Font optimized for mobile) */}
      <div className="relative z-20 flex-1 flex flex-col justify-end p-4 sm:p-24 pb-48 sm:pb-48 pointer-events-none">
         <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-8 pointer-events-auto">
            {visibleMessages.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'interviewer' ? 'justify-center sm:justify-start' : 'justify-center sm:justify-end'} animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-12 duration-700`}>
                  <div className={`w-full sm:w-auto max-w-[95%] sm:max-w-xl p-4 sm:p-14 rounded-2xl sm:rounded-[72px] backdrop-blur-[20px] sm:backdrop-blur-[40px] sm:border shadow-2xl sm:shadow-3xl ${msg.role === 'interviewer' ? 'bg-black/60 sm:bg-black/25 text-white sm:border-white/5 sm:rounded-tl-none text-center sm:text-left' : 'bg-yellow-500/90 sm:bg-yellow-500/85 sm:border-yellow-400 text-zinc-950 sm:rounded-br-none shadow-yellow-500/10 text-center sm:text-left'}`}>
                     <div className="prose-krypto prose-sm sm:prose-lg text-inherit font-bold leading-relaxed text-[15px] sm:text-3xl drop-shadow-xl">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                     </div>
                  </div>
               </div>
            ))}
            {isAiTyping && (
               <div className="flex justify-center sm:justify-start">
                  <div className="px-5 py-3 sm:px-10 sm:py-6 bg-black/60 sm:bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full flex gap-3 sm:gap-4 shadow-2xl">
                    <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 animate-bounce delay-0" />
                    <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 animate-bounce delay-150" />
                    <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 animate-bounce delay-300" />
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* 6. CONTROL PANEL */}
      {!isComplete && mode !== 'initializing' && (
        <div className="relative z-30 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 pb-8 px-6 sm:px-24">
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-10">
              <div className="relative flex-1 w-full">
                <input 
                   autoFocus
                   value={currentInput}
                   onChange={e => setCurrentInput(e.target.value)}
                   disabled={mode === 'speaking' || isAiTyping}
                   placeholder={mode === 'waiting' ? "Speak or type response..." : "Neural processing..."} 
                   className="w-full bg-black/40 border border-white/10 rounded-[32px] sm:rounded-[64px] px-8 sm:px-14 py-6 sm:py-9 text-lg sm:text-2xl font-bold outline-none transition-all duration-700 text-white placeholder:text-zinc-800 focus:border-yellow-500/50 shadow-3xl"
                   onKeyDown={e => e.key === 'Enter' && currentInput.trim() && handleNextTurn(currentInput)}
                />
                <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2">
                   <span className="text-[8px] sm:text-[11px] font-black text-yellow-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{questionCount}/10</span>
                </div>
              </div>
              <button 
                onClick={() => currentInput.trim() && handleNextTurn(currentInput)}
                disabled={!currentInput.trim() || mode === 'speaking' || isAiTyping}
                className="w-full sm:w-auto px-12 sm:px-20 py-6 sm:py-9 bg-yellow-500 text-zinc-950 rounded-[32px] sm:rounded-[64px] font-black text-[10px] sm:text-[14px] uppercase tracking-[0.4em] hover:bg-yellow-400 active:scale-95 transition-all shadow-3xl disabled:opacity-20 border-b-4 sm:border-b-8 border-yellow-700"
              >
                Send Result
              </button>
           </div>
        </div>
      )}

      {/* 7. AUDIT OVERLAY */}
      {isComplete && auditLoading && (
        <div className="absolute inset-0 z-[100] bg-black/99 backdrop-blur-3xl flex flex-col items-center justify-center space-y-12 sm:space-y-20 animate-in fade-in duration-1000 p-8 text-center">
           <div className="relative w-48 h-48 sm:w-72 sm:h-72">
              <div className="absolute inset-0 border-[16px] sm:border-[24px] border-yellow-500/10 rounded-full" />
              <div className="absolute inset-0 border-[16px] sm:border-[24px] border-yellow-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <KryptoLogo size={80} className="sm:w-[100px] sm:h-[100px]" />
              </div>
           </div>
           <div className="space-y-6 sm:space-y-10">
              <h3 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">Compiling Regional Audit</h3>
              <p className="text-zinc-600 text-[10px] sm:text-sm font-black uppercase tracking-[0.5em] sm:tracking-[1em] animate-pulse">Synthesizing performance DNA...</p>
           </div>
        </div>
      )}

      {/* 8. QUIT DIALOG */}
      {showQuitDialog && (
        <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-[32px] p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Response Not Recorded</h3>
            <p className="text-zinc-500 font-medium pb-2 text-sm leading-relaxed">We haven't detected a response after multiple attempts. Do you want to quit the session?</p>
            <div className="flex gap-4">
              <button 
                onClick={onExit}
                className="flex-1 py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-red-500/20"
              >
                Yes, Quit
              </button>
              <button 
                onClick={() => {
                  setShowQuitDialog(false);
                  setSilentAttempts(0);
                  const lastMsg = messages.filter(m => m.role === 'interviewer').pop();
                  if (lastMsg) speakText(lastMsg.content);
                  else resetIdleTimer();
                }}
                className="flex-1 py-4 bg-yellow-500 text-zinc-950 hover:bg-yellow-400 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationUI;