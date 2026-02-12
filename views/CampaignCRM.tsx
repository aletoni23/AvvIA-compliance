
import React, { useMemo, useState, useEffect } from 'react';
import { Campaign, Candidate, CandidateStatus, DocStatus } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  BarChart3, 
  XCircle, 
  CheckCircle2, 
  ChevronDown,
  Eye,
  X,
  FileDown,
  Calendar,
  Briefcase,
  Download,
  Send,
  ChevronRight,
  Target,
  LayoutDashboard,
  Users
} from 'lucide-react';

interface CampaignCRMProps {
  campaign: Campaign;
  candidates: Candidate[];
  onSelectCandidate: (id: string) => void;
  onViewOverview: () => void;
  onUpdateCandidate: (updated: Candidate) => void;
  onNavigateToSetup: () => void;
}

export const CampaignCRM: React.FC<CampaignCRMProps> = ({ 
  campaign, 
  candidates, 
  onSelectCandidate, 
  onViewOverview, 
  onUpdateCandidate,
  onNavigateToSetup
}) => {
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);
  const [isReadySectionExpanded, setIsReadySectionExpanded] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);
  
  // Utilizziamo il flag needsPriorityReview per separare i candidati
  const toReview = useMemo(() => candidates.filter(c => c.needsPriorityReview === true), [candidates]);
  const activePipeline = useMemo(() => candidates.filter(c => c.needsPriorityReview !== true), [candidates]);
  const readyForContract = useMemo(() => candidates.filter(c => c.status === CandidateStatus.READY_FOR_OFFER), [candidates]);

  const roleSummaries = useMemo(() => {
    return campaign.roles.map(role => {
      const roleCandidates = candidates.filter(c => c.role === role.title);
      
      const ok = roleCandidates.filter(c => [
        CandidateStatus.READY_FOR_OFFER,
        CandidateStatus.OFFER_SENT,
        CandidateStatus.MEDICAL_SCHEDULED,
        CandidateStatus.CONTRACT_SIGNED,
        CandidateStatus.READY_TO_START
      ].includes(c.status)).length;

      const inRevision = roleCandidates.filter(c => [
        CandidateStatus.TO_REVIEW,
        CandidateStatus.VERIFYING
      ].includes(c.status)).length;

      const inAttesa = roleCandidates.filter(c => [
        CandidateStatus.PENDING_DOCS,
        CandidateStatus.AWAITING_RESPONSE,
        CandidateStatus.INCOMPLETE_DOCS
      ].includes(c.status)).length;

      const bloccati = roleCandidates.filter(c => [
        CandidateStatus.BLOCKED,
        CandidateStatus.REJECTED
      ].includes(c.status)).length;

      const percentage = Math.min(100, Math.round((ok / role.count) * 100));

      return {
        title: role.title,
        required: role.count,
        ok,
        inRevision,
        inAttesa,
        bloccati,
        percentage
      };
    });
  }, [campaign.roles, candidates]);

  const sortedActive = useMemo(() => {
    const priority = {
      [CandidateStatus.BLOCKED]: 0,
      [CandidateStatus.PENDING_DOCS]: 1,
      [CandidateStatus.VERIFYING]: 4,
      [CandidateStatus.READY_FOR_OFFER]: 5,
      [CandidateStatus.OFFER_SENT]: 6,
      [CandidateStatus.MEDICAL_SCHEDULED]: 7,
      [CandidateStatus.CONTRACT_SIGNED]: 8,
      [CandidateStatus.READY_TO_START]: 9,
    };
    return [...activePipeline].sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
  }, [activePipeline]);

  const handleSendContract = (candidate: Candidate) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: Candidate = {
      ...candidate,
      status: CandidateStatus.OFFER_SENT,
      offerSent: true,
      auditLog: [{ timestamp: now, message: 'Proposta contrattuale inviata via WhatsApp (Auto-Compliance)' }, ...candidate.auditLog],
      whatsappHistory: [...candidate.whatsappHistory, { sender: 'agent', text: `Ottime notizie ${candidate.name}! La tua documentazione è stata approvata. Ti abbiamo inviato il contratto per la firma digitale.`, timestamp: now }]
    };
    onUpdateCandidate(updated);
    setLastActionMsg(`Contratto inviato con successo a ${candidate.name}`);
    setTimeout(() => setLastActionMsg(null), 3000);
  };

  const handleSendAllContracts = () => {
    readyForContract.forEach(c => handleSendContract(c));
    setLastActionMsg(`Inviati ${readyForContract.length} contratti a tutti.`);
  };

  const handleQuickAction = (candidate: Candidate, action: string) => {
    let updated = { ...candidate, needsPriorityReview: false }; // Rimuoviamo sempre dalla coda prioritaria
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (action === 'approva') {
      updated.status = CandidateStatus.VERIFYING;
      updated.auditLog.unshift({ timestamp: now, message: 'Approvato per il contatto WhatsApp' });
      updated.whatsappHistory.push({ sender: 'agent', text: `Ciao ${candidate.name}, sono l'agente di AvvIA. Benvenuto nella campagna ${campaign.name}. Per iniziare, carica i documenti richiesti.`, timestamp: now });
    } else if (action === 'scarta') {
      updated.status = CandidateStatus.REJECTED;
      updated.auditLog.unshift({ timestamp: now, message: 'Candidato scartato prima del contatto' });
    }
    
    onUpdateCandidate(updated);
    if (drawerCandidate?.id === candidate.id) setDrawerCandidate(null);
  };

  const downloadFakeCV = (candidate: Candidate) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CURRICULUM VITAE", 105, 40, { align: "center" });
    doc.setFontSize(16);
    doc.text(candidate.name.toUpperCase(), 105, 55, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    doc.setFontSize(12);
    doc.text("PROFILO ESTRATTO DA AVVIA COMPLIANCE", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Ruolo: ${candidate.role}`, 20, 90);
    doc.text(`Lingua: ${candidate.motherTongue}`, 20, 100);
    doc.text(`Campagna: ${campaign.name}`, 20, 110);
    doc.setFont("helvetica", "bold");
    doc.text("ESPERIENZE SALIENTI:", 20, 130);
    doc.setFont("helvetica", "normal");
    doc.text("- Stagione 2023: Raccolta e prima trasformazione (Agrifood IT)", 20, 140);
    doc.text("- 2021-2022: Addetto linea di confezionamento automatizzata", 20, 150);
    doc.text("- Certificato HACCP valido fino al 2025", 20, 160);
    doc.save(`CV_${candidate.name.replace(/\s+/g, '_')}_AvvIA.pdf`);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerCandidate(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="relative space-y-12 animate-in fade-in duration-500 pb-24">
      {lastActionMsg && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{lastActionMsg}</span>
          </div>
        </div>
      )}

      {drawerCandidate && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={() => setDrawerCandidate(null)}
        />
      )}

      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-out border-l border-slate-200 flex flex-col ${drawerCandidate ? 'translate-x-0' : 'translate-x-full'}`}>
        {drawerCandidate && (
          <>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white flex items-center justify-center font-bold text-base">
                  {drawerCandidate.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-none mb-1">{drawerCandidate.name}</h3>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">In verifica prioritaria</span>
                </div>
              </div>
              <button onClick={() => setDrawerCandidate(null)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ruolo Proposto</p>
                   <p className="text-xs font-semibold text-slate-900 leading-tight">{drawerCandidate.role}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lingua Madre</p>
                   <p className="text-xs font-semibold text-slate-900 leading-tight">{drawerCandidate.motherTongue}</p>
                </div>
              </div>

              <section className="space-y-4">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                   <Briefcase className="w-3.5 h-3.5" /> Esperienza (Preview)
                </h4>
                <div className="space-y-3">
                  <div className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-emerald-600 before:rounded-full">
                    <p className="text-[12px] font-medium text-slate-700 leading-snug">Operaio agricolo esperto - 2 stagioni in raccolta olive e potatura (Puglia).</p>
                  </div>
                  <div className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full">
                    <p className="text-[12px] font-medium text-slate-700 leading-snug">Addetto logistica stagionale presso azienda Agrifood - Carico/scarico e stoccaggio.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                   <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-indigo-100">HACCP Certificato</span>
                   <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">Linea Produzione</span>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                   <Calendar className="w-3.5 h-3.5" /> Disponibilità e Note
                </h4>
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                   <p className="text-[12px] font-medium text-emerald-950 leading-relaxed italic">
                     "Candidato già noto per stagioni precedenti. Disponibilità immediata per trasferte in provincia. Buona capacità di lavoro in team."
                   </p>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                   <FileDown className="w-3.5 h-3.5" /> Documentazione CV
                </h4>
                <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between group hover:border-emerald-950 hover:bg-slate-50 transition-all cursor-pointer" onClick={() => downloadFakeCV(drawerCandidate)}>
                   <div className="flex items-center gap-3.5">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-[9px]">PDF</div>
                     <div>
                       <p className="text-[12px] font-semibold text-slate-900 leading-none mb-1">CV_{drawerCandidate.name.split(' ')[0]}_2024.pdf</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">1.2 MB</p>
                     </div>
                   </div>
                   <Download className="w-4 h-4 text-slate-300 group-hover:text-emerald-900 transition-colors" />
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => handleQuickAction(drawerCandidate, 'scarta')}
                className="flex-1 h-12 bg-white text-red-700 border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Scarta
              </button>
              <button 
                onClick={() => handleQuickAction(drawerCandidate, 'approva')}
                className="flex-[2] h-12 bg-emerald-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
              >
                Approva Ingaggio
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 uppercase">Pipeline Candidati</h1>
          <p className="text-slate-500 text-sm font-medium italic">Gestione flussi per <span className="text-emerald-950 font-bold uppercase">{campaign.name}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={onNavigateToSetup} className="h-12 px-6 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2.5 shadow-sm">
            <Plus className="w-4.5 h-4.5 text-slate-400" /> Nuova
          </button>
          <button onClick={onViewOverview} className="h-12 px-6 rounded-xl bg-emerald-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2.5 shadow-md">
            <BarChart3 className="w-4.5 h-4.5" /> Intelligence
          </button>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-slate-400" />
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none uppercase">Stato Fabbisogno</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoraggio organico stagionale</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleSummaries.map((role) => (
            <div key={role.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-900/30 transition-all group">
              <div className="mb-5">
                <div className="flex justify-between items-start mb-5 h-8">
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight leading-tight max-w-[70%] group-hover:text-emerald-950">{role.title}</h3>
                  <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap border border-slate-200/50">
                    {role.required} NEC.
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-1.5 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">OK: <span className="text-slate-900 font-semibold">{role.ok}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">REV: <span className="text-slate-900 font-semibold">{role.inRevision}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">ATT: <span className="text-slate-900 font-semibold">{role.inAttesa}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">BLO: <span className="text-slate-900 font-semibold">{role.bloccati}</span></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Copertura</span>
                  <span className="text-[10px] font-bold text-emerald-700">{role.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${role.percentage >= 100 ? 'bg-emerald-600' : role.percentage > 50 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                    style={{ width: `${role.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-emerald-100 rounded-[2rem] overflow-hidden shadow-md transition-all">
        <div 
          className="px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-emerald-50/20 transition-colors"
          onClick={() => setIsReadySectionExpanded(!isReadySectionExpanded)}
        >
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm">
              {readyForContract.length}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none uppercase mb-1">Inviabili ({readyForContract.length})</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Candidati con compliance completa pronti per il contratto.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {readyForContract.length > 0 && !isReadySectionExpanded && (
               <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Richiede Azione</span>
            )}
            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isReadySectionExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isReadySectionExpanded && (
          <div className="border-t border-emerald-50 animate-in slide-in-from-top-4 duration-300">
            <div className="p-8 space-y-3">
              {readyForContract.length === 0 ? (
                <p className="text-center py-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Nessun candidato pronto al momento</p>
              ) : (
                <>
                  <div className="flex justify-end mb-3">
                    <button 
                      onClick={handleSendAllContracts}
                      className="h-9 px-5 bg-emerald-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" /> Invia tutti
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {readyForContract.map(candidate => (
                      <div key={candidate.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-emerald-900/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-[10px] shadow-sm">
                            {candidate.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[13px] tracking-tight leading-none mb-1">{candidate.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{candidate.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-900 uppercase tracking-widest border border-emerald-200">
                             OK
                          </span>
                          <button 
                            onClick={() => handleSendContract(candidate)}
                            className="h-8 px-4 bg-white text-emerald-950 border border-emerald-950 rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all"
                          >
                            Invia Contratto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {toReview.length > 0 && (
        <section className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Priorità Revisione ({toReview.length})</h2>
          </div>
          <div className="space-y-3">
            {toReview.map(candidate => (
              <div 
                key={candidate.id} 
                onClick={() => setDrawerCandidate(candidate)}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm group hover:border-emerald-950 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-950 text-lg">
                    {candidate.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl tracking-tight leading-none mb-2 group-hover:text-emerald-950 transition-colors">{candidate.name}</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <span>{candidate.role}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span>{candidate.motherTongue}</span>
                      </p>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 group-hover:underline">
                        <Eye className="w-3 h-3" /> Anteprima
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleQuickAction(candidate, 'scarta')} className="h-10 px-4 text-red-700 font-bold border border-red-100 hover:bg-red-50 rounded-lg text-[9px] uppercase tracking-widest transition-all">
                    Scarta
                  </button>
                  <button onClick={() => handleQuickAction(candidate, 'approva')} className="h-10 px-6 bg-emerald-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md">
                    Approva
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
          <Users className="w-4 h-4 text-slate-400" />
          <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Pipeline Completa</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lavoratore</th>
              <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ruolo</th>
              <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stato Compliance</th>
              <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Dettaglio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedActive.map(candidate => (
              <tr 
                key={candidate.id} 
                onClick={() => onSelectCandidate(candidate.id)}
                className={`group hover:bg-emerald-50/20 transition-all cursor-pointer ${candidate.status === CandidateStatus.REJECTED ? 'opacity-50' : ''}`}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 group-hover:border-emerald-950 shadow-sm transition-all">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-[15px] tracking-tight leading-none mb-1 group-hover:text-emerald-950">{candidate.name}</span>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest opacity-70">{candidate.motherTongue}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-xs font-semibold text-slate-500">{candidate.role}</td>
                <td className="px-8 py-6">
                  <StatusBadge status={candidate.status} />
                </td>
                <td className="px-8 py-6 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-950 group-hover:translate-x-1 transition-all ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedActive.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Nessun candidato presente in pipeline</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: CandidateStatus }) => {
  const base = "inline-flex items-center px-3.5 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border shadow-sm";
  const styles: Record<string, string> = {
    [CandidateStatus.BLOCKED]: 'bg-red-50 text-red-800 border-red-200',
    [CandidateStatus.PENDING_DOCS]: 'bg-amber-50 text-amber-800 border-amber-200',
    [CandidateStatus.READY_TO_START]: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/10',
    [CandidateStatus.CONTRACT_SIGNED]: 'bg-emerald-950 text-white border-emerald-950',
    [CandidateStatus.VERIFYING]: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    [CandidateStatus.READY_FOR_OFFER]: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 text-indigo-950 border-indigo-200',
    [CandidateStatus.MEDICAL_SCHEDULED]: 'bg-emerald-700 text-white border-emerald-800',
  };
  return <span className={`${base} ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{status}</span>;
};
