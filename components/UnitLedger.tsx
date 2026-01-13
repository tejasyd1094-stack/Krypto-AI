
import React from 'react';

const CREDIT_BREAKDOWN = [
  { action: 'Strategy Advice', cost: 2, description: 'Quick AI Career Coach interaction.' },
  { action: 'Outreach Protocol', cost: 5, description: 'Company-specific DMs and Email generation.' },
  { action: 'Advanced Strategy', cost: 10, description: 'Deep execution blueprint for career pivots.' },
  { action: 'Resume Audit', cost: 10, description: 'Deep ATS scan and Google XYZ optimization.' },
  { action: 'Resume Architect', cost: 15, description: 'Full optimized document rewrite (Full rewrite / Export).' },
  { action: 'Interview Lab Session', cost: 15, description: 'Company-specific behavioral/technical simulation.' },
  { action: 'DNA Mapping (Experienced)', cost: 35, description: 'Tenure-based strategic pivoting analysis.' },
  { action: 'DNA Mapping (Fresher)', cost: 25, description: 'Behavioral profiling for new entrants.' },
];

const UnitLedger: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-yellow-500/20">
          Resource Allocation Matrix
        </div>
        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter uppercase text-zinc-100">
          Credit <span className="gold-text-gradient">System</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium uppercase">
          High-performance compute dedicated to your career lifecycle.
        </p>
      </div>

      <div className="prose-krypto">
        <div className="table-container shadow-2xl">
          <table>
            <thead>
              <tr>
                <th>Operation / Feature</th>
                <th>Cost (Credits)</th>
                <th>Frequency Type</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_BREAKDOWN.map((item, idx) => (
                <tr key={idx}>
                  <td className="font-black text-zinc-100 uppercase text-[10px] tracking-widest">{item.action}</td>
                  <td className="font-black text-yellow-500">{item.cost} Cr.</td>
                  <td className="text-zinc-400 text-[10px] font-bold uppercase tracking-tighter">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnitLedger;
