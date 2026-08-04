import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  getMultiFactorResolver,
  signInWithPhoneNumber,
  sendEmailVerification,
  sendPasswordResetEmail,
  linkWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { KryptoLogo } from './Branding';

type AuthMode = 'signup' | 'signin' | 'forgot';

const formatToE164 = (rawPhone: string): { formatted: string; isValid: boolean } => {
  if (!rawPhone) return { formatted: '', isValid: false };
  let cleaned = rawPhone.trim().replace(/[\s\(\)\-\.]/g, '');
  if (!cleaned.startsWith('+')) {
    if (/^\d+$/.test(cleaned)) {
      cleaned = '+' + cleaned;
    }
  }
  const isValid = /^\+[1-9]\d{6,14}$/.test(cleaned);
  return { formatted: cleaned, isValid };
};

const getCleanErrorMessage = (err: any): string => {
  if (!err) return "An unknown error occurred.";
  const code = err.code || "";
  const msg = err.message || "";
  
  if (code === 'auth/invalid-phone-number' || msg.includes('invalid-phone-number')) {
    return "INVALID_PHONE_NUMBER: The phone number format is invalid. Please enter your mobile number in international E.164 format starting with '+' and your country code (e.g., +15551234567 or +919876543210).";
  }
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    if (msg.toLowerCase().includes('region')) {
      return "REGIONAL_SMS_RESTRICTION: The target phone number's country code or region is not enabled in your Firebase project. To resolve this: \n1. Go to your Firebase Console > Authentication > Sign-in method.\n2. Click 'Phone' provider and select edit.\n3. Expand the 'SMS region policy' section.\n4. Change the configuration to 'Allow all' or add your targeted country name to the allowed regions list, then save.";
    }
    return "OPERATION_NOT_ALLOWED: Phone SMS authentication is not enabled in the Firebase Console. To enable it, navigate to your Firebase Console > Authentication > Sign-in method, click 'Add new provider', and select and enable 'Phone'.";
  }
  if (code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
    return "INVALID_CREDENTIAL: The login credentials are invalid. Please check your email and password. Also make sure the 'Email/Password' provider is enabled in the Firebase Console (Authentication > Sign-in method).";
  }
  if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
    return "ACCOUNT_NOT_FOUND: The specified account does not exist. Please create an account in the 'Sign Up' tab first!";
  }
  if (code === 'auth/wrong-password' || msg.includes('wrong-password')) {
    return "WRONG_PASSWORD: The password you entered is incorrect. If you forgot your password, please click 'Forgot Password?' to send a reset link.";
  }
  if (code === 'auth/phone-number-already-exists' || msg.includes('phone-number-already-exists')) {
    return "PHONE_ALREADY_EXISTS: This phone number is already registered under another account.";
  }
  if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
    return "EMAIL_ALREADY_IN_USE: This email address is already associated with an existing account.";
  }
  if (code === 'auth/weak-password' || msg.includes('weak-password')) {
    return "WEAK_PASSWORD: The password must be at least 6 characters long.";
  }
  
  return err.message || "An unexpected error occurred.";
};

interface LoginProps {
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  // Default mode set to 'signup'
  const [mode, setMode] = useState<AuthMode>('signup');
  const [signupVerifyMethod, setSignupVerifyMethod] = useState<'email' | 'phone'>('email');
  const [signinMethod, setSigninMethod] = useState<'password' | 'sms'>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // For both direct sms sign-in and signup with phone verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Phone Sign-In Confirmation Result
  const [signInConfirmationResult, setSignInConfirmationResult] = useState<any>(null);
  const [signInOtp, setSignInOtp] = useState('');

