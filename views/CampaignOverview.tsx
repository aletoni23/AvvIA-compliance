
import React, { useMemo } from 'react';
import { Campaign, Candidate, CandidateStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp, Clock, FileCheck, Circle, ShieldCheck } from 'lucide-react';

interface CampaignOverviewProps {
  campaign: Campaign;
  candidates: Candidate[];
  onBack: () => void;
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaign, candidates, onBack }) => {
  const stats = useMemo(() => {
    const totalRequired = campaign.roles.reduce((sum, r) => sum + r.count, 0);
    
    const pronti = candidates.filter(c => [
        CandidateStatus.READY_FOR_OFFER,
        CandidateStatus.OFFER_SENT,
        CandidateStatus.CONTRACT_SIGNED,
        CandidateStatus.MEDICAL_SCHEDULED,
        CandidateStatus.READY_TO_START
      ].includes(c.status)).length;
    
    const inVerifica = candidates.filter(c => [
        CandidateStatus.VERIFYING,
        CandidateStatus.TO_REVIEW
      ].includes(c.status)).length;

    const critici = candidates.filter(c => [
        CandidateStatus.BLOCKED,
        CandidateStatus.REJECTED,
        CandidateStatus.PENDING_DOCS,
        CandidateStatus.INCOMPLETE_DOCS,
        CandidateStatus.AWAITING_RESPONSE
      ].includes(c.status)).length;

    let daysToStart = 0;
    if (campaign.id === 'demo-1') {
      daysToStart = 15;
    } else if (campaign.period.includes('Dal ')) {
      const parts = campaign.period.split(' ');
      const startDateStr = parts[1];
      const startDate = new Date(startDateStr);
      if (!isNaN(startDate.getTime())) {
        const diffTime = startDate.getTime() - new Date().getTime();
        daysToStart = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    let riskLevel: 'Basso' | 'Medio' | 'Alto' = 'Basso';
    const riskReasons: string[] = [];

    if (candidates.length < totalRequired) {
      riskLevel = 'Alto';
      riskReasons.push(`Gap Pipeline: mancano ${totalRequired - candidates.length} candidati.`);
    }

    if (pronti < totalRequired) {
      if (daysToStart <= 7 && daysToStart > 0) {
        riskLevel = 'Alto';
        riskReasons.push(`Criticità Temporale: solo ${pronti}/${totalRequired} pronti a ${daysToStart}gg.`);
      } else if (daysToStart === 0) {
        riskLevel = 'Alto';
        riskReasons.push(`Campagna Avviata: mancano ${totalRequired - pronti} lavoratori al target.`);
      } else if (daysToStart <= 15 && pronti < totalRequired / 2) {
        riskLevel = 'Alto';
        riskReasons.push(`Readiness insufficiente: < 50% dell'organico pronto.`);
      } else if (riskLevel !== 'Alto') {
        riskLevel = 'Medio';
        riskReasons.push(`Copertura Parziale: ${pronti}/${totalRequired} lavoratori pronti.`);
      }
    }

    let probability = 98;
    if (riskLevel === 'Alto') probability = 35 + Math.min(pronti * 5, 20);
    else if (riskLevel === 'Medio') probability = 65 + Math.min(pronti * 3, 15);

    return { totalRequired, pronti, inVerifica, critici, riskLevel, riskReasons, daysToStart, probability };
  }, [candidates, campaign]);

  const chartData = [
    { name: 'PRONTI', value: stats.pronti, color: '#059669' },
    { name: 'IN VERIFICA', value: stats.inVerifica, color: '#6366f1' },
    { name: 'CRITICI', value: stats.critici, color: '#dc2626' },
    { name: 'TARGET', value: stats.totalRequired, color: '#cbd5e1' },
  ];

  return (
    <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase mb-1 leading-none">Intelligence Operativa</h1>
          <p className="text-slate-500 text-sm font-medium italic">Monitoraggio real-time della forza lavoro stagionale.</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-emerald-950 font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-200 px-6 py-3 rounded-xl bg-white shadow-sm hover:border-slate-400">
          <ArrowLeft className="w-4 h-4" /> Pipeline
        </button>
      </div>

      <div className={`p-8 rounded-[2rem] border shadow-sm transition-all flex items-center justify-between ${
        stats.riskLevel === 'Alto' ? 'bg-red-50 border-red-200' : 
        stats.riskLevel === 'Medio' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
            stats.riskLevel === 'Alto' ? 'bg-red-600 text-white' : 
            stats.riskLevel === 'Medio' ? 'bg-amber-600 text-white' : 'bg-emerald-950 text-white'
          }`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold tracking-tight uppercase leading-none ${
              stats.riskLevel === 'Alto' ? 'text-red-950' : stats.riskLevel === 'Medio' ? 'text-amber-950' : 'text-emerald-950'
            }`}>
              Rischio Operativo: {stats.riskLevel.toUpperCase()}
            </h2>
            <div className="flex flex-col gap-1">
              {stats.riskReasons.map((reason, idx) => (
                <p key={idx} className="text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                  <Circle className="w-1 h-1 fill-current opacity-40" /> {reason}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right border-l border-slate-200/60 pl-10 py-2">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Avvio</p>
           <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
             {campaign.id === 'demo-1' ? 'TRA 15 GIORNI' : stats.daysToStart === 0 ? 'ATTIVO' : `TRA ${stats.daysToStart} GIORNI`}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7 premium-card p-10">
          <div className="flex items-center mb-10 pb-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-3 whitespace-nowrap">
              <TrendingUp className="w-5 h-5 text-emerald-950" /> Readiness Funnel
            </h3>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 700, fill: '#64748b', dy: 10}} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 10}} 
                  contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '12px'}}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-125 rotate-12 pointer-events-none">
              <ShieldCheck className="w-48 h-48" />
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold tracking-tight uppercase mb-1">Confidence Score</h3>
              <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.2em]">Analisi Predittiva AvvIA AI</p>
            </div>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-6xl font-bold tracking-tighter leading-none">{stats.probability}%</span>
              <div className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                 Validato
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-10 border border-white/5 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-1000" style={{width: `${stats.probability}%`}}></div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/10 mt-auto">
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Dati di Validazione:</p>
              <MetricRow 
                icon={<CheckCircle2 className="w-4 h-4" />} 
                label="Fabbisogno Stagionale" 
                value={stats.pronti >= stats.totalRequired ? 'OK' : 'DEFICIT'} 
                type={stats.pronti >= stats.totalRequired ? 'success' : 'warning'}
              />
              <MetricRow 
                icon={<FileCheck className="w-4 h-4" />} 
                label="Compliance Documentale" 
                value={(stats.pronti / Math.max(1, candidates.length)) > 0.85 ? 'ALTA' : 'MEDIA'} 
                type={(stats.pronti / Math.max(1, candidates.length)) > 0.85 ? 'success' : 'warning'}
              />
              <MetricRow 
                icon={<Clock className="w-4 h-4" />} 
                label="Tempistiche di Avvio" 
                value={stats.daysToStart > 10 ? 'SICURO' : 'CRITICO'} 
                type={stats.daysToStart > 10 ? 'success' : 'danger'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ icon, label, value, type }: { icon: any, label: string, value: string, type: 'success' | 'warning' | 'danger' }) => (
  <div className="flex justify-between items-center h-8">
    <div className="flex items-center gap-3 text-white/70">
      <span className={type === 'success' ? 'text-emerald-400' : type === 'warning' ? 'text-amber-400' : 'text-red-400'}>
        {icon}
      </span>
      <span className="text-[13px] font-medium tracking-tight">{label}</span>
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${
      type === 'success' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 
      type === 'warning' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 
      'text-red-400 border-red-400/20 bg-red-400/5'
    }`}>
      {value}
    </span>
  </div>
);
