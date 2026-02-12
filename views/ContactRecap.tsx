
import React, { useMemo } from 'react';
import { Candidate, Campaign, CandidateStatus } from '../types';

interface ContactRecapProps {
  campaign: Campaign;
  candidates: Candidate[];
  onActivate: (finalCandidates: Candidate[]) => void;
  onBack: () => void;
}

export const ContactRecap: React.FC<ContactRecapProps> = ({ campaign, candidates, onActivate, onBack }) => {
  const missingNumbers = useMemo(() => candidates.filter(c => !c.phone).length, [candidates]);
  const canActivate = missingNumbers === 0 && candidates.length > 0;

  const handleActivate = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalCandidates = candidates.map(c => ({
      ...c,
      status: CandidateStatus.VERIFYING,
      whatsappActive: true,
      auditLog: [{ timestamp: now, message: `Agente attivato: messaggio di benvenuto inviato automaticamente.` }, ...c.auditLog],
      whatsappHistory: [{ sender: 'agent', text: `Ciao ${c.name}, sono l'agente di AvvIA. Benvenuto nella campagna ${campaign.name}. Ti guiderò nel processo di assunzione.`, timestamp: now }]
    }));
    onActivate(finalCandidates);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 transition-all font-bold text-xs group uppercase tracking-widest"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Indietro
      </button>

      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Recap contatti – {campaign.name}</h1>
          <p className="text-slate-500 font-medium">L'attivazione contatterà automaticamente tutti i candidati in lista.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 mb-10 shadow-sm">
        <div className="flex gap-12 mb-10">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Candidati da contattare</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{candidates.length}</p>
          </div>
          <div className={`p-6 rounded-3xl border flex-1 ${missingNumbers > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${missingNumbers > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Numeri mancanti</p>
            <p className={`text-4xl font-black tracking-tight ${missingNumbers > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{missingNumbers}</p>
          </div>
        </div>

        <div className="space-y-3">
          {candidates.map(c => (
            <div key={c.id} className="flex items-center justify-between py-3 px-4 border-b border-slate-50 last:border-0 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">{c.name[0]}</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm tracking-tight">{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{c.role} • {c.motherTongue}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold ${!c.phone ? 'text-red-500' : 'text-slate-500'}`}>{c.phone || 'Numero Mancante'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          disabled={!canActivate}
          onClick={handleActivate}
          className={`w-full max-w-md bg-indigo-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 ${!canActivate && 'opacity-50'}`}
        >
          Attiva agente WhatsApp e contatta tutti
        </button>
      </div>
    </div>
  );
};
