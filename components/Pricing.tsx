
import React, { useState } from 'react';
import { PricingPlan, UserStatus } from '../types';
import { initiateRazorpayCheckout } from '../services/paymentService';

interface PricingProps {
  user: UserStatus;
  onUpgrade: (plan: PricingPlan) => void;
}

const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const isINR = user.currency === 'INR';

  // Configured Tiers:
  // Starter: $3 / ₹199
  // Pro: $9 / ₹499
  // Ultra: $25 / ₹1499
  const ultraProPrice = isINR ? 1499 : 25;
  const proPrice = isINR ? 499 : 9;
  const starterPrice = isINR ? 199 : 3;

  /**
   * Krypto AI Payment Link Matrix
   * Maps specific secure checkout points based on user locale.
   */
  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: starterPrice,
      credits: 50,
      features: ['50 Recruitment Credits', 'Full Platform Access', 'Basic Resume Scans'],
      paymentLink: isINR ? 'https://rzp.io/rzp/2FNGo49' : 'https://rzp.io/rzp/FeYPVA9',
    },
    {
      id: 'pro',
      name: 'Professional',
      price: proPrice,
      credits: 200,
      features: ['200 Recruitment Credits', 'Deep Persona Mapping', 'Local Salary Analysis', 'Priority AI Coach'],
      isPopular: true,
      paymentLink: isINR ? 'https://rzp.io/rzp/I3CZdIuA' : 'https://rzp.io/rzp/YpZzvNR',
    },
    {
      id: 'ultra-pro',
      name: 'Ultra Pro',
      price: ultraProPrice,
      credits: 1000,
      features: ['1000 Recruitment Credits', 'Advanced Strategy Suite', 'Deep Market Insights', 'Direct Bank Settlement Support'],
      paymentLink: isINR ? 'https://rzp.io/rzp/iP6Qt9K' : 'https://rzp.io/rzp/bLvBflX4',
    }
  ];

  const handlePayment = async (plan: PricingPlan) => {
    if (!plan.paymentLink) return;
    
    setIsProcessing(plan.id);
    try {
      await initiateRazorpayCheckout(plan.id, plan.price as number, user.symbol, plan.paymentLink);
      // In a production environment, this would wait for a webhook callback.
      // For this architecture, we trigger the local upgrade flow after redirection.
      onUpgrade(plan);
    } catch (err) {
      console.error("Secure Routing Error", err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
          Secure Global Access • {user.currency} Environment
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-zinc-100 uppercase">
          Unlock Your <span className="gold-text-gradient">Pro Potential</span>
        </h2>
        
        <div className="flex flex-col items-center gap-4 mb-8">
          <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
            Select the career pack that fits your current goals. 
            All transactions are routed through our encrypted settlement network.
          </p>
        </div>

        {isINR ? (
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-[32px] flex items-center gap-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Local Network Active</p>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Seamless <span className="text-zinc-100 font-bold">UPI, Cards, and Netbanking</span> support. Credits activate immediately upon settlement.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-[32px] flex items-center gap-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Global Transaction Protocol</p>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Accepting <span className="text-zinc-100 font-bold">International Cards</span> and major digital wallets. Secure settlement in USD.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isNumeric = typeof plan.price === 'number';
          let discount = 0;
          let originalPrice = 0;
          
          if (isNumeric) {
            const numericPrice = plan.price as number;
            if (plan.id === 'pro') {
              discount = 40;
              originalPrice = isINR ? 799 : 15;
            } else if (plan.id === 'ultra-pro') {
              discount = 60;
              originalPrice = isINR ? 3499 : 60;
            }
          }

          const processingThis = isProcessing === plan.id;

          return (
            <div 
              key={plan.id}
              className={`relative p-8 rounded-[40px] border transition-all duration-500 flex flex-col ${
                plan.isPopular 
                  ? 'bg-zinc-900 border-yellow-500/50 shadow-2xl shadow-yellow-500/10 scale-105 z-10' 
                  : 'bg-[#0c0c0e] border-zinc-800 hover:border-zinc-700'
              } ${processingThis ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-zinc-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-tight">{plan.name}</h3>
                <div className="flex flex-col">
                  {discount > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-zinc-600 line-through text-sm font-bold">
                        {user.symbol}{originalPrice}
                      </span>
                      <span className="text-green-500 text-[10px] font-black uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-100">{user.symbol}{plan.price}</span>
                    <span className="text-zinc-500 text-xs font-bold ml-1">/one-time</span>
                  </div>
                </div>
                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mt-4">
                  {plan.credits} CREDITS INCLUDED
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-zinc-400 font-medium leading-tight">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={!!isProcessing}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 ${
                  plan.isPopular
                    ? 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 shadow-xl shadow-yellow-500/20'
                    : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                }`}
              >
                {processingThis ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    Securing Connection...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Initialize Checkout
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-20 py-10 border-t border-zinc-900 text-center space-y-4">
        <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
        </div>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Secure Infrastructure • Enterprise-Grade Privacy • Instant Activation
        </p>
      </div>
    </div>
  );
};

export default Pricing;
