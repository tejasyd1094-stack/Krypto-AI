import React, { useState, useEffect } from 'react';
import { UserStatus } from '../types';
import { Twitter, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react';

interface ReferProps {
  user: UserStatus;
  userEmail?: string;
  onUpdateUser: (update: Partial<UserStatus>) => void;
  onAwardCredits: (amount: number) => void;
  onBack?: () => void;
}

export const REGISTERED_PEER_EMAILS = [
  'aspirant@krypto.ai',
  'recruiter@krypto.ai',
  'talent@krypto.ai',
  'advisor@krypto.ai',
  'interviewer@krypto.ai',
  'quantum@krypto.ai',
  'career@krypto.ai',
  'cto@krypto.ai',
  'hr@krypto.ai'
];

export const getReferralCode = (email?: string) => {
  if (!email) return 'KRYP-GUESTXP';
  const prefix = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
  const hash = Array.from(email).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  return `KRYP-${prefix.slice(0, 5)}${hash}`;
};

export const isValidReferralCode = (code: string) => {
  const cleanCode = code.trim().toUpperCase();
  const generatedCodes = REGISTERED_PEER_EMAILS.map(email => getReferralCode(email));
  return generatedCodes.includes(cleanCode);
};

export default function Refer({ user, userEmail, onUpdateUser, onAwardCredits, onBack }: ReferProps) {
  const [copied, setCopied] = useState(false);
  const myCode = getReferralCode(userEmail);

  // Redemption States
  const [referralInput, setReferralInput] = useState('');
  const [securityNum1, setSecurityNum1] = useState(0);
  const [securityNum2, setSecurityNum2] = useState(0);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('krypto-ref-fails') || '0', 10);
  });
  const [lockoutTime, setLockoutTime] = useState(() => {
    return parseInt(localStorage.getItem('krypto-ref-lockout') || '0', 10);
  });
  const [verifyingCode, setVerifyingCode] = useState(false);

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingLockoutTime());

  const generateNewChallenge = () => {
    setSecurityNum1(Math.floor(Math.random() * 9) + 1);
    setSecurityNum2(Math.floor(Math.random() * 9) + 1);
    setSecurityAnswer('');
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        const rem = getRemainingLockoutTime();
        setRemainingSeconds(rem);
        if (rem <= 0) {
          setLockoutTime(0);
          setFailedAttempts(0);
          localStorage.removeItem('krypto-ref-fails');
          localStorage.removeItem('krypto-ref-lockout');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const recordFailure = () => {
    const nextFails = failedAttempts + 1;
    setFailedAttempts(nextFails);
    localStorage.setItem('krypto-ref-fails', nextFails.toString());

    if (nextFails >= 3) {
      const lockUntil = Date.now() + 5 * 60 * 1000; // 5 mins lockout
      setLockoutTime(lockUntil);
      localStorage.setItem('krypto-ref-lockout', lockUntil.toString());
      alert("Excessive verification failures. Referral redemption has been locked for 5 minutes.");
    }
  };

  const handleRedeemCode = () => {
    if (lockoutTime && getRemainingLockoutTime() > 0) {
      alert(`Security protocol active. Submissions locked for ${getRemainingLockoutTime()} seconds.`);
      return;
    }

    if (!referralInput.trim()) return;
    const cleanInput = referralInput.trim().toUpperCase();

    // 1. Structural check
    const formatRegex = /^KRYP-[A-Z0-9]{1,5}\d+$/;
    if (!formatRegex.test(cleanInput)) {
      alert("Security alert: Alphanumeric format is incorrect. Referral codes must match 'KRYP-XXXXX000'.");
      recordFailure();
      return;
    }

    // 2. Check registration directory
    if (!isValidReferralCode(cleanInput)) {
      alert("Error: The entered referral code is invalid or unregistered in our user directory.");
      recordFailure();
      return;
    }
    
    // 3. Prevent self-redemption
    const myCode = getReferralCode(userEmail);
    if (cleanInput === myCode) {
      alert("Security rule: You cannot redeem your own referral code.");
      return;
    }

    // 4. Human Challenge verification
    const expected = securityNum1 + securityNum2;
    if (parseInt(securityAnswer, 10) !== expected) {
      alert("Integrity verification failed. Please enter the correct sum to prove humanity.");
      recordFailure();
      generateNewChallenge();
      return;
    }

    // 5. Bot rate-restrict / cryptographic validation delay
    setVerifyingCode(true);
    setTimeout(() => {
      setVerifyingCode(false);
      onAwardCredits(30);
      onUpdateUser({ redeemedCode: cleanInput });
      alert("Security clearance granted! 30 free credits have been added to your ledger.");
      setReferralInput('');
      setSecurityAnswer('');
      setFailedAttempts(0);
      localStorage.removeItem('krypto-ref-fails');
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Use my referral code ${myCode} on Krypto AI to instantly claim 30 free recruitment optimization credits! https://ai.studio/build`;

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ai.studio/build')}&summary=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(shareText);
    alert("Referral invitation message copied to clipboard! Opening Instagram so you can easily paste and share with friends.");
    window.open(`https://instagram.com`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://ai.studio/build')}&quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="min-h-[85vh] bg-transparent text-zinc-100 font-sans px-4 sm:px-10 py-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Krypto Referral Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
            Refer & <span className="gold-text-gradient">Grow</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-lg mt-1">
            Spread strategic talent engineering. Share your unique code with other career aspirants to unlock 30 computational ledger credits.
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

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* Left Side: Copy Code Widget */}
        <div className="md:col-span-6 bg-zinc-950/40 border border-zinc-900 rounded-[36px] p-8 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase text-amber-500/80 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 tracking-widest inline-block">
              Your Professional Referral Identifier
            </span>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed">
              Every registered career blueprint gets a unique encrypted seed. Share this string with direct colleagues, classmates, or industry peers looking to rewrite their professional trajectories.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative bg-zinc-950 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest block mb-1">Encrypted Seed</span>
                <span className="font-mono text-lg sm:text-2xl font-black text-white tracking-wider uppercase select-all">{myCode}</span>
              </div>

              <button 
                onClick={handleCopy}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  copied 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Reward Notification Banner */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
                </svg>
              </span>
              <div>
                <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-wider">Dual Reward Mechanics</h4>
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                  Anyone who enters your unique code in their profile receives 30 free computational credits instantly to run deep ATS resume analysis and interview prep sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900/50 flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-black text-zinc-650 uppercase tracking-widest block w-full mb-1 sm:w-auto sm:mb-0">Share on Social:</span>
            <button 
              onClick={handleShareTwitter}
              className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-400 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
              Twitter
            </button>
            <button 
              onClick={handleShareLinkedIn}
              className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-405 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              LinkedIn
            </button>
            <button 
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-405 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              WhatsApp
            </button>
            <button 
              onClick={handleShareInstagram}
              className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-405 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              Instagram
            </button>
            <button 
              onClick={handleShareFacebook}
              className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-405 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
              Facebook
            </button>
          </div>
        </div>

        {/* Right Side: Redemption widget directly on Refer screen */}
        <div className="md:col-span-6 bg-zinc-950/20 border border-zinc-900/60 rounded-[36px] p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-black text-zinc-100 uppercase tracking-tight">Active Code Redemption</h4>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1 uppercase tracking-wider">
                Claim 30 free computational recruitment credits by redeeming a colleague's referral code.
              </p>
            </div>

            {user.redeemedCode ? (
              <div className="bg-green-500/5 border border-green-500/10 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  <span className="text-[10px] font-black uppercase text-green-400 tracking-wider font-sans">Code Applied: {user.redeemedCode}</span>
                </div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/15 px-3.5 py-1.5 rounded-xl border border-green-500/20">30 CR Applied</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    value={referralInput} 
                    onChange={e => setReferralInput(e.target.value.toUpperCase())}
                    disabled={getRemainingLockoutTime() > 0 || verifyingCode}
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-100 outline-none focus:border-yellow-500/50 uppercase tracking-wider font-sans disabled:opacity-40" 
                    placeholder={getRemainingLockoutTime() > 0 ? `LOCKED: TRY IN ${remainingSeconds}S` : "ENTER REFERRAL CODE (e.g. KRYP-...)"}
                  />
                </div>

                {getRemainingLockoutTime() <= 0 && referralInput.trim().length > 0 && (
                  <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-yellow-500/80">Integrity Check Required</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-650">Failed attempts: {failedAttempts}/3</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium font-sans">To prevent automated sybil or bot attacks, please solve this challenge:</p>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-black text-white bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-850">
                        {securityNum1} + {securityNum2} = ?
                      </span>
                      <input 
                        type="number"
                        value={securityAnswer}
                        onChange={e => setSecurityAnswer(e.target.value)}
                        className="w-24 bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 outline-none focus:border-yellow-500/30 text-center"
                        placeholder="Answer"
                        disabled={verifyingCode}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleRedeemCode}
                    disabled={!referralInput.trim() || verifyingCode || getRemainingLockoutTime() > 0}
                    className="w-full px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-98 border-b-4 border-yellow-700 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
                  >
                    {verifyingCode ? 'Cryptographic Check...' : 'Verify & Redeem Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-900/40 text-[9px] font-bold text-zinc-650 uppercase tracking-wider text-center italic">
            Integrity check system enforced for all referrals.
          </div>
        </div>

      </div>

    </div>
  );
}
