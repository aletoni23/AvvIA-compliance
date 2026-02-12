
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
    
    // Aggregazione secondo il nuovo sistema unificato richiesto
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
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none">Intelligence Operativa</h1>
          <p className="text-slate-500 text-base font-medium italic">Monitoraggio real-time della forza lavoro stagionale.</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-emerald-950 font-black text-[11px] uppercase tracking-widest transition-all border border-slate-200 px-8 py-4 rounded-2xl bg-white shadow-sm hover:border-slate-400">
          <ArrowLeft className="w-4 h-4" /> Pipeline
        </button>
      </div>

      <div className={`p-10 rounded-[3rem] border shadow-sm transition-all flex items-center justify-between ${
        stats.riskLevel === 'Alto' ? 'bg-red-50 border-red-200' : 
        stats.riskLevel === 'Medio' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-10">
          <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-lg ${
            stats.riskLevel === 'Alto' ? 'bg-red-600 text-white' : 
            stats.riskLevel === 'Medio' ? 'bg-amber-600 text-white' : 'bg-emerald-950 text-white'
          }`}>
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h2 className={`text-4xl font-black tracking-tighter uppercase leading-none ${
              stats.riskLevel === 'Alto' ? 'text-red-950' : stats.riskLevel === 'Medio' ? 'text-amber-950' : 'text-emerald-950'
            }`}>
              Rischio Operativo: {stats.riskLevel.toUpperCase()}
            </h2>
            <div className="flex flex-col gap-1.5">
              {stats.riskReasons.map((reason, idx) => (
                <p key={idx} className="text-sm font-bold text-slate-700 flex items-center gap-3">
                  <Circle className="w-1.5 h-1.5 fill-current opacity-40" /> {reason}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right border-l border-slate-200 pl-12 py-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Avvio</p>
           <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
             {campaign.id === 'demo-1' ? 'TRA 15 GIORNI' : stats.daysToStart === 0 ? 'ATTIVO' : `TRA ${stats.daysToStart} GIORNI`}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7 premium-card p-12">
          {/* Header pulito senza legenda superiore, titolo su singola riga */}
          <div className="flex items-center mb-12 pb-8 border-b border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4 whitespace-nowrap">
              <TrendingUp className="w-6 h-6 text-emerald-950" /> Readiness Funnel
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 900, fill: '#64748b', dy: 15}} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}} 
                  contentStyle={{borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px'}}
                />
                <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={72}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-5 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 pointer-events-none"><ShieldCheck className="w-48 h-48" /></div>
            <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Confidence Score</h3>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Analisi Predittiva AvvIA AI</p>
            
            <div className="flex items-end gap-5 mb-12">
              <span className="text-8xl font-black tracking-tighter leading-none">{stats.probability}%</span>
              <div className="bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-widest mb-4 px-6 py-2 rounded-full shadow-lg shadow-emerald-400/20 border border-white/10 h-10 flex items-center">
                 Validato
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3 mb-14 border border-white/5 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-1000" style={{width: `${stats.probability}%`}}></div>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/10">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Dati di Validazione:</p>
              <MetricRow 
                icon={<CheckCircle2 className="w-5 h-5" />} 
                label="Fabbisogno Stagionale" 
                value={stats.pronti >= stats.totalRequired ? 'OK' : 'DEFICIT'} 
                type={stats.pronti >= stats.totalRequired ? 'success' : 'warning'}
              />
              <MetricRow 
                icon={<FileCheck className="w-5 h-5" />} 
                label="Compliance Documentale" 
                value={(stats.pronti / Math.max(1, candidates.length)) > 0.85 ? 'ALTA' : 'MEDIA'} 
                type={(stats.pronti / Math.max(1, candidates.length)) > 0.85 ? 'success' : 'warning'}
              />
              <MetricRow 
                icon={<Clock className="w-5 h-5" />} 
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

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const MetricRow = ({ icon, label, value, type }: { icon: any, label: string, value: string, type: 'success' | 'warning' | 'danger' }) => (
  <div className="flex justify-between items-center h-10">
    <div className="flex items-center gap-4 text-white/80">
      <span className={type === 'success' ? 'text-emerald-400' : type === 'warning' ? 'text-amber-400' : 'text-red-400'}>
        {icon}
      </span>
      <span className="text-[14px] font-bold tracking-tight">{label}</span>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${
      type === 'success' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' : 
      type === 'warning' ? 'text-amber-400 border-amber-400/30 bg-amber-400/5' : 
      'text-red-400 border-red-400/30 bg-red-400/5'
    }`}>
      {value}
    </span>
  </div>
);
