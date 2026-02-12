
import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Campaign, CampaignRole } from '../types';
import { STANDARD_ROLES, ROLE_DEFAULT_DOCS, OBBLIGATORIO_DOCS, EXTRA_DOCS_LIST } from '../constants';

interface CampaignSetupProps {
  onSave: (campaign: Campaign) => void;
}

interface FormStateRole extends CampaignRole {
  availableDocs: string[];
  mandatoryDocs: string[];
}

export const CampaignSetup: React.FC<CampaignSetupProps> = ({ onSave }) => {
  const [step, setStep] = useState(1);
  const [showExtraModal, setShowExtraModal] = useState<{ roleIdx: number } | null>(null);
  const [showLockedModal, setShowLockedModal] = useState<{ doc: string } | null>(null);
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [formData, setFormData] = useState({
    name: '',
    productType: '',
    roles: [
      { 
        title: 'Operaio di campo', 
        count: 10, 
        requiredDocs: [...ROLE_DEFAULT_DOCS['Operaio di campo']],
        availableDocs: [...ROLE_DEFAULT_DOCS['Operaio di campo']],
        mandatoryDocs: [...OBBLIGATORIO_DOCS]
      }
    ] as FormStateRole[],
    periodStart: '',
    periodEnd: '',
    location: ''
  });

  const addRole = () => {
    const defaultRole = STANDARD_ROLES[0];
    setFormData({
      ...formData,
      roles: [...formData.roles, { 
        title: defaultRole, 
        count: 1, 
        requiredDocs: [...ROLE_DEFAULT_DOCS[defaultRole]],
        availableDocs: [...ROLE_DEFAULT_DOCS[defaultRole]],
        mandatoryDocs: [...OBBLIGATORIO_DOCS]
      }]
    });
  };

  const updateRole = (index: number, field: keyof FormStateRole, value: any) => {
    const newRoles = [...formData.roles];
    if (field === 'title') {
      newRoles[index] = { 
        ...newRoles[index], 
        title: value, 
        requiredDocs: [...ROLE_DEFAULT_DOCS[value]],
        availableDocs: [...ROLE_DEFAULT_DOCS[value]],
        mandatoryDocs: [...OBBLIGATORIO_DOCS]
      };
    } else {
      newRoles[index] = { ...newRoles[index], [field]: value };
    }
    setFormData({ ...formData, roles: newRoles });
  };

  const toggleDocument = (roleIdx: number, doc: string) => {
    if (OBBLIGATORIO_DOCS.includes(doc)) {
      setShowLockedModal({ doc });
      return;
    }

    const newRoles = [...formData.roles];
    const docs = newRoles[roleIdx].requiredDocs;
    if (docs.includes(doc)) {
      newRoles[roleIdx].requiredDocs = docs.filter(d => d !== doc);
    } else {
      newRoles[roleIdx].requiredDocs = [...docs, doc];
    }
    setFormData({ ...formData, roles: newRoles });
  };

  const toggleMandatory = (roleIdx: number, doc: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (OBBLIGATORIO_DOCS.includes(doc)) {
      setShowLockedModal({ doc });
      return;
    }

    const newRoles = [...formData.roles];
    const mandatories = newRoles[roleIdx].mandatoryDocs;
    if (mandatories.includes(doc)) {
      newRoles[roleIdx].mandatoryDocs = mandatories.filter(m => m !== doc);
    } else {
      newRoles[roleIdx].mandatoryDocs = [...mandatories, doc];
      if (!newRoles[roleIdx].requiredDocs.includes(doc)) {
        newRoles[roleIdx].requiredDocs.push(doc);
      }
    }
    setFormData({ ...formData, roles: newRoles });
  };

  const addExtraDoc = (roleIdx: number, doc: string) => {
    const newRoles = [...formData.roles];
    if (!newRoles[roleIdx].availableDocs.includes(doc)) {
      newRoles[roleIdx].availableDocs.push(doc);
      newRoles[roleIdx].requiredDocs.push(doc);
    }
    setFormData({ ...formData, roles: newRoles });
    setShowExtraModal(null);
  };

  const removeRole = (index: number) => {
    if (formData.roles.length === 1) return;
    setFormData({ ...formData, roles: formData.roles.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      productType: formData.productType,
      roles: formData.roles.map(({ availableDocs, mandatoryDocs, ...rest }) => rest),
      period: `Dal ${formData.periodStart} al ${formData.periodEnd}`,
      location: formData.location,
      createdAt: new Date().toISOString(),
      whatsappAgentActive: false
    };
    onSave(newCampaign);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {step === 2 && (
        <button 
          onClick={() => setStep(1)} 
          className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-950 mb-10 transition-all font-bold text-[10px] group uppercase tracking-widest border border-slate-200 px-5 py-2.5 rounded-xl bg-white shadow-sm"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Indietro
        </button>
      )}

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3 uppercase">
          {step === 1 ? 'Nuova Campagna' : 'Protocollo Compliance'}
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl italic">
          {step === 1 
            ? 'Configura i parametri operativi per la gestione della forza lavoro.' 
            : 'Definisci i requisiti documentali necessari per l\'ingaggio.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {step === 1 ? (
          <>
            <div className="premium-card overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/40">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">Dettagli Operativi</h2>
              </div>
              <div className="p-10 grid grid-cols-2 gap-x-10 gap-y-8">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 mb-2.5 uppercase tracking-[0.2em]">Titolo Campagna</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-950 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300 text-base shadow-inner" placeholder="es. Raccolta Olive 2024" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-2.5 uppercase tracking-[0.2em]">Tipologia Prodotto</label>
                  <select required value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-950 outline-none transition-all font-semibold text-slate-900 appearance-none cursor-pointer text-base shadow-inner">
                    <option value="">Seleziona...</option>
                    <option value="Pomodoro">Pomodoro</option>
                    <option value="Uva (Vino)">Uva (Vino)</option>
                    <option value="Olive (Olio)">Olive (Olio)</option>
                    <option value="Frutta">Frutta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-2.5 uppercase tracking-[0.2em]">Sede Principale</label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-950 outline-none font-semibold text-slate-900 text-base shadow-inner" placeholder="es. Bitonto, Puglia" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 mb-2.5 uppercase tracking-[0.2em]">Arco Temporale</label>
                  <div className="grid grid-cols-2 gap-6">
                    <input type="date" required min={today} value={formData.periodStart} onChange={e => setFormData({...formData, periodStart: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-base shadow-inner" />
                    <input type="date" required min={formData.periodStart || today} value={formData.periodEnd} onChange={e => setFormData({...formData, periodEnd: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-base shadow-inner" />
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-white shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">Pianificazione Ruoli</h2>
                </div>
                <button type="button" onClick={addRole} className="h-10 px-5 bg-white text-emerald-950 border border-emerald-950 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm">
                  + Aggiungi Ruolo
                </button>
              </div>
              <div className="p-10 space-y-6">
                {formData.roles.map((role, idx) => (
                  <div key={idx} className="flex gap-6 items-end p-8 bg-slate-50/30 border border-slate-100 rounded-2xl group relative hover:border-emerald-900/20 transition-all">
                    <div className="flex-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Ruolo Stagionale</label>
                      <select required value={role.title} onChange={e => updateRole(idx, 'title', e.target.value)} className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:border-emerald-950 cursor-pointer text-slate-900 shadow-sm text-sm">
                        {STANDARD_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="w-36">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Fabbisogno</label>
                      <input type="number" required min="1" value={role.count} onChange={e => updateRole(idx, 'count', parseInt(e.target.value))} className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:border-emerald-950 text-slate-900 shadow-sm text-sm" />
                    </div>
                    {formData.roles.length > 1 && (
                      <button type="button" onClick={() => removeRole(idx)} className="h-12 w-12 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
            {formData.roles.map((role, rIdx) => (
              <div key={rIdx} className="premium-card p-10">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{role.title}</h3>
                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-[0.2em] mt-1.5">Compliance Requirements</p>
                  </div>
                  <span className="text-[9px] font-bold px-4 py-2 bg-slate-900 text-white rounded-lg uppercase tracking-widest shadow-md">{role.count} Lavoratori</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {role.availableDocs.map(doc => {
                    const isSelected = role.requiredDocs.includes(doc);
                    const isMandatory = role.mandatoryDocs.includes(doc);
                    return (
                      <div key={doc} className={`p-6 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-white border-emerald-950 shadow-sm ring-2 ring-emerald-950/5' : 'bg-slate-50 border-transparent opacity-50 grayscale'
                      }`} onClick={() => toggleDocument(rIdx, doc)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-emerald-950 border-emerald-950 text-white shadow-md' : 'bg-white border-slate-200'
                          }`}>
                            {isSelected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                            {doc}
                          </span>
                        </div>
                        <div 
                          className={`text-[8px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${
                            isMandatory ? 'bg-emerald-950 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={(e) => toggleMandatory(rIdx, doc, e)}
                        >
                          {isMandatory ? 'Essential' : 'Optional'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    type="button" 
                    onClick={() => setShowExtraModal({ roleIdx: rIdx })}
                    className="h-12 px-8 text-[9px] font-bold text-emerald-900 hover:text-black transition-all uppercase tracking-widest flex items-center gap-3 bg-white rounded-xl border border-dashed border-slate-300 hover:border-emerald-950 hover:bg-emerald-50 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Aggiungi requisito extra
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 pt-10">
          <button type="submit" className="w-full max-w-md h-16 bg-emerald-950 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-4 text-xl tracking-tight hover:bg-black hover:shadow-xl shadow-lg shadow-emerald-950/10 active:scale-[0.99] uppercase">
            <span>{step === 1 ? 'Vai alla Compliance' : 'Attiva Infrastruttura'}</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2.5">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             Verifica automatizzata AvvIA AI
          </p>
        </div>
      </form>

      {showExtraModal !== null && (
        <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-400">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Extra Docs</h3>
              <button onClick={() => setShowExtraModal(null)} className="text-slate-400 hover:text-slate-900 p-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {EXTRA_DOCS_LIST.filter(d => !formData.roles[showExtraModal.roleIdx].availableDocs.includes(d)).map(doc => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => addExtraDoc(showExtraModal.roleIdx, doc)}
                    className="w-full text-left p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-950 hover:bg-emerald-50 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-950 tracking-tight">{doc}</span>
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
