
import React, { useState } from 'react';
import { Candidate, CandidateStatus, Campaign } from '../types';
import { STANDARD_ROLES } from '../constants';

interface ManualUploadProps {
  campaign: Campaign;
  onImport: (candidates: Candidate[]) => void;
  onBack: () => void;
}

export const ManualUpload: React.FC<ManualUploadProps> = ({ campaign, onImport, onBack }) => {
  const [step, setStep] = useState(1);
  const [extracted, setExtracted] = useState<any[]>([]);

  const simulateExtraction = () => {
    setStep(2);
    setExtracted([
      { id: 'ex1', name: 'Luca Romano', phone: '+39 349 1234567', role: campaign.roles[0]?.title || STANDARD_ROLES[0], lang: 'Italiano' },
      { id: 'ex2', name: 'Sofia Neri', phone: '', role: campaign.roles[0]?.title || STANDARD_ROLES[0], lang: 'Italiano' },
      { id: 'ex3', name: 'Matteo Colombo', phone: '+39 347 8889990', role: campaign.roles[1]?.title || STANDARD_ROLES[1], lang: 'Italiano' },
    ]);
  };

  const handleUpdate = (id: string, field: string, value: string) => {
    setExtracted(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleFinish = () => {
    const imported: Candidate[] = extracted.map(c => ({
      id: `c-${c.id}`,
      name: c.name,
      phone: c.phone,
      motherTongue: c.lang,
      needsPermesso: false,
      role: c.role,
      campaignId: campaign.id,
      status: CandidateStatus.TO_REVIEW,
      documents: [],
      whatsappActive: false,
      whatsappStatus: 'attivo',
      offerSent: false,
      medicalVisitScheduled: false,
      contractSigned: false,
      dpiDelivered: false,
      safetyCoursesCompleted: false,
      auditLog: [{ timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), message: 'Estratto da CV manuale' }],
      whatsappHistory: [],
      cvUrl: 'cv_manual_upload.pdf'
    }));
    onImport(imported);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      <button 
        onClick={step === 1 ? onBack : () => setStep(1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 transition-all font-bold text-xs group uppercase tracking-widest"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Indietro
      </button>

      {step === 1 ? (
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Aggiungi CV a mano</h1>
          <p className="text-slate-500 mb-10">Trascina qui i file dei candidati. AvvIA estrarrà dati e lingua madre.</p>
          <div onClick={simulateExtraction} className="border-4 border-dashed border-slate-200 rounded-[2.5rem] p-20 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover:bg-indigo-100 transition-colors">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest">Carica PDF o DOCX</p>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Estrazione Dati</h1>
          <div className="space-y-4">
            {extracted.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-6 shadow-sm">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">CV</div>
                <div className="flex-1 grid grid-cols-4 gap-4 text-left">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome Cognome</label>
                    <input type="text" value={c.name} onChange={e => handleUpdate(c.id, 'name', e.target.value)} className="w-full text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">WhatsApp</label>
                    <input type="text" value={c.phone} onChange={e => handleUpdate(c.id, 'phone', e.target.value)} className="w-full text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Lingua Madre</label>
                    <select value={c.lang} onChange={e => handleUpdate(c.id, 'lang', e.target.value)} className="w-full text-sm font-bold text-slate-900 outline-none">
                      <option value="Italiano">Italiano</option>
                      <option value="Rumeno">Rumeno</option>
                      <option value="Arabo">Arabo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Ruolo</label>
                    <select value={c.role} onChange={e => handleUpdate(c.id, 'role', e.target.value)} className="w-full text-sm font-bold text-slate-900 outline-none">
                      {STANDARD_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <button onClick={handleFinish} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg">Conferma ed Importa</button>
          </div>
        </div>
      )}
    </div>
  );
};