  // SMS MFA Challenge Verification State (Login-time)
  const [mfaVerificationRequired, setMfaVerificationRequired] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaPhoneHint, setMfaPhoneHint] = useState('');

  // SMS MFA Onboarding Enrollment State (Signup-time)
  const [mfaEnrollmentRequired, setMfaEnrollmentRequired] = useState(false);

  // Common MFA Verification Code & Phone inputs
  const [mfaPhoneNumber, setMfaPhoneNumber] = useState('');
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [mfaVerificationId, setMfaVerificationId] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('OAuth Error:', err);
      setError(`HANDSHAKE_FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const initRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
    return (window as any).recaptchaVerifier;
  };

  // 1. Sign-Up Action: Email/Password combined with verification method
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Basic Validation
    if (!email || !password) {
      setError("Email and password are mandatory for account creation.");
      setLoading(false);
      return;
    }

    if (signupVerifyMethod === 'phone') {
      const { formatted, isValid } = formatToE164(phoneNumber);
      if (!isValid) {
        setError("Please specify a valid mobile phone number in international E.164 format (e.g. +15551234567 or +919876543210).");
        setLoading(false);
        return;
      }
      setPhoneNumber(formatted);
    }

    try {
      // 1. Create the base email + password account (mandated)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if username specified
      if (username) {
        await updateProfile(userCredential.user, {
          displayName: username
        });
      }

      if (signupVerifyMethod === 'phone') {
        // Enforce immediate SMS MFA Enrollment
        setMfaPhoneNumber(phoneNumber);
        setMfaEnrollmentRequired(true);
        setMessage("Account created. Please configure and verify your secure SMS security code below.");
      } else {
        // Send email verification link
        await sendEmailVerification(userCredential.user);
        setRegisteredEmail(email);
        setMessage("A verification email has been dispatched. Please verify your email before your first sign-in.");
        await auth.signOut(); // Sign out to enforce verification check on login
      }
    } catch (err: any) {
      console.error("SignUp Error:", err);
      setError(`REGISTRATION_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign-In Action (Quick Password)
  const handlePasswordSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure email verification is completed
      if (!userCredential.user.emailVerified) {
        setError("EMAIL_NOT_VERIFIED: Please verify your email to access the secure workspace. Check your inbox.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      setMessage("Access granted! Welcome back.");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        setMfaVerificationRequired(true);
        const phoneHint = resolver.hints[0];
        setMfaPhoneHint((phoneHint as any).phoneNumber || "your registered security device");
      } else {
        console.error("Password Sign In Error:", err);
        setError(`ACCESS_FAILED: ${getCleanErrorMessage(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please specify a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset email has been dispatched. Please check your inbox (including your spam folder) to complete the security process after your email is verified.");
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(`RESET_FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Direct SMS Sign-In (OTP Send & OTP Confirm)
  const handleSendSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { formatted, isValid } = formatToE164(phoneNumber);
    if (!isValid) {
      setError("Please specify a valid mobile phone number in international E.164 format (e.g., +15551234567 or +919876543210).");
      setLoading(false);
      return;
    }

    try {
      const verifier = initRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
      setSignInConfirmationResult(confirmation);
      setMessage("SMS verification OTP sent! Please verify your device below.");
    } catch (err: any) {
      console.error("SMS Sign In Error:", err);
      setError(`SMS_SEND_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!signInOtp) {
      setError("Please specify the SMS verification code received.");
      setLoading(false);
      return;
    }

    try {
      if (!signInConfirmationResult) {
        throw new Error("No active SMS verification session found.");
      }
      await signInConfirmationResult.confirm(signInOtp);
      setMessage("Access granted! Entering secure workspace...");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err: any) {
      console.error("SMS Verify Error:", err);
      setError(`SMS_VERIFICATION_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // MFA Enrollment helpers (Signup phone validation path)
  const handleSendEnrollmentSms = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { formatted, isValid } = formatToE164(mfaPhoneNumber);
      if (!isValid) {
        throw new Error("Please specify a valid mobile phone number in international E.164 format (e.g., +15551234567 or +919876543210).");
      }

      const verifier = initRecaptcha();
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user session found.");

      const session = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: formatted,
        session: session
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, verifier);
      setMfaVerificationId(verificationId);
      setMessage("Verification code sent to your phone number!");
    } catch (err: any) {
      console.error("SMS Enrollment Error:", err);
      setError(`SMS_SEND_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnrollment = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaVerificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user session.");

      // Link phone provider to existing email/password user so they can login directly via SMS without creating duplicates
      try {
        await linkWithCredential(user, cred);
        console.log("Phone credential linked successfully.");
      } catch (linkErr: any) {
        console.warn("Phone linking warning (it might be already linked or in use):", linkErr);
      }

      await multiFactor(user).enroll(multiFactorAssertion, "Primary Phone");
      setMessage("MFA Activated! Your profile is now completely secure.");
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      console.error("MFA Confirmation Error:", err);
      setError(`MFA_ACTIVATION_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Login-time SMS MFA Verification handlers (if user is MFA-enrolled)
  const handleSendVerificationSms = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!mfaResolver) throw new Error("MFA Resolver not initialized.");
      const verifier = initRecaptcha();
      const phoneInfoOptions = {
        multiFactorHint: mfaResolver.hints[0],
        session: mfaResolver.session
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, verifier);
      setMfaVerificationId(verificationId);
      setMessage("MFA Security code dispatched to: " + mfaPhoneHint);
    } catch (err: any) {
      console.error("MFA Verification SMS Error:", err);
      setError(`MFA_SMS_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!mfaResolver) throw new Error("MFA Resolver not initialized.");
      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaVerificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      setMessage("MFA Verified! Logging you in...");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err: any) {
      console.error("MFA Verification Confirm Error:", err);
      setError(`MFA_CHALLENGE_FAILED: ${getCleanErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setError(null);
    setMessage(null);
    setSignInConfirmationResult(null);
    setRegisteredEmail(null);
    setMode(prev => prev === 'signup' ? 'signin' : 'signup');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden text-zinc-100">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md bg-zinc-900/40 border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-700">
        
        {/* Invisible Recaptcha container for Phone Authentication */}
        <div id="recaptcha-container"></div>
        
        {onClose && (
           <button onClick={onClose} className="absolute top-6 left-6 text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
        )}

        <div className="text-center mb-8">
          <KryptoLogo className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" size={64} />
          <h1 className="text-3xl font-black tracking-tighter gold-text-gradient uppercase mb-2">Krypto AI</h1>
          <p className="text-zinc-500 font-medium text-xs tracking-wide">
            {mfaVerificationRequired 
              ? 'MULTI-FACTOR CHALLENGE' 
              : mfaEnrollmentRequired 
                ? 'SECURE YOUR SECURITY VAULT' 
                : mfaVerificationRequired 
                  ? 'VERIFY ACCESS CODE' 
                  : mode === 'signup' 
                    ? 'ENGINEER YOUR CAREER PROFILE'
                    : 'ACCESS YOUR CAREER VAULT'}
          </p>
        </div>

        {/* SCREEN 1: Multi-Factor Authentication Verification Required on Sign-in */}
        {mfaVerificationRequired && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-center">
              <p className="text-zinc-400 text-xs leading-relaxed">
                SMS verification is required for this account. We will send a one-time passcode to your registered device: 
                <strong className="text-yellow-500 block mt-1 font-mono">{mfaPhoneHint}</strong>
              </p>
            </div>

            {mfaVerificationId === '' ? (
              <button
                onClick={handleSendVerificationSms}
                disabled={loading}
                className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl disabled:opacity-50 border-b-4 border-yellow-700 font-mono"
              >
                {loading ? 'Requesting SMS...' : 'Send SMS Security Code'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">One-Time Passcode (OTP)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 123456"
                    value={mfaVerificationCode}
                    onChange={(e) => setMfaVerificationCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-center font-mono text-lg text-yellow-500 tracking-[0.5em] focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                  />
                </div>

                <button
                  onClick={handleConfirmVerification}
                  disabled={loading || !mfaVerificationCode}
                  className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl disabled:opacity-50 border-b-4 border-yellow-700"
                >
                  {loading ? 'Verifying OTP...' : 'Verify & Enter Vault'}
                </button>

                <button
                  onClick={handleSendVerificationSms}
                  disabled={loading}
                  className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-bold uppercase tracking-widest"
                >
                  Resend SMS OTP
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                 <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            {message && <p className="text-green-500 text-[9px] font-black uppercase tracking-widest text-center px-2">{message}</p>}
          </div>
        )}

        {/* SCREEN 2: Multi-Factor Authentication Enrollment (At Sign-up onboarding) */}
        {mfaEnrollmentRequired && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-center">
              <p className="text-zinc-400 text-xs leading-relaxed">
                Enhance your security. Verify your mobile number to complete authentication enrollment.
              </p>
            </div>

            {mfaVerificationId === '' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Mobile Phone Number (E.164 Format)</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +15555555555"
                    value={mfaPhoneNumber}
                    onChange={(e) => setMfaPhoneNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-mono text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                  />
                  <span className="text-[8px] text-zinc-500 font-medium px-1 leading-normal block">Must include country code (e.g., +1 for USA, +91 for India).</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSendEnrollmentSms}
                    disabled={loading || !mfaPhoneNumber}
                    className="flex-1 py-4 bg-yellow-500 text-zinc-950 rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all font-sans"
                  >
                    {loading ? 'Sending...' : 'Configure Device'}
                  </button>
                  <button
                    onClick={async () => {
                      const user = auth.currentUser;
                      if (user) {
                        try {
                          await user.delete();
                        } catch (err: any) {
                          console.error("Failed to delete unverified user draft", err);
                        }
                      }
                      setMfaEnrollmentRequired(false);
                      setMode('signup');
                      setError("Registration cancelled: Verification is mandatory to complete sign-up.");
                      setMessage(null);
                    }}
                    className="flex-1 py-4 bg-transparent border border-zinc-800 text-zinc-500 rounded-[20px] text-[9px] font-bold uppercase tracking-[0.2em] hover:text-red-400 active:scale-95 transition-all"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">SMS Verification Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 123456"
                    value={mfaVerificationCode}
                    onChange={(e) => setMfaVerificationCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-center font-mono text-lg text-yellow-500 tracking-[0.5em] focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmEnrollment}
                    disabled={loading || !mfaVerificationCode}
                    className="flex-1 py-4 bg-yellow-500 text-zinc-950 rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-xl"
                  >
                    {loading ? 'Verifying...' : 'Validate & Activate'}
                  </button>
                  <button
                    onClick={() => setMfaVerificationId('')}
                    className="flex-1 py-4 bg-transparent border border-zinc-800 text-zinc-500 rounded-[20px] text-[9px] font-bold uppercase tracking-[0.2em] hover:text-zinc-300 transition-all"
                  >
                    Modify Phone
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                 <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            {message && <p className="text-green-500 text-[9px] font-black uppercase tracking-widest text-center px-2">{message}</p>}
          </div>
        )}

        {/* SCREEN 3: Sign-Up Form (Default) or Sign-In Form */}
        {!mfaVerificationRequired && !mfaEnrollmentRequired && (
          <>
            {registeredEmail ? (
              /* ==================== EMAIL VERIFICATION PENDING SCREEN ==================== */
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="p-5 bg-zinc-950 border border-zinc-800/80 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-500">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Verify Your Identity</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    A secure verification link has been dispatched to:
                    <strong className="text-yellow-500 block mt-1 font-mono break-all">{registeredEmail}</strong>
                  </p>
                  <p className="text-zinc-500 text-[10px] leading-normal pt-2">
                    Please secure the activation code via email by clicking the link to verify your profile, then access the vault.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegisteredEmail(null);
                    setMode('signin');
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl border-b-4 border-yellow-700 font-mono"
                >
                  Proceed to Sign In
                </button>

                <p className="text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  Verified your email? Click above to enter your vault.
                </p>
              </div>
            ) : mode === 'forgot' ? (
              /* ==================== FORGOT PASSWORD SCREEN ==================== */
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-center">
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Provide your registered email address to receive a secure password reset link.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="alex.carter@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                       <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                    </div>
                  )}

                  {message && <p className="text-green-500 text-xs font-semibold text-center px-2 py-1 leading-relaxed border border-green-500/15 bg-green-500/5 rounded-2xl">{message}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-yellow-500 transition-all font-semibold uppercase tracking-wider"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            ) : mode === 'signup' ? (
              /* ==================== SIGN UP SCREEN_ ==================== */
              <div className="animate-in fade-in duration-500">
                {/* Sign-Up Verification Method Selector */}
                <div className="flex bg-zinc-950 p-1.5 rounded-[24px] mb-6 border border-zinc-800/50">
                  <button 
                    type="button"
                    onClick={() => { setSignupVerifyMethod('email'); setError(null); setMessage(null); }}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${signupVerifyMethod === 'email' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    Verify via Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSignupVerifyMethod('phone'); setError(null); setMessage(null); }}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${signupVerifyMethod === 'phone' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    Verify via Phone
                  </button>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Alex Carter"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="alex.carter@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                    />
                  </div>

                  {signupVerifyMethod === 'phone' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Mobile number (E.164 Format)</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. +15551234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800 font-mono"
                      />
                      <span className="text-[8px] text-zinc-500 font-medium px-1 leading-normal block">
                        Must include country code (e.g., +1 for USA, +91 for India).
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                       <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                    </div>
                  )}

                  {message && <p className="text-green-500 text-xs font-semibold text-center px-2 py-1 leading-relaxed border border-green-500/15 bg-green-500/5 rounded-2xl">{message}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button 
                    onClick={toggleAuthMode}
                    className="text-xs text-zinc-400 hover:text-yellow-500 transition-all font-semibold"
                  >
                    Account already exists? <span className="underline decoration-yellow-500/40 text-yellow-500 uppercase tracking-wider text-[10px] ml-1">Sign In</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ==================== SIGN IN SCREEN_ ==================== */
              <div className="animate-in fade-in duration-500">
                {/* Sign-In Selector (Quick Password vs SMS OTP verification) */}
                <div className="flex bg-zinc-950 p-1.5 rounded-[24px] mb-6 border border-zinc-800/50">
                  <button 
                    type="button"
                    onClick={() => { setSigninMethod('password'); setError(null); setMessage(null); }}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${signinMethod === 'password' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    Quick Password
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSigninMethod('sms'); setError(null); setMessage(null); }}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${signinMethod === 'sms' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                  >
                    SMS OTP
                  </button>
                </div>

                {signinMethod === 'password' ? (
                  /* PASSWORD SIGN-IN FORM */
                  <form onSubmit={handlePasswordSigninSubmit} className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="alex.carter@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Password</label>
                        <button 
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setError(null);
                            setMessage(null);
                          }}
                          className="text-[9px] font-black text-zinc-500 hover:text-yellow-500 transition-colors uppercase tracking-widest"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                         <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                      </div>
                    )}

                    {message && <p className="text-green-500 text-xs font-semibold text-center px-2 py-1 leading-relaxed border border-green-500/15 bg-green-500/5 rounded-2xl">{message}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                ) : (
                  /* SMS DIRECT PASSWORDLESS SIGN-IN FORM */
                  <div className="space-y-4 mb-6">
                    {signInConfirmationResult === null ? (
                      <form onSubmit={handleSendSmsOtp} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Mobile Number (E.164 Format)</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="e.g. +15551234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800 font-mono"
                          />
                          <span className="text-[8px] text-zinc-500 font-medium px-1 leading-normal block">
                            Must include country code (e.g., +1 for USA, +91 for India).
                          </span>
                        </div>

                        {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                             <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                          </div>
                        )}

                        {message && <p className="text-green-500 text-xs font-semibold text-center px-2 py-1 leading-relaxed border border-green-500/15 bg-green-500/5 rounded-2xl">{message}</p>}

                        <button
                          type="submit"
                          disabled={loading || !phoneNumber}
                          className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
                        >
                          {loading ? 'Sending OTP...' : 'Send SMS Sign-In Code'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifySmsOtp} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">SMS verification Code</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 123456"
                            value={signInOtp}
                            onChange={(e) => setSignInOtp(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-center font-mono text-lg text-yellow-500 tracking-[0.5em] focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
                          />
                        </div>

                        {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
                             <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{error}</p>
                          </div>
                        )}

                        {message && <p className="text-green-500 text-xs font-semibold text-center px-2 py-1 leading-relaxed border border-green-500/15 bg-green-500/5 rounded-2xl">{message}</p>}

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={loading || !signInOtp}
                            className="flex-1 py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
                          >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSignInConfirmationResult(null); setError(null); setMessage(null); }}
                            className="flex-1 py-5 bg-transparent border border-zinc-800 text-zinc-500 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-zinc-300 transition-all"
                          >
                            Change Number
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="text-center mt-6">
                  <button 
                    onClick={toggleAuthMode}
                    className="text-xs text-zinc-400 hover:text-yellow-500 transition-all font-semibold"
                  >
                    New to Krypto AI? <span className="underline decoration-yellow-500/40 text-yellow-500 uppercase tracking-wider text-[10px] ml-1">Sign Up</span>
                  </button>
                </div>
              </div>
            )}

            {/* Social Authentication / Alternate access methods */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
              <div className="relative flex justify-center text-[8px] uppercase font-black"><span className="bg-[#0c0c0e] px-4 text-zinc-600 tracking-widest">Or Multi-Factor Auth</span></div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-[24px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Account
              </button>


            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
