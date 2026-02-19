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
  const displaySymbol = isINR ? '₹' : '$';

  const ultraProPrice = isINR ? 1499 : 25;
  const proPrice = isINR ? 499 : 9;
  const starterPrice = isINR ? 199 : 3;

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
      await initiateRazorpayCheckout(plan.id, plan.price as number, displaySymbol, plan.paymentLink);
      onUpgrade(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
          Localized Asset Plan • {isINR ? 'INR Region' : 'Global Region'}
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-zinc-100 uppercase">
          Unlock Your <span className="gold-text-gradient">Pro Potential</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          Select the high-yield pack that matches your career trajectory. Secure settlement in {user.currency}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const processingThis = isProcessing === plan.id;
          return (
            <div key={plan.id} className={`relative p-8 rounded-[40px] border transition-all duration-500 flex flex-col ${plan.isPopular ? 'bg-zinc-900 border-yellow-500/50 shadow-2xl scale-105 z-10' : 'bg-[#0c0c0e] border-zinc-800'}`}>
              {plan.isPopular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-zinc-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>}
              <div className="mb-8">
                <h3 className="text-xl font-black text-zinc-100 mb-2 uppercase tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-100">{displaySymbol}{plan.price}</span>
                  <span className="text-zinc-500 text-xs font-bold ml-1">/one-time</span>
                </div>
                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mt-4">{plan.credits} CREDITS INCLUDED</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-zinc-400 font-medium leading-tight">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePayment(plan)} disabled={!!isProcessing} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${plan.isPopular ? 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 shadow-xl' : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'}`}>
                {processingThis ? <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div> : 'Initialize Checkout'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
