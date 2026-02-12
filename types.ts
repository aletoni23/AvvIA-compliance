
export enum CandidateStatus {
  TO_REVIEW = 'IN VERIFICA',
  PENDING_DOCS = 'IN ATTESA DOCUMENTO',
  INCOMPLETE_DOCS = 'IN ATTESA DOCUMENTO',
  VERIFYING = 'IN VERIFICA',
  READY_FOR_OFFER = 'PRONTO PER OFFERTA',
  OFFER_SENT = 'OFFERTA INVIATA',
  AWAITING_RESPONSE = 'IN ATTESA DOCUMENTO',
  MEDICAL_SCHEDULED = 'VISITA MEDICA PROGRAMMATA',
  CONTRACT_SIGNED = 'CONTRATTO FIRMATO',
  READY_TO_START = 'PRONTO PER INIZIO',
  BLOCKED = 'BLOCCATO',
  REJECTED = 'BLOCCATO'
}

export enum DocStatus {
  RECEIVED = 'Ricevuto',
  MISSING = 'Mancante',
  INVALID = 'Non valido',
  EXPIRED = 'Scaduto'
}

export interface Document {
  id: string;
  type: string;
  fileName: string;
  status: DocStatus;
  reason?: string;
  suspicious?: boolean; // Per gestire il caso del permesso sospetto
}

export interface ChatMessage {
  sender: 'agent' | 'candidate' | 'system';
  text: string;
  timestamp: string;
}

export interface Candidate {
  id: string;
  name: string;
  phone?: string;
  motherTongue: string;
  needsPermesso: boolean;
  role: string;
  campaignId: string;
  status: CandidateStatus;
  documents: Document[];
  whatsappActive: boolean;
  whatsappStatus: 'attivo' | 'richiesti' | 'ricevuti';
  offerSent: boolean;
  medicalVisitScheduled: boolean;
  contractSigned: boolean;
  dpiDelivered: boolean;
  safetyCoursesCompleted: boolean;
  auditLog: { timestamp: string; message: string }[];
  whatsappHistory: ChatMessage[];
  cvUrl?: string;
  needsPriorityReview?: boolean; // Flag per gestire lo smistamento in CRM
}

export interface CampaignRole {
  title: string;
  count: number;
  requiredDocs: string[];
}

export interface Campaign {
  id: string;
  name: string;
  productType: string;
  roles: CampaignRole[];
  period: string;
  location: string;
  createdAt: string;
  whatsappAgentActive: boolean;
}
