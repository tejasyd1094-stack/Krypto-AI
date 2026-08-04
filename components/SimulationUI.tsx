import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SimulationMessage, UserStatus } from '../types';
import { getStreamingInterviewQuestion, auditFullInterview, analyzeVisualVibe } from '../services/geminiService';
import { KryptoLogo } from './Branding';

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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Interaction & Video States
  const [mode, setMode] = useState<'initializing' | 'speaking' | 'waiting' | 'thinking'>('initializing');
  const [initStatusText, setInitStatusText] = useState<string>("Initializing interview environment...");
  const [readyAudio, setReadyAudio] = useState<HTMLAudioElement | null>(null);
  const [speakVideo, setSpeakVideo] = useState<string | null>(null);
  const [waitVideo, setWaitVideo] = useState<string | null>(null);
  const [assetProgress, setAssetProgress] = useState(0);
  const [timerCount, setTimerCount] = useState(10);
  const [visualContext, setVisualContext] = useState("Candidate is engaged.");
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Dragging states for user PIP window
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    elementStartRef.current = { x: dragOffset.x, y: dragOffset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({
      x: elementStartRef.current.x + dx,
      y: elementStartRef.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const idleTimerRef = useRef<number | null>(null);
  const visualAnalysisInterval = useRef<number | null>(null);
  const activeAudioRef = useRef<{ stop: () => void } | null>(null);
  const currentSpeechIdRef = useRef<number>(0);
  const manualPrefixRef = useRef<string>('');
  const speechBaseLengthRef = useRef<number>(0);
  const latestTranscriptRef = useRef<string>('');
  const currentInputRef = useRef<string>('');

  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  const micEnabledRef = useRef(micEnabled);
  useEffect(() => { micEnabledRef.current = micEnabled; }, [micEnabled]);

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const isCompleteRef = useRef(isComplete);
  useEffect(() => { isCompleteRef.current = isComplete; }, [isComplete]);

  const [dynamicIsIndia, setDynamicIsIndia] = useState<boolean>(
    !!(inputs.location?.toUpperCase().includes('INDIA') || user.location?.toUpperCase().includes('INDIA') || user.currency === 'INR')
  );
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const [localAccent, setLocalAccent] = useState<string>('American English');

  useEffect(() => {
    let initialLocation = inputs.location || user.location || "";
    let initialAccent = "American English";
    let isInd = dynamicIsIndia;

    const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
    const locale = typeof navigator !== 'undefined' ? navigator.language : "";

    if (
      initialLocation.toUpperCase().includes('INDIA') ||
      timezone.toLowerCase().includes('kolkata') ||
      timezone.toLowerCase().includes('calcutta') ||
      locale.toLowerCase().includes('in') ||
      user.currency === 'INR'
    ) {
      initialLocation = initialLocation || "India";
      initialAccent = "Indian English";
      isInd = true;
    } else if (
      timezone.toLowerCase().includes('london') ||
      timezone.toLowerCase().includes('europe') ||
      locale.toLowerCase().includes('gb') ||
      locale.toLowerCase().includes('uk')
    ) {
      initialLocation = initialLocation || "United Kingdom";
      initialAccent = "British English";
    } else if (
      timezone.toLowerCase().includes('australia') ||
      timezone.toLowerCase().includes('sydney') ||
      timezone.toLowerCase().includes('melbourne') ||
      locale.toLowerCase().includes('au')
    ) {
      initialLocation = initialLocation || "Australia";
      initialAccent = "Australian English";
    } else {
      initialLocation = initialLocation || "United States";
      initialAccent = "American English";
    }

    setDetectedLocation(initialLocation);
    setLocalAccent(initialAccent);
    setDynamicIsIndia(isInd);

    fetch("https://ipapi.co/json/")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.country_name) {
          const locString = data.city ? `${data.city}, ${data.country_name}` : data.country_name;
          setDetectedLocation(locString);
          
          const code = (data.country_code || '').toUpperCase();
          if (code === 'IN') {
            setLocalAccent("Indian English");
            setDynamicIsIndia(true);
          } else if (code === 'GB' || code === 'UK') {
            setLocalAccent("British English");
            setDynamicIsIndia(false);
          } else if (code === 'AU') {
            setLocalAccent("Australian English");
            setDynamicIsIndia(false);
          } else if (code === 'CA') {
            setLocalAccent("Canadian English");
            setDynamicIsIndia(false);
          } else if (code === 'IE') {
            setLocalAccent("Irish English");
            setDynamicIsIndia(false);
          } else if (code === 'ZA') {
            setLocalAccent("South African English");
            setDynamicIsIndia(false);
          } else {
            setLocalAccent("American English");
            setDynamicIsIndia(false);
          }
        }
      })
      .catch(() => {
        // Fallback silently if offline or sandboxed
      });
  }, [inputs.location, user.location, user.currency]);

  const isIndia = dynamicIsIndia;
  const region = isIndia ? 'INDIA' : 'US';
  const personaName = "Neal";
  const voiceLang = isIndia ? "en-IN" : "en-US";

  // Voice Selection States
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const unlockAudioContext = () => {
    try {
      // Create and quickly play a tiny silent audio buffer to unlock HTML5 Audio context in Chrome/Safari
      const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silentAudio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        // Filter English voices
        const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        setAvailableVoices(englishVoices);

        // Pre-select the best voice, prioritizing professional natural male voices
        if (englishVoices.length > 0) {
          const targetLangLower = (voiceLang || 'en-IN').toLowerCase();
          const scoredVoices = englishVoices.map(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            let score = 0;
            
            // High boost for Indian English natural / neural voices
            if (lang.includes('in') || name.includes('india') || name.includes('rishi') || name.includes('prabhat') || name.includes('rahul') || name.includes('kabir')) {
              score += 700;
            } else if (lang.includes('us') || lang.includes('gb')) {
              score += 200;
            }
            
            // Quality and naturalness indicators (very high priority to sound human!)
            if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 600;
            if (name.includes('enhanced')) score += 400;
            if (name.includes('google') || name.includes('microsoft')) score += 200;
            
            // Premium male/executive recruiter voice names
            const premiumMaleKeywords = [
              'rishi', 'prabhat', 'puck', 'fenrir', 'george', 'daniel', 'guy', 'ryan',
              'brian', 'christopher', 'liam', 'oliver', 'male', 'david'
            ];
            for (const kw of premiumMaleKeywords) {
              if (name.includes(kw)) {
                score += 300;
                break;
              }
            }
            
            // Robotic and desktop voice penalties
            if (name.includes('desktop') || name.includes('sapi5') || name.includes('local') || name.includes('synthesizer') || name.includes('zira desktop')) {
              score -= 2000;
            }
            
            return { voice: v, score };
          });
          
          scoredVoices.sort((a, b) => b.score - a.score);
          if (scoredVoices.length > 0) {
            setSelectedVoiceURI(prev => {
              if (prev && englishVoices.some(ev => ev.voiceURI === prev)) return prev;
              return scoredVoices[0].voice.voiceURI;
            });
          } else {
            setSelectedVoiceURI(prev => {
              if (prev && englishVoices.some(ev => ev.voiceURI === prev)) return prev;
              return englishVoices[0].voiceURI;
            });
          }
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [voiceLang]);

  const hasInitializedRef = useRef(false);

  // Auto trigger interview simulation setup
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      startSimulation();
    }
  }, []);

  const handleInitialTurn = async () => {
    setInitStatusText("Connecting to Krypto AI Interviewer...");
    setAssetProgress(40);

    try {
      setInitStatusText(`Generating initial protocol for ${inputs.role || 'Candidate'}...`);
      setAssetProgress(55);

      const response = await getStreamingInterviewQuestion(
        inputs, 
        jdData, 
        `Simulation initialized. | Vibe: ${visualContext}`, 
        "", 
        0
      );
      
      const text = response.question || "Could you tell me more about your experience?";
      const bullet = response.summaryBullet || "Initial question generated.";

      const newAiMsg: SimulationMessage = { role: 'interviewer', content: text, timestamp: Date.now() };
      setMessages([newAiMsg]);
      setQuestionCount(1);
      setHistorySummary(`• ${bullet}`);

      setInitStatusText("Synthesizing audio protocol...");
      setAssetProgress(80);

      // Fetch ElevenLabs TTS audio and wait for API key response BEFORE session loads!
      const audioObj = await speakText(text);

      setAssetProgress(100);
      setInitStatusText("Voice Ready! Opening Session...");

      if (audioObj) {
        setReadyAudio(audioObj);
      } else {
        setMode('speaking');
      }
    } catch (e) {
      console.error("Error generating initial turn:", e);
      setMode('waiting');
    }
  };

  const startSimulation = async () => {
    setupSpeechRecognition();
    setMode('initializing');
    setInitStatusText("Initializing media devices and audio engine...");
    setAssetProgress(20);

    // Synchronously tickle and unlock the browser's speechSynthesis engine under this real user interaction!
    try {
      window.speechSynthesis.cancel();
      const tickle = new SpeechSynthesisUtterance("Welcome.");
      tickle.volume = 0.01;
      tickle.rate = 2.0;
      window.speechSynthesis.speak(tickle);
    } catch (e) {
      console.warn("Speech synthesis tickle failed:", e);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const hasAudio = stream.getAudioTracks().some(track => track.readyState === 'live' || track.enabled);
      const hasVideo = stream.getVideoTracks().some(track => track.readyState === 'live' || track.enabled);
      stream.getTracks().forEach(track => {
        track.enabled = true;
      });
      streamRef.current = stream;
      setMediaStream(stream);
      setCameraEnabled(hasVideo);
      setMicEnabled(hasAudio);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
        userVideoRef.current.play().catch(e => console.warn("Interrupted auto-play during start:", e));
      }
      
      const assets = STATIC_VIDEOS[region];
      setSpeakVideo(assets.SPEAK);
      setWaitVideo(assets.WAIT);
      
      await handleInitialTurn();
    } catch (err) {
      // If dual camera+mic fails, attempt audio-only stream
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const hasAudio = audioStream.getAudioTracks().some(track => track.readyState === 'live' || track.enabled);
        streamRef.current = audioStream;
        setMediaStream(audioStream);
        setCameraEnabled(false);
        setMicEnabled(hasAudio);
        const assets = STATIC_VIDEOS[region];
        setSpeakVideo(assets.SPEAK);
        setWaitVideo(assets.WAIT);
        
        await handleInitialTurn();
      } catch (audioErr) {
        console.warn("Initial media access deferred; user can trigger permissions on demand via PIP buttons:", err, audioErr);
        setCameraEnabled(false);
        setMicEnabled(false);
        const assets = STATIC_VIDEOS[region];
        setSpeakVideo(assets.SPEAK);
        setWaitVideo(assets.WAIT);

        await handleInitialTurn();
      }
    }
  };

  const stopAllMediaTracks = () => {
    try {
      micEnabledRef.current = false;
      isCompleteRef.current = true;
      if (visualAnalysisInterval.current) clearInterval(visualAnalysisInterval.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; } catch (e) {}
        try { recognitionRef.current.stop(); } catch (e) {}
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioRef.current) {
        try { activeAudioRef.current.stop(); } catch (e) {}
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
          track.enabled = false;
        });
        setMediaStream(null);
      }
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
      setCameraEnabled(false);
      setMicEnabled(false);
    } catch (e) {
      console.warn("Error stopping media tracks:", e);
    }
  };

  const handleExitWithStop = () => {
    stopAllMediaTracks();
    onExit();
  };

  useEffect(() => {
    return () => {
      if (visualAnalysisInterval.current) clearInterval(visualAnalysisInterval.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioRef.current) activeAudioRef.current.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
      stopAllMediaTracks();
    };
  }, []);

  useEffect(() => {
    if (userVideoRef.current && mediaStream && cameraEnabled) {
      const video = userVideoRef.current;
      video.srcObject = mediaStream;
      video.play().catch(err => {
        console.warn("Auto-play of user media stream interrupted or needs interaction:", err);
      });
    }
  }, [mediaStream, cameraEnabled, mode]);

  const toggleMic = async () => {
    const nextMicState = !micEnabled;
    
    if (nextMicState) {
      // Turning mic ON: auto trigger permission prompt via getUserMedia on user click
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newTrack = audioStream.getAudioTracks()[0];
        if (newTrack) {
          if (!streamRef.current) {
            streamRef.current = audioStream;
            setMediaStream(audioStream);
          } else {
            const oldTracks = streamRef.current.getAudioTracks();
            oldTracks.forEach(t => {
              try { t.stop(); } catch (e) {}
              streamRef.current?.removeTrack(t);
            });
            streamRef.current.addTrack(newTrack);
            setMediaStream(new MediaStream(streamRef.current.getTracks()));
          }
          newTrack.enabled = true;
        }
        setMicEnabled(true);
      } catch (e) {
        console.warn("Microphone access declined or unavailable:", e);
        setMicEnabled(false);
        return;
      }
    } else {
      // Turning mic OFF: stop hardware mic track completely so browser indicator turns off
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
          track.enabled = false;
        });
      }
      setMicEnabled(false);
    }
    
    if (!nextMicState) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    } else if (mode === 'waiting') {
      safeStartRecognition();
    }
  };

  const toggleCamera = async () => {
    const nextCamState = !cameraEnabled;
    
    if (nextCamState) {
      // Turning camera ON: auto trigger permission prompt via getUserMedia on user click
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = videoStream.getVideoTracks()[0];
        if (newTrack) {
          if (!streamRef.current) {
            streamRef.current = videoStream;
            setMediaStream(videoStream);
          } else {
            const oldTracks = streamRef.current.getVideoTracks();
            oldTracks.forEach(t => {
              try { t.stop(); } catch (e) {}
              streamRef.current?.removeTrack(t);
            });
            streamRef.current.addTrack(newTrack);
            setMediaStream(new MediaStream(streamRef.current.getTracks()));
          }
          newTrack.enabled = true;

          if (userVideoRef.current) {
            userVideoRef.current.srcObject = streamRef.current;
            userVideoRef.current.play().catch(e => console.warn("Play user stream failed:", e));
          }
        }
        setCameraEnabled(true);
      } catch (e) {
        console.warn("Camera access declined or unavailable:", e);
        setCameraEnabled(false);
        return;
      }
    } else {
      // Turning camera OFF: stop hardware camera track completely so webcam LED turns off
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
          track.enabled = false;
        });
      }
      setCameraEnabled(false);
    }
  };

  const safeStartRecognition = () => {
    if (!recognitionRef.current) return;
    if (!micEnabledRef.current || modeRef.current !== 'waiting' || isCompleteRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      setTimeout(() => {
        if (micEnabledRef.current && modeRef.current === 'waiting' && !isCompleteRef.current) {
          try { recognitionRef.current?.stop(); } catch (err) {}
          setTimeout(() => {
            try {
              if (micEnabledRef.current && modeRef.current === 'waiting' && !isCompleteRef.current) {
                recognitionRef.current?.start();
              }
            } catch (err) {}
          }, 150);
        }
      }, 100);
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    setSpeechSupported(true);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    const recognition = new SpeechRecognition();
    
    const isIOS = typeof navigator !== 'undefined' && (
      /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );

    // On iOS WebKit, continuous = true can cause audio-capture conflicts or errors
    recognition.continuous = !isIOS;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    recognition.onstart = () => {
      manualPrefixRef.current = currentInputRef.current;
      speechBaseLengthRef.current = 0;
      latestTranscriptRef.current = '';
    };

    recognition.onresult = (e: any) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        transcript += e.results[i][0].transcript;
      }
      if (!transcript) {
        transcript = Array.from(e.results).map((r: any) => (r as any)[0].transcript).join('');
      }
      latestTranscriptRef.current = transcript;

      const prefix = manualPrefixRef.current;
      const baseLen = speechBaseLengthRef.current;
      const newSpeech = transcript.slice(baseLen);

      if (prefix) {
        const combined = newSpeech ? `${prefix.trim()} ${newSpeech.trimStart()}` : prefix;
        setCurrentInput(combined);
      } else {
        setCurrentInput(transcript);
      }
      resetIdleTimer();
    };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e?.error);
        if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
          setMicEnabled(false);
        } else if (micEnabledRef.current && modeRef.current === 'waiting' && !isCompleteRef.current) {
          setTimeout(() => {
            safeStartRecognition();
          }, 200);
        }
      };

      recognition.onend = () => {
        if (micEnabledRef.current && modeRef.current === 'waiting' && !isCompleteRef.current) {
          setTimeout(() => {
            safeStartRecognition();
          }, 150);
        }
      };

      recognitionRef.current = recognition;
  };

  useEffect(() => {
    if (mode === 'waiting' && micEnabled && !isComplete) {
      safeStartRecognition();
    } else if (mode !== 'waiting') {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    }
  }, [mode, micEnabled, isComplete]);

  useEffect(() => {
    if (mode === 'initializing' || isComplete) return;

    visualAnalysisInterval.current = window.setInterval(async () => {
      if (!userVideoRef.current || !cameraEnabled) return;

      const canvas = canvasRef.current;
      const video = userVideoRef.current;
      if (video.videoWidth === 0) return;

      // Resize the HTML5 canvas to a low resolution (160x120 pixels) and compress to 0.3 quality to minimize payload
      canvas.width = 160;
      canvas.height = 120;
      canvas.getContext('2d')?.drawImage(video, 0, 0, 160, 120);
      const base64 = canvas.toDataURL('image/jpeg', 0.3).split(',')[1];

      try {
        const vibe = await analyzeVisualVibe(base64);
        setVisualContext(vibe || "Engaged.");
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
      // Keep listening and restart the idle timer, but do NOT speak the question again so it only speaks once
      setMode('waiting');
      if (micEnabledRef.current) {
        safeStartRecognition();
      }
      resetIdleTimer();
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

  const sanitizeForSpeech = (rawText: string): string => {
    return rawText
      .replace(/\*\*?/g, '') // Remove single/double asterisks
      .replace(/__?/g, '') // Remove underscores
      .replace(/`[^`]+`/g, (m) => m.replace(/`/g, '')) // Remove backticks but keep inner content
      .replace(/[-*#+]/g, ' ') // Replace list markers with space
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to label
      .replace(/\s+/g, ' ') // Normalize whitespaces
      .trim();
  };

  const speakText = (text: string): Promise<HTMLAudioElement | null> => {
    const cleanText = sanitizeForSpeech(text);
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn("speechSynthesis cancel error:", err);
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.stop();
      } catch (err) {}
    }
    
    currentSpeechIdRef.current += 1;
    const mySpeechId = currentSpeechIdRef.current;
    
    return new Promise((resolve) => {
      const handleSpeechEnd = () => {
        if (currentSpeechIdRef.current !== mySpeechId) return;
        setMode('waiting');
        manualPrefixRef.current = '';
        speechBaseLengthRef.current = 0;
        latestTranscriptRef.current = '';
        if (micEnabledRef.current) {
          safeStartRecognition();
        }
        resetIdleTimer();
      };

      // Fetch the voice from ElevenLabs backend TTS
      const isInit = mode === 'initializing';
      setMode(m => m === 'initializing' ? 'initializing' : 'thinking');
      fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, isIndia, location: detectedLocation, accent: localAccent })
      })
        .then(res => {
          if (!res.ok) throw new Error("TTS API response error");
          return res.json();
        })
        .then(result => {
          if (currentSpeechIdRef.current !== mySpeechId) {
            resolve(null);
            return;
          }
          if (result && result.data) {
            const audioSrc = `data:${result.mimeType || 'audio/mp3'};base64,${result.data}`;
            const audio = new Audio(audioSrc);
            audio.playbackRate = 0.94;
            audio.volume = 1.0;

            // Enhance volume using Web Audio API DynamicsCompressor + GainNode (+11dB / 3.5x gain boost for optimal clarity on mobile speakers)
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const source = audioCtx.createMediaElementSource(audio);
                
                const compressor = audioCtx.createDynamicsCompressor();
                compressor.threshold.value = -24;
                compressor.knee.value = 12;
                compressor.ratio.value = 12;
                compressor.attack.value = 0.003;
                compressor.release.value = 0.25;

                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 3.5;

                source.connect(compressor);
                compressor.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                audio.addEventListener('play', () => {
                  if (audioCtx.state === 'suspended') {
                    audioCtx.resume().catch(e => console.warn("audioCtx.resume error:", e));
                  }
                });
              }
            } catch (e) {
              console.warn("Audio gain boost fallback:", e);
            }
            
            let playTimeout: any = null;
            
            audio.onplay = () => {
              if (currentSpeechIdRef.current !== mySpeechId) {
                audio.pause();
                return;
              }
              setMode('speaking');
              if (idleTimerRef.current) clearInterval(idleTimerRef.current);
              try { recognitionRef.current?.stop(); } catch (e) {}
              
              playTimeout = setTimeout(() => {
                if (currentSpeechIdRef.current !== mySpeechId) return;
                audio.pause();
                handleSpeechEnd();
              }, 30000); // 30 seconds limit for a single question response
            };
            
            audio.onended = () => {
              if (playTimeout) clearTimeout(playTimeout);
              handleSpeechEnd();
            };
            
            audio.onerror = (e) => {
              if (playTimeout) clearTimeout(playTimeout);
              console.warn("HTML5 Audio playback error:", e);
              handleSpeechEnd();
            };
            
            activeAudioRef.current = {
              stop: () => {
                if (playTimeout) clearTimeout(playTimeout);
                try {
                  audio.pause();
                } catch (e) {}
              }
            };
            
            resolve(audio);

            // Auto-play immediately only if not initializing (initializing controls playback when ready)
            if (!isInit) {
              audio.play().catch(err => {
                console.warn("Audio play promise rejected, retrying with unlocked audio context...", err);
                if (currentSpeechIdRef.current === mySpeechId) {
                  unlockAudioContext();
                  setTimeout(() => {
                    audio.play().catch(retryErr => {
                      console.warn("Retry failed, audio could not be played:", retryErr);
                      if (currentSpeechIdRef.current === mySpeechId) {
                        handleSpeechEnd();
                      }
                    });
                  }, 150);
                }
              });
            }
          } else {
            console.warn("No TTS API audio output returned.");
            handleSpeechEnd();
            resolve(null);
          }
        })
        .catch(err => {
          console.warn("TTS API fetch failed:", err);
          if (currentSpeechIdRef.current === mySpeechId) {
            handleSpeechEnd();
          }
          resolve(null);
        });
    });
  };

  const isProcessingTurnRef = useRef(false);

  const handleNextTurn = async (userAnswer: string) => {
    unlockAudioContext();
    if (isProcessingTurnRef.current) return;
    isProcessingTurnRef.current = true;
    
    // Clear idle timer explicitly so it doesn't fire while AI is generating
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    recognitionRef.current?.stop();
    
    // Reset silent attempts if user responded
    if (userAnswer && userAnswer !== "... (No response detected) ...") {
      setSilentAttempts(0);
      setCurrentInput(''); // Clear the input field immediately
      manualPrefixRef.current = '';
      speechBaseLengthRef.current = 0;
      latestTranscriptRef.current = '';
    }
    
    let updatedMessages = messages;
    if (userAnswer) {
      const newUserMsg: SimulationMessage = { role: 'candidate', content: userAnswer, timestamp: Date.now() };
      updatedMessages = [...messages, newUserMsg];
      setMessages(updatedMessages);
    }

    if (questionCount >= 6) {
      finalizeSimulation();
      return;
    }

    setIsAiTyping(true);
    setMode('thinking');
    try {
      // Extract and format ONLY the last 2 exchanges to minimize context token overhead
      const lastTwoExchanges = updatedMessages.slice(-4);
      const formattedLastTwoExchanges = lastTwoExchanges
        .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
        .join('\n');

      const response = await getStreamingInterviewQuestion(
        inputs, 
        jdData, 
        `${historySummary} | Vibe: ${visualContext}`, 
        formattedLastTwoExchanges, 
        questionCount
      );
      
      const text = response.question || "Could you tell me more about your experience?";
      const bullet = response.summaryBullet || "Discussed the candidate's last response.";

      // Synthesize ElevenLabs voice first before revealing the new message text
      await speakText(text);

      const newAiMsg: SimulationMessage = { role: 'interviewer', content: text, timestamp: Date.now() };
      setMessages(prev => [...prev, newAiMsg]);
      setQuestionCount(prev => prev + 1);

      // Append lightweight bullet-point summary incrementally
      setHistorySummary(prev => {
        const cleanPrev = prev.trim();
        return cleanPrev ? `${cleanPrev}\n• ${bullet}` : `• ${bullet}`;
      });
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
    stopAllMediaTracks();
    
    try {
      const audit = await auditFullInterview(messages, inputs);
      onComplete(audit);
    } catch (e) {
      handleExitWithStop();
    } finally {
      setAuditLoading(false);
    }
  };

  const visibleMessages = messages.slice(-1);

  if (mode === 'initializing') {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 font-sans">
        <div className="relative w-28 h-28 rounded-full bg-zinc-900 border-2 border-yellow-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.2)] mb-8">
          <KryptoLogo size={48} className="text-yellow-500 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-yellow-500/20 animate-ping" />
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight mb-8">
          Executive Interview Session
        </h2>

        <div className="w-72 sm:w-80 h-2.5 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden mb-4">
          <div 
            className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_12px_#eab308]"
            style={{ width: `${assetProgress}%` }}
          />
        </div>

        <p className="text-zinc-400 text-xs font-medium max-w-md leading-relaxed mb-8">
          {initStatusText}
        </p>

        {readyAudio && (
          <button
            onClick={() => {
              unlockAudioContext();
              readyAudio.play().then(() => setMode('speaking')).catch(() => setMode('speaking'));
            }}
            className="px-8 py-4 rounded-2xl bg-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all animate-bounce shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center gap-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Enter Interview Room & Listen</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto sm:overflow-hidden animate-in fade-in duration-500 font-sans">
      
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
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ 
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          touchAction: 'none'
        }}
        className={`absolute top-24 right-4 sm:top-auto sm:bottom-44 sm:right-8 w-28 sm:w-72 aspect-[3/4] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-40 bg-zinc-900 select-none cursor-${isDragging ? 'grabbing' : 'grab'} transition-shadow duration-200 ${isDragging ? 'shadow-yellow-500/20 ring-1 ring-yellow-500/30' : ''}`}
      >
         {cameraEnabled && mediaStream ? (
           <video ref={(el) => {
                (userVideoRef as any).current = el;
                if (el && mediaStream && cameraEnabled) {
                  el.srcObject = mediaStream;
                  el.play().catch(e => console.warn("Auto-play of user media stream in callback ref interrupted:", e));
                }
              }} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]" />
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-zinc-950/40" />
             {cameraEnabled ? (
               <div className="relative flex flex-col items-center space-y-1 sm:space-y-2 z-10 p-2">
                 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
                   <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                   </svg>
                 </div>
                 <span className="text-[7.5px] sm:text-[9px] font-black tracking-widest text-yellow-500 uppercase text-center leading-tight">Sandbox Camera Active</span>
               </div>
             ) : (
               <div className="relative flex flex-col items-center space-y-1 sm:space-y-2 z-10 p-2 text-zinc-500">
                 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center">
                   <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                   </svg>
                 </div>
                 <span className="text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase text-center leading-tight">Camera Muted</span>
               </div>
             )}
           </div>
         )}
         
         {/* Teams style control bar overlay */}
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl z-50">
            <button onClick={toggleMic} className={`p-2.5 rounded-full transition-all active:scale-95 ${micEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white animate-pulse'}`} title={micEnabled ? "Mute Mic" : "Unmute Mic"}>
              {micEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              )}
            </button>
            <button onClick={toggleCamera} className={`p-2.5 rounded-full transition-all active:scale-95 ${cameraEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white animate-pulse'}`} title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}>
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div>
              <h2 className="text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">{inputs.company}</h2>
              <p className="text-zinc-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{personaName} • {inputs.location || 'Global'}</p>
            </div>
            

          </div>
        </div>
        <button onClick={handleExitWithStop} className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-3xl transition-all active:scale-90 group" title="End Call">
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
             <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
           </svg>
        </button>
      </div>

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
      {!isComplete && (
        <div className="relative z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-3 pb-8 sm:pb-6 px-4 sm:px-24">
           <div className="max-w-7xl mx-auto flex flex-col gap-3">
              {/* LIVE TRANSCRIPT VERIFICATION HEADER BAR */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-yellow-500/20 rounded-xl sm:rounded-2xl backdrop-blur-2xl shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${micEnabled && mode === 'waiting' ? 'bg-emerald-400 animate-ping' : micEnabled ? 'bg-yellow-400' : 'bg-red-500'}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white">
                      Live Transcript Verification
                    </span>
                    <span className="hidden sm:inline-block text-[9px] text-zinc-400 font-bold">
                      • Real-Time Neural Voice Stream
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[8.5px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    !speechSupported ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    micEnabled && mode === 'waiting' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse' :
                    micEnabled ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {!speechSupported ? 'TYPING MODE' : micEnabled && mode === 'waiting' ? 'LIVE LISTENING' : micEnabled ? 'MIC READY' : 'MIC MUTED'}
                  </span>

                  {!micEnabled && (
                    <button 
                      onClick={toggleMic} 
                      className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95"
                    >
                      Unmute
                    </button>
                  )}
                </div>
              </div>

              {/* INPUT AREA AND SEND BUTTON */}
              <div className="relative flex-1 w-full flex flex-col lg:flex-row items-end gap-3 sm:gap-6">
                <div className="relative flex-1 w-full">
                  <textarea 
                     autoFocus
                     rows={2}
                     value={currentInput}
                     onChange={e => {
                       const val = e.target.value;
                       setCurrentInput(val);
                       manualPrefixRef.current = val;
                       speechBaseLengthRef.current = latestTranscriptRef.current.length;
                       resetIdleTimer();
                     }}
                     disabled={isAiTyping}
                     placeholder={
                       !speechSupported 
                        ? "Type your response here..." 
                        : micEnabled && mode === 'waiting' 
                        ? "Speak clearly into your microphone — live transcript streams here automatically..." 
                        : "Type response or tap Unmute to speak..."
                     } 
                     className="w-full bg-black/60 border border-white/10 rounded-[20px] sm:rounded-[32px] px-5 sm:px-8 py-3.5 sm:py-5 pr-16 sm:pr-20 text-sm sm:text-lg font-bold outline-none transition-all duration-300 text-white placeholder:text-zinc-500 focus:border-yellow-500/60 shadow-3xl resize-none min-h-[64px] sm:min-h-[88px] max-h-[180px] custom-scrollbar"
                     onKeyDown={e => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         if (currentInput.trim() && !isAiTyping) {
                           handleNextTurn(currentInput);
                         }
                       }
                     }}
                  />
                  <div className="absolute right-4 sm:right-6 top-4">
                     <span className="text-[8px] sm:text-[11px] font-black text-yellow-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{questionCount}/6</span>
                  </div>
                </div>
                <button 
                  onClick={() => currentInput.trim() && handleNextTurn(currentInput)}
                  disabled={!currentInput.trim() || isAiTyping}
                  className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-5 bg-yellow-500 text-zinc-950 rounded-[20px] sm:rounded-[32px] font-black text-[10px] sm:text-[13px] uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-yellow-400 active:scale-95 transition-all shadow-3xl disabled:opacity-20 border-b-4 border-yellow-700 shrink-0 flex items-center justify-center self-stretch sm:self-auto"
                >
                  Send Result
                </button>
              </div>
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
                onClick={handleExitWithStop}
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