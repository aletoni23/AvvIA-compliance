
import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CampaignSetup } from './views/CampaignSetup';
import { CampaignCRM } from './views/CampaignCRM';
import { CandidateDetail } from './views/CandidateDetail';
import { CampaignOverview } from './views/CampaignOverview';
import { DocsOverview } from './views/DocsOverview';
import { ContactSource } from './views/ContactSource';
import { ATSConnect } from './views/ATSConnect';
import { ManualUpload } from './views/ManualUpload';
import { ContactRecap } from './views/ContactRecap';
import { Campaign, Candidate, CandidateStatus } from './types';
import { INITIAL_CANDIDATES, DEMO_CAMPAIGN } from './constants';

type View = 'setup' | 'docs_overview' | 'contacts_source' | 'ats_connect' | 'manual_upload' | 'recap' | 'crm' | 'detail' | 'overview';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('setup');
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([DEMO_CAMPAIGN]);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [importedTemp, setImportedTemp] = useState<Candidate[]>([]);

  const handleCampaignCreate = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
    setActiveCampaign(campaign);
    setCurrentView('docs_overview');
  };

  const handleImport = (newCandidates: Candidate[]) => {
    setImportedTemp(newCandidates);
    setCurrentView('recap');
  };

  const handleActivateWhatsApp = (finalCandidates: Candidate[]) => {
    if (!activeCampaign) return;
    const updatedCampaign = { ...activeCampaign, whatsappAgentActive: true };
    setActiveCampaign(updatedCampaign);
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    setCandidates(prev => [...prev, ...finalCandidates]);
    setImportedTemp([]);
    setCurrentView('crm');
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setCurrentView('detail');
  };

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleSwitchCampaign = (id: string) => {
    const c = campaigns.find(x => x.id === id);
    if (c) {
      setActiveCampaign(c);
      setCurrentView('crm');
    }
  };

  const selectedCandidate = useMemo(() => candidates.find(c => c.id === selectedCandidateId) || null, [candidates, selectedCandidateId]);
  const activeCandidates = useMemo(() => candidates.filter(c => c.campaignId === activeCampaign?.id), [candidates, activeCampaign]);

  const renderContent = () => {
    switch (currentView) {
      case 'setup': return <CampaignSetup onSave={handleCampaignCreate} />;
      case 'docs_overview': return activeCampaign ? <DocsOverview campaign={activeCampaign} onContinue={() => setCurrentView('contacts_source')} onBack={() => setCurrentView('setup')} /> : null;
      case 'contacts_source': return <ContactSource onSelect={(source) => setCurrentView(source === 'ats' ? 'ats_connect' : 'manual_upload')} onBack={() => setCurrentView('docs_overview')} />;
      case 'ats_connect': return activeCampaign ? <ATSConnect campaign={activeCampaign} onImport={handleImport} onBack={() => setCurrentView('contacts_source')} /> : null;
      case 'manual_upload': return activeCampaign ? <ManualUpload campaign={activeCampaign} onImport={handleImport} onBack={() => setCurrentView('contacts_source')} /> : null;
      case 'recap': return activeCampaign ? <ContactRecap campaign={activeCampaign} candidates={importedTemp} onActivate={handleActivateWhatsApp} onBack={() => setCurrentView('contacts_source')} /> : null;
      case 'crm': return activeCampaign ? <CampaignCRM campaign={activeCampaign} candidates={activeCandidates} onSelectCandidate={handleSelectCandidate} onViewOverview={() => setCurrentView('overview')} onUpdateCandidate={handleUpdateCandidate} onNavigateToSetup={() => setCurrentView('setup')} /> : null;
      case 'detail': return selectedCandidate && activeCampaign ? <CandidateDetail candidate={selectedCandidate} campaign={activeCampaign} onBack={() => setCurrentView('crm')} onUpdate={handleUpdateCandidate} /> : null;
      case 'overview': return activeCampaign ? <CampaignOverview campaign={activeCampaign} candidates={activeCandidates} onBack={() => setCurrentView('crm')} /> : null;
      default: return <CampaignSetup onSave={handleCampaignCreate} />;
    }
  };

  return (
    <Layout currentView={currentView} campaignName={activeCampaign?.name} campaigns={campaigns} onNavigate={(v) => setCurrentView(v as View)} onSwitchCampaign={handleSwitchCampaign} activeCampaignId={activeCampaign?.id}>
      {renderContent()}
    </Layout>
  );
}
