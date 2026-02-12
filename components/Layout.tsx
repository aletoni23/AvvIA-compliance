
import React from 'react';
import { Campaign } from '../types';
import { 
  Plus, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Bell, 
  Search, 
  LayoutDashboard,
  Circle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  campaignName?: string;
  campaigns: Campaign[];
  onNavigate: (view: string) => void;
  onSwitchCampaign: (id: string) => void;
  activeCampaignId?: string;
}

// Logo Component - Minimal Geometric "A" with acceleration upward
const AvvIALogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L26 24H21L16 14L11 24H6L16 4Z" fill="currentColor" />
    <path d="M16 11L19 17H13L16 11Z" fill="currentColor" opacity="0.8" />
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, campaignName, campaigns, onNavigate, onSwitchCampaign, activeCampaignId }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Solid for better contrast against ambient bg */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-xl shadow-slate-200/20">
        <div className="p-8">
          <div className="mb-12 flex items-center gap-3">
            <div className="text-emerald-950 transition-transform hover:scale-105 duration-300">
              <AvvIALogo />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 block leading-none">AvvIA</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Compliance Tech</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate('setup')}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all duration-200 mb-6 ${
                currentView === 'setup' 
                  ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-900/20' 
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-100 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Nuova Campagna</span>
            </button>
            
            <div className="pt-6 pb-2 px-4 flex items-center justify-between group">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Campagne</span>
              <div className="h-[1px] flex-grow ml-4 bg-slate-100"></div>
            </div>

            <div className="space-y-0.5 max-h-48 overflow-y-auto px-1 custom-scrollbar">
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSwitchCampaign(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-between group ${
                    activeCampaignId === c.id 
                      ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {activeCampaignId === c.id && <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />}
                </button>
              ))}
            </div>

            {campaignName && (
              <>
                <div className="pt-10 pb-2 px-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management</span>
                  <div className="h-[1px] flex-grow ml-4 bg-slate-100"></div>
                </div>
                <NavItem 
                  active={currentView === 'crm' || currentView === 'detail'} 
                  label="Pipeline" 
                  onClick={() => onNavigate('crm')}
                  icon={<Users className="w-4.5 h-4.5" />}
                />
                <NavItem 
                  active={currentView === 'overview'} 
                  label="Intelligence" 
                  onClick={() => onNavigate('overview')}
                  icon={<ShieldCheck className="w-4.5 h-4.5" />}
                />
              </>
            )}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-white font-bold text-[10px] group-hover:scale-110 transition-transform">
              HR
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-900 leading-none mb-1">Admin Account</p>
              <p className="text-[9px] text-emerald-700 font-black uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen relative">
        <header className="h-20 bg-white/95 backdrop-blur-md px-12 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            {campaignName ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                  <span className="font-black text-[9px] uppercase tracking-[0.15em]">Live</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200"></div>
                <span className="text-slate-900 font-black tracking-tight text-sm uppercase">{campaignName}</span>
              </div>
            ) : (
              <span className="text-slate-900 font-black tracking-tighter text-lg uppercase flex items-center gap-3">
                <AvvIALogo /> Infrastruttura AvvIA
              </span>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-slate-400 hover:text-slate-900 transition-all p-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-900 transition-all p-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200 ${
      active 
        ? 'bg-slate-900 text-white shadow-md border border-slate-800' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-emerald-400' : 'text-slate-400'}`}>{icon}</span>
    {label}
  </button>
);
