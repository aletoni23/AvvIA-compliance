
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, FileText, Lock, Info, ChevronLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Candidate, Campaign, CandidateStatus, DocStatus, Document } from '../types';
import { OBBLIGATORIO_DOCS, ROLE_DEFAULT_DOCS } from '../constants';

interface CandidateDetailProps {
  candidate: Candidate;
  campaign: Campaign;
  onBack: () => void;
  onUpdate: (updated: Candidate) => void;
}

export const CandidateDetail: React.FC<CandidateDetailProps> = ({ candidate, campaign, onBack, onUpdate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [medicalForm, setMedicalForm] = useState({ date: '', time: '', location: 'Poliambulatorio Aziendale' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const roleConfig = campaign.roles.find(r => r.title === candidate.role);
  const requiredDocTypes = roleConfig ? roleConfig.requiredDocs : (ROLE_DEFAULT_DOCS[candidate.role] || []);

  const displayDocs = requiredDocTypes.map(docType => {
    const existingDoc = candidate.documents.find(d => d.type === docType);
    if (existingDoc) return existingDoc;
    return {
      id: `placeholder-${docType}`,
      type: docType,
      fileName: '',
      status: DocStatus.MISSING
    } as Document;
  });

  candidate.documents.forEach(d => {
    if (!requiredDocTypes.includes(d.type)) {
      displayDocs.push(d);
    }
  });

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatOpen, candidate.whatsappHistory]);

  const updateCandidate = (changes: Partial<Candidate>, auditMsg?: string, chatMsg?: string) => {
    let updated = { ...candidate, ...changes };
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (auditMsg) {
      updated.auditLog = [{ timestamp: now, message: auditMsg }, ...updated.auditLog];
    }
    if (chatMsg) {
      updated.whatsappHistory = [...updated.whatsappHistory, { sender: 'agent', text: chatMsg, timestamp: now }];
    }
    
    onUpdate(updated);
  };

  const handleAction = (type: 'reject' | 'request' | 'offer' | 'sollecita' | 'request_again') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === 'reject') {
      let updated = { ...candidate, status: CandidateStatus.REJECTED };
      updated.auditLog = [{ timestamp: now, message: 'Candidato scartato via WhatsApp.' }, ...updated.auditLog];
      updated.whatsappHistory = [
        ...updated.whatsappHistory, 
        { sender: 'system', text: 'Workflow interrotto: scarto candidato', timestamp: now },
        { sender: 'agent', text: 'Purtroppo non possiamo procedere con la tua candidatura a causa di inidoneità documentale.', timestamp: now }
      ];
      onUpdate(updated);
    } else if (type === 'request') {
      updateCandidate({ status: CandidateStatus.PENDING_DOCS }, 'Richiesto documento aggiornato via WhatsApp.', 'Il tuo documento risulta scaduto o non valido. Carica per favore una versione valida per procedere.');
    } else if (type === 'request_again') {
      updateCandidate({ status: CandidateStatus.PENDING_DOCS }, 'Documento sospetto segnalato. Richiesto nuovamente caricamento chiaro.', 'Il documento caricato presenta anomalie. Per favore, carica nuovamente una foto nitida e completa del tuo permesso di soggiorno.');
    } else if (type === 'offer') {
      updateCandidate({ status: CandidateStatus.OFFER_SENT, offerSent: true }, 'Offerta economica inviata via WhatsApp.', 'Abbiamo preparato la tua offerta economica. Visualizzala qui e conferma se accetti.');
    } else if (type === 'sollecita') {
      updateCandidate({}, 'Sollecito WhatsApp inviato.', 'Ciao! Siamo ancora in attesa di un tuo riscontro per procedere con l\'assunzione. Hai novità?');
    }
  };

  const handleConfirmMedical = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = `Visita medica programmata: ${medicalForm.date} alle ore ${medicalForm.time} presso ${medicalForm.location}`;
    updateCandidate(
      { status: CandidateStatus.MEDICAL_SCHEDULED, medicalVisitScheduled: true }, 
      msg, 
      `Ciao ${candidate.name}, la tua visita medica è stata programmata per il giorno ${medicalForm.date} alle ${medicalForm.time} presso ${medicalForm.location}.`
    );
    setShowMedicalModal(false);
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    const primaryColor = [6, 78, 59]; // #064E3B
    const now = new Date().toLocaleString();
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(15, 25, 195, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AvvIA", 15, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Compliance Tech Intelligence", 40, 20);
    doc.text(`Data Generazione: ${now}`, 195, 20, { align: "right" });
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text(`REPORT CANDIDATO: ${candidate.name.toUpperCase()}`, 15, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Ruolo: ${candidate.role}`, 15, 50);
    doc.text(`Campagna: ${campaign.name}`, 15, 55);
    doc.text(`Stato Attuale: ${candidate.status}`, 15, 60);
    doc.setFont("helvetica", "bold");
    doc.text("RIEPILIGO DOCUMENTALE", 15, 75);
    doc.line(15, 77, 80, 77);
    let y = 85;
    doc.setFontSize(9);
    doc.text("Tipo Documento", 15, y);
    doc.text("Stato", 80, y);
    doc.text("Note / Criticità", 120, y);
    y += 2;
    doc.line(15, y, 195, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    displayDocs.forEach(d => {
      doc.text(d.type, 15, y);
      doc.text(d.status, 80, y);
      if (d.reason) {
        doc.setFontSize(8);
        doc.text(d.reason, 120, y, { maxWidth: 70 });
        doc.setFontSize(9);
      } else {
        doc.text("-", 120, y);
      }
      y += 10;
    });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("ULTIME ATTIVITÀ RILEVANTI", 15, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    candidate.auditLog.slice(0, 5).forEach(log => {
      doc.text(`[${log.timestamp}] ${log.message}`, 15, y, { maxWidth: 180 });
      y += 8;
    });
    y = 265;
    const isCompliant = [CandidateStatus.READY_TO_START, CandidateStatus.CONTRACT_SIGNED, CandidateStatus.MEDICAL_SCHEDULED].includes(candidate.status);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("VALUTAZIONE FINALE DI COMPLIANCE:", 15, y);
    if (isCompliant) {
        doc.setTextColor(5, 150, 105);
        doc.text("CONFORME", 100, y);
    } else if (candidate.status === CandidateStatus.BLOCKED) {
        doc.setTextColor(220, 38, 38);
        doc.text("NON CONFORME / SOSPESO", 100, y);
    } else {
        doc.setTextColor(245, 158, 11);
        doc.text("IN FASE DI VERIFICA", 100, y);
    }
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Report generato automaticamente da AvvIA Infrastruttura. Uso riservato.", 15, 285);
    doc.save(`Report_AvvIA_${candidate.name.replace(" ", "_")}.pdf`);
  };

  const suspiciousDoc = candidate.documents.find(d => d.suspicious);

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-950 mb-10 transition-all font-bold text-[10px] group uppercase tracking-widest border border-slate-200 px-5 py-2.5 rounded-xl bg-white shadow-sm"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Indietro
      </button>

      <div className="flex gap-10 items-start">
        <div className="flex-1 space-y-8">
          <div className="premium-card p-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight leading-none">{candidate.name}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{candidate.role} • {campaign.name}</p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[9px] font-bold text-emerald-950 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 h-6 flex items-center">Madrelingua: {candidate.motherTongue}</span>
                </div>
              </div>
              <div className={`px-5 py-2 rounded-xl border font-bold text-[9px] uppercase tracking-widest shadow-sm ${getStatusStyles(candidate.status)}`}>
                {candidate.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Connessione Live</h3>
                <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner group relative overflow-hidden">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-600 absolute top-0 left-0 animate-ping opacity-30"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900 tracking-tight leading-none">WhatsApp</p>
                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest leading-none">{candidate.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="w-full h-11 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-3"
                >
                  {isChatOpen ? 'Chiudi Log' : 'Log Conversazione'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Checklist Ingaggio</h3>
                <div className="space-y-3">
                  <CheckItem label="Contratto firmato" checked={candidate.contractSigned} />
                  <CheckItem label="Visita programmata" checked={candidate.medicalVisitScheduled} />
                  <CheckItem label="DPI e Sicurezza" checked={candidate.dpiDelivered} />
                </div>
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
              <div className="bg-emerald-950 px-8 py-5 border-b border-emerald-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-950 font-bold text-sm shadow-sm">W</div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight uppercase">WhatsApp Intelligence Agent</h3>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-900/80 rounded-full border border-emerald-800 flex items-center gap-2">
                   <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                   <span className="text-[7px] font-bold text-white uppercase tracking-widest">AES-256</span>
                </div>
              </div>
              <div className="p-8 h-[400px] overflow-y-auto bg-slate-50/50 space-y-6 flex flex-col custom-scrollbar">
                {candidate.whatsappHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'agent' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {msg.sender === 'system' ? (
                      <div className="text-[8px] font-bold text-slate-500 bg-slate-200/50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
                         {msg.text}
                      </div>
                    ) : (
                      <div className={`max-w-[70%] p-5 rounded-2xl text-[13px] shadow-sm relative leading-relaxed ${
                        msg.sender === 'agent' ? 'bg-emerald-950 text-white rounded-tr-none' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-slate-100'
                      }`}>
                        <p className="font-medium">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1.5 mt-2 opacity-40`}>
                           <span className="text-[7px] font-bold uppercase tracking-widest">{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          <div className="premium-card p-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6 uppercase">Documentazione Conformità</h3>
            <div className="space-y-3">
              {displayDocs.map((doc) => {
                const isMandatory = OBBLIGATORIO_DOCS.includes(doc.type);
                const isMissing = doc.status === DocStatus.MISSING;
                return (
                  <div key={doc.id} className={`flex items-start gap-5 p-4 bg-white border rounded-2xl transition-all group ${isMissing ? 'border-slate-100 bg-slate-50/30' : 'border-slate-200 hover:border-emerald-950 shadow-sm'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[9px] border transition-all shrink-0 mt-0.5 ${getDocStatusStyles(doc.status)}`}>
                      {isMissing ? '?' : 'DOC'}
                    </div>
                    <div className="flex flex-col flex-1 gap-1.5">
                      <p className={`font-bold text-sm tracking-tight leading-tight ${isMissing ? 'text-slate-500' : 'text-slate-900'}`}>
                        {doc.type}
                      </p>
                      <div className="flex items-center gap-2">
                        {isMandatory && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[7px] font-bold uppercase tracking-widest">
                            Essential
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-widest border ${getDocBadgeStyles(doc.status, candidate.status)}`}>
                          {getDocStatusLabel(doc.status, candidate.status)}
                        </span>
                      </div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-none">
                        {doc.fileName || 'In attesa di caricamento'}
                      </p>
                      {doc.reason && (
                        <p className="text-[9px] text-red-800 font-bold leading-tight bg-red-50 px-2 py-1.5 rounded-md border border-red-100 mt-1">
                          {doc.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-[360px] sticky top-28">
          <div className="premium-card p-8">
            <h3 className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 pl-1">Azioni Operative</h3>
            <div className="flex flex-col space-y-3">
              
              {suspiciousDoc && candidate.status !== CandidateStatus.REJECTED && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl mb-2 space-y-4">
                  <p className="text-[8px] font-bold text-red-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    Alert Sicurezza OCR
                  </p>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => handleAction('request_again')} className="w-full h-10 bg-red-600 text-white rounded-xl text-[9px] font-bold hover:bg-red-700 transition-all uppercase tracking-widest shadow-md">Richiedi Nuovamente</button>
                    <button onClick={() => handleAction('reject')} className="w-full h-10 bg-white text-red-700 border border-red-200 rounded-xl text-[9px] font-bold hover:bg-red-50 transition-all uppercase tracking-widest">Scarta</button>
                  </div>
                </div>
              )}

              {candidate.status === CandidateStatus.AWAITING_RESPONSE && (
                <button onClick={() => handleAction('sollecita')} className="w-full h-11 bg-emerald-950 text-white rounded-xl text-[9px] font-bold hover:bg-black transition-all uppercase tracking-widest shadow-md">Sollecita WhatsApp</button>
              )}

              {displayDocs.some(d => d.status === DocStatus.INVALID || d.status === DocStatus.EXPIRED || d.status === DocStatus.MISSING) && !suspiciousDoc && candidate.status !== CandidateStatus.REJECTED && (
                <>
                  <button onClick={() => handleAction('request')} className="w-full h-11 bg-emerald-950 text-white rounded-xl text-[9px] font-bold hover:bg-black transition-all uppercase tracking-widest shadow-md">Richiedi Documenti</button>
                  <button onClick={() => handleAction('reject')} className="w-full h-11 bg-white text-red-700 border border-red-100 rounded-xl text-[9px] font-bold hover:bg-red-50 transition-all uppercase tracking-widest">Sospendi Ingaggio</button>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col space-y-3">
                <ActionButton label="Invia Contratto" active={candidate.status === CandidateStatus.READY_FOR_OFFER} done={candidate.offerSent} onClick={() => handleAction('offer')} />
                
                {(candidate.status === CandidateStatus.CONTRACT_SIGNED || candidate.status === CandidateStatus.MEDICAL_SCHEDULED) && (
                  <button 
                    onClick={() => setShowMedicalModal(true)}
                    className={`w-full h-11 rounded-xl text-[9px] font-bold transition-all border flex items-center justify-between px-5 uppercase tracking-widest ${
                      candidate.medicalVisitScheduled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-default' : 'bg-emerald-950 text-white border-emerald-950 hover:bg-black shadow-md'
                    }`}
                  >
                    <span>{candidate.medicalVisitScheduled ? 'Visita Fissata' : 'Fissa Visita'}</span>
                    {candidate.medicalVisitScheduled && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button 
                  onClick={handleGenerateReport}
                  className="w-full h-11 bg-white text-emerald-950 border border-emerald-950 rounded-xl text-[9px] font-bold transition-all flex items-center justify-between px-5 uppercase tracking-widest hover:bg-emerald-50 active:scale-[0.98] group"
                >
                  <span>Genera Dossier PDF</span>
                  <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Log</p>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {candidate.auditLog.map((log, idx) => (
                  <div key={idx} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1 before:w-1.5 before:h-1.5 before:bg-emerald-600 before:rounded-full">
                    <span className="text-slate-400 font-bold block mb-0.5 uppercase text-[7px] tracking-widest">{log.timestamp}</span>
                    <span className="text-slate-700 font-semibold text-[11px] leading-tight block">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMedicalModal && (
        <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-400">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Scheduling Visita</h3>
              <button onClick={() => setShowMedicalModal(false)} className="text-slate-400 hover:text-slate-900 p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleConfirmMedical} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data Visita</label>
                  <input required type="date" value={medicalForm.date} onChange={e => setMedicalForm({...medicalForm, date: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-950 font-semibold text-sm" />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Orario</label>
                  <input required type="time" value={medicalForm.time} onChange={e => setMedicalForm({...medicalForm, time: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-950 font-semibold text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full h-11 bg-emerald-950 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md uppercase tracking-widest text-[9px]">
                Notifica Candidato
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusStyles = (status: CandidateStatus) => {
  switch (status) {
    case CandidateStatus.BLOCKED: return 'bg-red-50 text-red-900 border-red-200';
    case CandidateStatus.PENDING_DOCS: return 'bg-amber-50 text-amber-900 border-amber-200';
    case CandidateStatus.READY_FOR_OFFER: return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    case CandidateStatus.OFFER_SENT: return 'bg-indigo-100 text-indigo-950 border-indigo-300';
    case CandidateStatus.CONTRACT_SIGNED: return 'bg-emerald-950 text-white border-emerald-950 shadow-sm';
    case CandidateStatus.READY_TO_START: return 'bg-emerald-600 text-white border-emerald-700 shadow-md';
    case CandidateStatus.MEDICAL_SCHEDULED: return 'bg-emerald-700 text-white border-emerald-800';
    case CandidateStatus.VERIFYING: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getDocStatusLabel = (docStatus: DocStatus, candidateStatus: CandidateStatus) => {
  if (docStatus === DocStatus.MISSING) return 'In attesa';
  if (docStatus === DocStatus.INVALID) return 'Non conforme';
  if (docStatus === DocStatus.EXPIRED) return 'Scaduto';
  if (docStatus === DocStatus.RECEIVED) {
    if (candidateStatus === CandidateStatus.VERIFYING) return 'Analisi AI...';
    return 'Validato';
  }
  return docStatus;
};

const getDocStatusStyles = (status: DocStatus) => {
  switch (status) {
    case DocStatus.RECEIVED: return 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-sm';
    case DocStatus.INVALID: return 'bg-red-50 text-red-700 border-red-200 shadow-sm';
    case DocStatus.EXPIRED: return 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm';
    default: return 'bg-slate-50 text-slate-400 border-slate-200 shadow-inner';
  }
};

const getDocBadgeStyles = (docStatus: DocStatus, candidateStatus: CandidateStatus) => {
  if (docStatus === DocStatus.MISSING) return 'text-slate-500 bg-slate-50 border-slate-200';
  if (docStatus === DocStatus.INVALID) return 'text-red-900 bg-red-50 border-red-100';
  if (docStatus === DocStatus.EXPIRED) return 'text-amber-900 bg-amber-50 border-amber-100';
  if (docStatus === DocStatus.RECEIVED) {
    if (candidateStatus === CandidateStatus.VERIFYING) return 'text-emerald-900 bg-emerald-50 border-emerald-200 animate-pulse';
    return 'text-emerald-950 bg-emerald-100 border-emerald-300';
  }
  return 'text-slate-500 bg-slate-50 border-slate-200';
};

const CheckItem = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-emerald-950 border-emerald-950 text-white shadow-sm' : 'bg-white border-slate-200'}`}>
      {checked && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${checked ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const ActionButton = ({ label, active, done, onClick }: { label: string, active: boolean, done: boolean, onClick: () => void }) => {
  const isDisabled = !active && !done;
  return (
    <button 
      disabled={isDisabled} 
      onClick={onClick} 
      className={`w-full h-11 rounded-xl text-[9px] font-bold transition-all border flex items-center px-5 uppercase tracking-widest ${
          done ? 'bg-slate-50 text-slate-400 border-slate-200 shadow-none cursor-default justify-between' :
          active ? 'bg-emerald-950 text-white border-emerald-950 hover:bg-black shadow-md active:scale-[0.98] justify-center' : 
          'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed justify-start gap-3 shadow-none'
      }`}
    >
      {!active && !done && <Lock className="w-3.5 h-3.5 opacity-50" />}
      <span className={active ? '' : 'flex-grow text-left'}>{label}</span>
      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
    </button>
  );
};
