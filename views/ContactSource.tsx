
import React from 'react';

interface ContactSourceProps {
  onSelect: (source: 'ats' | 'manual') => void;
  onBack: () => void;
}

export const ContactSource: React.FC<ContactSourceProps> = ({ onSelect, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-700">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-950 mb-12 transition-all font-bold text-xs group uppercase tracking-widest border-2 border-slate-200 px-5 py-2.5 rounded-xl bg-white shadow-sm"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Indietro
      </button>

      <div className="mb-20 text-center">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
          Ingresso Candidati
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          Configura il data entry per alimentare l'infrastruttura AvvIA.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <button 
          onClick={() => onSelect('ats')}
          className="bg-white border-2 border-slate-200 p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-emerald-950 hover:-translate-y-2 transition-all text-left group relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-900 mb-12 group-hover:bg-emerald-950 group-hover:text-white transition-all shadow-md">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase group-hover:text-emerald-950 transition-colors">Sync ATS</h3>
          <p className="text-slate-600 text-lg font-bold leading-relaxed tracking-tight">
            Integrazione diretta Enterprise (Workday, Taleo) per flussi massivi e sincronizzazione real-time.
          </p>
        </button>

        <button 
          onClick={() => onSelect('manual')}
          className="bg-white border-2 border-slate-200 p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-emerald-950 hover:-translate-y-2 transition-all text-left group relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-12 group-hover:bg-emerald-950 group-hover:text-white transition-all shadow-md">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase group-hover:text-emerald-950 transition-colors">Analisi CV</h3>
          <p className="text-slate-600 text-lg font-bold leading-relaxed tracking-tight">
            Upload massivo di documenti. L'OCR estrae anagrafiche e numeri WhatsApp per l'attivazione immediata.
          </p>
        </button>
      </div>
    </div>
  );
};
