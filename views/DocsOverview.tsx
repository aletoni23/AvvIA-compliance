
import React from 'react';
import { Campaign } from '../types';

interface DocsOverviewProps {
  campaign: Campaign;
  onContinue: () => void;
  onBack: () => void;
}

export const DocsOverview: React.FC<DocsOverviewProps> = ({ campaign, onContinue, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-700">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-950 mb-12 transition-all font-bold text-xs group uppercase tracking-widest border-2 border-slate-200 px-5 py-2.5 rounded-xl bg-white shadow-sm"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Indietro
      </button>

      <div className="mb-16">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
          Riepilogo Compliance
        </h1>
        <p className="text-slate-500 font-medium italic text-lg">Infrastruttura di verifica documentale per <span className="font-black text-emerald-900 uppercase">{campaign.name}</span></p>
      </div>

      <div className="grid gap-8">
        {campaign.roles.map((role, idx) => (
          <div key={idx} className="premium-card rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-10 pb-8 border-b-2 border-slate-50">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{role.title}</h3>
              <span className="text-[12px] font-black px-5 py-2 bg-emerald-950 text-white rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-900/10">{role.count} Lavoratori</span>
            </div>
            <div className="space-y-6">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Requisiti Documentali WhatsApp:</p>
              <div className="grid grid-cols-2 gap-6">
                {role.requiredDocs.map((doc, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-5 p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] group hover:border-emerald-950 hover:bg-white transition-all shadow-sm">
                    <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-emerald-950 group-hover:bg-emerald-950 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight group-hover:text-emerald-950">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center">
        <button
          onClick={onContinue}
          className="w-full max-w-lg bg-emerald-950 hover:bg-black text-white font-black py-6 px-12 rounded-[2.5rem] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center gap-5 group text-xl tracking-tighter uppercase"
        >
          <span>Origine Candidati</span>
          <svg className="w-7 h-7 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>
    </div>
  );
};
