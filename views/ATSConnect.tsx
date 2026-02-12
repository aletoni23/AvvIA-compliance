
import React, { useState } from 'react';
import { Candidate, CandidateStatus, Campaign } from '../types';
import { STANDARD_ROLES } from '../constants';

interface ATSConnectProps {
  campaign: Campaign;
  onImport: (candidates: Candidate[]) => void;
  onBack: () => void;
}

interface ATSOption {
  id: string;
  name: string;
  logo: React.ReactNode;
}

export const ATSConnect: React.FC<ATSConnectProps> = ({ campaign, onImport, onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedATS, setSelectedATS] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  const atsOptions: ATSOption[] = [
    { 
      id: 'workday', 
      name: 'Workday', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="#005CB9" opacity="0.2"/>
          <path d="M16 8l-2 8h-1l-1-4-1 4h-1l-2-8h1.2l1.3 5.5.8-3.5h1.4l.8 3.5 1.3-5.5H16z" fill="#005CB9"/>
        </svg>
      )
    },
    { 
      id: 'greenhouse', 
      name: 'Greenhouse', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#00B050" opacity="0.1"/>
          <path d="M12 7l-5 4v6h3v-3h4v3h3v-6l-5-4z" fill="#00B050"/>
          <circle cx="12" cy="14" r="1.5" fill="white"/>
        </svg>
      )
    },
    { 
      id: 'taleo', 
      name: 'Taleo', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6h16v12H4V6z" fill="#F80000" opacity="0.1"/>
          <path d="M7 8h10v2H7V8zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" fill="#F80000"/>
        </svg>
      )
    },
    { 
      id: 'altamira', 
      name: 'Altamira', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FF4F00" opacity="0.1"/>
          <path d="M12 6l-6 12h2.5l1.2-2.5h4.6l1.2 2.5H18L12 6zm-1.1 7.5L12 9.5l1.1 4h-2.2z" fill="#FF4F00"/>
        </svg>
      )
    },
  ];

  const mockATSCandidates = [
    { id: 'ats1', name: 'Giuseppe Verdi', phone: '+39 340 1111111', role: campaign.roles[0]?.title || STANDARD_ROLES[0], lang: 'Italiano', needsPermesso: false },
    { id: 'ats2', name: 'Laura Bianchi', phone: '+39 347 2222222', role: campaign.roles[0]?.title || STANDARD_ROLES[0], lang: 'Italiano', needsPermesso: false },
    { id: 'ats3', name: 'Antonio Esposito', phone: '+39 335 3333333', role: campaign.roles[1]?.title || STANDARD_ROLES[1], lang: 'Italiano', needsPermesso: false },
    { id: 'ats4', name: 'Chiara Romano', phone: '+39 328 4444444', role: campaign.roles[0]?.title || STANDARD_ROLES[0], lang: 'Italiano', needsPermesso: false },
  ];

  const handleConnect = () => {
    if (selectedATS) {
      setStep(2);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedCandidates);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCandidates(next);
  };

  const handleFinishImport = () => {
    const imported: Candidate[] = mockATSCandidates
      .filter(c => selectedCandidates.has(c.id))
      .map(c => ({
        id: `c-${c.id}`,
        name: c.name,
        phone: c.phone,
        motherTongue: c.lang,
        needsPermesso: c.needsPermesso,
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
        auditLog: [{ timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), message: `Importato da ATS (${selectedATS})` }],
        whatsappHistory: [],
        cvUrl: 'cv_ats_import.pdf'
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Collega il tuo ATS</h1>
          <p className="text-slate-500 mb-10">Seleziona il sistema da cui importare i candidati</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {atsOptions.map(ats => (
              <button 
                key={ats.id} 
                onClick={() => setSelectedATS(ats.id)}
                className={`relative p-8 border rounded-[2rem] bg-white shadow-sm flex flex-col items-center transition-all duration-300 group ${
                  selectedATS === ats.id 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {selectedATS === ats.id && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {ats.logo}
                </div>
                <span className={`font-bold text-sm ${selectedATS === ats.id ? 'text-indigo-600' : 'text-slate-600'}`}>{ats.name}</span>
              </button>
            ))}
          </div>

          {!selectedATS && (
            <p className="text-indigo-500 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
              Seleziona un ATS per continuare
            </p>
          )}

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleConnect}
              disabled={!selectedATS}
              className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center gap-3 ${
                selectedATS 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <span>Connetti Sistema</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Importa da {atsOptions.find(o => o.id === selectedATS)?.name}</h1>
              <p className="text-slate-500">Seleziona i candidati da spostare nella pipeline di AvvIA.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Sistema Connesso</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCandidates(new Set(mockATSCandidates.map(c => c.id)));
                        else setSelectedCandidates(new Set());
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidato</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lingua</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">CV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockATSCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCandidates.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{c.phone}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{c.lang}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded font-black uppercase border border-indigo-100">PDF</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              onClick={handleFinishImport}
              disabled={selectedCandidates.size === 0}
              className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl ${
                selectedCandidates.size > 0 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              Importa {selectedCandidates.size} Candidati
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
