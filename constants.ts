
import { Candidate, CandidateStatus, DocStatus, Campaign } from './types';

export const STANDARD_ROLES = [
  'Operaio di campo',
  'Operaio di linea',
  'Mulettista',
  'Tecnico di laboratorio',
  'Addetto magazzino'
];

export const OBBLIGATORIO_DOCS = [
  'Documento di identità', 
  'Certificato medico', 
  'Permesso di soggiorno (se necessario)'
];

export const ROLE_DEFAULT_DOCS: Record<string, string[]> = {
  'Operaio di campo': ['Documento di identità', 'Certificato medico', 'Permesso di soggiorno (se necessario)'],
  'Operaio di linea': ['Documento di identità', 'Certificato medico', 'Permesso di soggiorno (se necessario)'],
  'Mulettista': ['Documento di identità', 'Certificato medico', 'Patentino muletto', 'Permesso di soggiorno (se necessario)'],
  'Tecnico di laboratorio': ['Documento di identità', 'Certificato medico', 'Diploma tecnico / Laurea', 'Permesso di soggiorno (se necessario)'],
  'Addetto magazzino': ['Documento di identità', 'Certificato medico', 'Permesso di soggiorno (se necessario)']
};

export const EXTRA_DOCS_LIST = [
  'Patente muletto',
  'Certificazioni sicurezza',
  'Attestato HACCP',
  'Permesso di soggiorno',
  'Autocertificazione esperienza',
  'Altri documenti aziendali'
];

export const DEMO_CAMPAIGN: Campaign = {
  id: 'demo-1',
  name: 'Campagna Olive',
  productType: 'Olive (Olio)',
  roles: [
    { title: 'Operaio di campo', count: 12, requiredDocs: ROLE_DEFAULT_DOCS['Operaio di campo'] },
    { title: 'Operaio di linea', count: 5, requiredDocs: ROLE_DEFAULT_DOCS['Operaio di linea'] },
    { title: 'Mulettista', count: 2, requiredDocs: ROLE_DEFAULT_DOCS['Mulettista'] },
    { title: 'Tecnico di laboratorio', count: 1, requiredDocs: ROLE_DEFAULT_DOCS['Tecnico di laboratorio'] }
  ],
  period: 'Dal 2024-10-01 al 2024-12-31',
  location: 'Bitonto (BA)',
  createdAt: new Date().toISOString(),
  whatsappAgentActive: true
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Ahmed Hassan',
    phone: '+39 333 1234567',
    motherTongue: 'Arabo',
    needsPermesso: true,
    role: 'Mulettista',
    campaignId: 'demo-1',
    status: CandidateStatus.BLOCKED,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '09:12', message: 'Verifica permesso di soggiorno fallita: OCR rileva incongruenza font (sospetto contraffatto)' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Benvenuto Ahmed. Carica qui il tuo Documento ID e Permesso di soggiorno.', timestamp: '14:00' },
      { sender: 'candidate', text: 'Eccoli in allegato.', timestamp: '14:30' },
      { sender: 'agent', text: 'Il documento inviato (Permesso di soggiorno) presenta anomalie strutturali. Verifica in corso.', timestamp: '14:45' }
    ],
    documents: [
      { id: 'doc5', type: 'Documento di identità', fileName: 'passport_ahmed.pdf', status: DocStatus.RECEIVED },
      { id: 'doc6', type: 'Permesso di soggiorno (se necessario)', fileName: 'permesso_sospetto.jpg', status: DocStatus.INVALID, reason: 'Incongruenza dati OCR vs Formato Ministeriale', suspicious: true },
      { id: 'doc7', type: 'Patentino muletto', fileName: 'patente_m.pdf', status: DocStatus.RECEIVED },
      { id: 'doc8', type: 'Certificato medico', fileName: '', status: DocStatus.MISSING }
    ],
    cvUrl: 'hassan_cv.pdf'
  },
  {
    id: 'c2',
    name: 'Marco Rossi',
    phone: '+39 333 7654321',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.PENDING_DOCS,
    whatsappActive: true,
    whatsappStatus: 'richiesti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '10:45', message: 'Richiesto nuovo documento ID per scadenza rilevata dall\'AI' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La tua carta d’identità risulta scaduta il mese scorso. Puoi inviarne una aggiornata?', timestamp: '13:45' }
    ],
    documents: [
      { id: 'doc2', type: 'Documento di identità', fileName: 'id_vecchio.jpg', status: DocStatus.EXPIRED, reason: 'Scaduto il 15/02/2023' },
      { id: 'doc3', type: 'Certificato medico', fileName: '', status: DocStatus.MISSING }
    ],
    cvUrl: 'cv_marco.pdf'
  },
  {
    id: 'c3',
    name: 'Luca Ferrari',
    phone: '+39 338 1122334',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.READY_FOR_OFFER,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '08:00', message: 'Tutti i documenti essenziali validati automaticamente' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La documentazione è completa. A breve riceverai la proposta di assunzione.', timestamp: '11:00' }
    ],
    documents: [
      { id: 'doc8', type: 'Documento di identità', fileName: 'id_ferrari.png', status: DocStatus.RECEIVED },
      { id: 'doc9', type: 'Certificato medico', fileName: 'visita_medica_ok.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'cv_luca.pdf'
  },
  {
    id: 'c4',
    name: 'Elena Popescu',
    phone: '+40 721 123456',
    motherTongue: 'Rumeno',
    needsPermesso: true,
    role: 'Operaio di linea',
    campaignId: 'demo-1',
    status: CandidateStatus.VERIFYING,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '11:20', message: 'Documenti ricevuti, analisi AI in corso (estrazione anagrafica)' }],
    whatsappHistory: [
      { sender: 'candidate', text: 'Ho mandato tutto, va bene?', timestamp: '11:15' },
      { sender: 'agent', text: 'Ricevuto! Sto analizzando i file, ti aggiorno tra un momento.', timestamp: '11:16' }
    ],
    documents: [
      { id: 'doc11', type: 'Documento di identità', fileName: 'pasaport_ro.jpg', status: DocStatus.RECEIVED },
      { id: 'doc12', type: 'Certificato medico', fileName: 'certificat.pdf', status: DocStatus.RECEIVED },
      { id: 'doc12b', type: 'Permesso di soggiorno (se necessario)', fileName: 'permesso_elena.jpg', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'cv_elena.pdf'
  },
  {
    id: 'c5',
    name: 'Amir Ibrahim',
    phone: '+39 345 9988776',
    motherTongue: 'Arabo',
    needsPermesso: true,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.AWAITING_RESPONSE,
    whatsappActive: true,
    whatsappStatus: 'richiesti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '09:00', message: 'Messaggio di benvenuto e richiesta documenti inviato' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Ciao Amir, sono l\'assistente AvvIA. Per favore carica il tuo documento e il certificato medico.', timestamp: '09:00' }
    ],
    documents: [
      { id: 'doc13', type: 'Documento di identità', fileName: '', status: DocStatus.MISSING },
      { id: 'doc14', type: 'Certificato medico', fileName: '', status: DocStatus.MISSING },
      { id: 'doc14b', type: 'Permesso di soggiorno (se necessario)', fileName: '', status: DocStatus.MISSING }
    ],
    cvUrl: 'amir_cv.pdf'
  },
  {
    id: 'c6',
    name: 'Giovanni Neri',
    phone: '+39 320 1122334',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Mulettista',
    campaignId: 'demo-1',
    status: CandidateStatus.OFFER_SENT,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '15:30', message: 'Offerta economica inviata correttamente' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Ottime notizie! La documentazione è perfetta. Ecco la tua proposta di contratto. Clicca per firmare.', timestamp: '15:30' }
    ],
    documents: [
      { id: 'doc15', type: 'Documento di identità', fileName: 'id_neri.pdf', status: DocStatus.RECEIVED },
      { id: 'doc16', type: 'Certificato medico', fileName: 'medico.pdf', status: DocStatus.RECEIVED },
      { id: 'doc17', type: 'Patentino muletto', fileName: 'patente_muletto.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'neri_cv.pdf'
  },
  {
    id: 'c7',
    name: 'Yana Ivanova',
    phone: '+39 351 4455667',
    motherTongue: 'Russo',
    needsPermesso: true,
    role: 'Operaio di linea',
    campaignId: 'demo-1',
    status: CandidateStatus.CONTRACT_SIGNED,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: false,
    contractSigned: true,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '10:00', message: 'Firma digitale acquisita (DocuSign integration)' }],
    whatsappHistory: [
      { sender: 'candidate', text: 'Ho firmato tutto dal link.', timestamp: '09:55' },
      { sender: 'agent', text: 'Perfetto Yana! Contratto ricevuto. Ora dobbiamo fissare la visita medica.', timestamp: '10:00' }
    ],
    documents: [
      { id: 'doc18', type: 'Documento di identità', fileName: 'yana_id.jpg', status: DocStatus.RECEIVED },
      { id: 'doc19', type: 'Certificato medico', fileName: 'visita_precedente.pdf', status: DocStatus.RECEIVED },
      { id: 'doc19b', type: 'Permesso di soggiorno (se necessario)', fileName: 'permesso_yana.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'yana_cv.pdf'
  },
  {
    id: 'c8',
    name: 'Pietro Esposito',
    phone: '+39 339 5556677',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.MEDICAL_SCHEDULED,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: true,
    contractSigned: true,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '12:00', message: 'Visita medica fissata per il 25/10 presso sede Bitonto' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La tua visita medica è confermata per domani alle 09:00.', timestamp: '12:00' }
    ],
    documents: [
      { id: 'doc20', type: 'Documento di identità', fileName: 'id_pietro.pdf', status: DocStatus.RECEIVED },
      { id: 'doc21', type: 'Certificato medico', fileName: 'cert_anamnesi.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'esposito_cv.pdf'
  },
  {
    id: 'c9',
    name: 'Maria Conti',
    phone: '+39 340 7778899',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Tecnico di laboratorio',
    campaignId: 'demo-1',
    status: CandidateStatus.READY_TO_START,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: true,
    contractSigned: true,
    dpiDelivered: true,
    safetyCoursesCompleted: true,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '17:00', message: 'Checklist pre-inizio completata: DPI consegnati e corso sicurezza OK' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Tutto pronto Maria! Ti aspettiamo lunedì alle 08:30 in laboratorio.', timestamp: '17:05' }
    ],
    documents: [
      { id: 'doc22', type: 'Documento di identità', fileName: 'id_maria.png', status: DocStatus.RECEIVED },
      { id: 'doc23', type: 'Certificato medico', fileName: 'idoneita.pdf', status: DocStatus.RECEIVED },
      { id: 'doc24', type: 'Diploma tecnico / Laurea', fileName: 'laurea_agraria.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'maria_cv.pdf'
  },
  {
    id: 'c10',
    name: 'Sara Melis',
    phone: '+39 347 0001112',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Tecnico di laboratorio',
    campaignId: 'demo-1',
    status: CandidateStatus.TO_REVIEW,
    whatsappActive: false,
    whatsappStatus: 'attivo',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: true,
    auditLog: [{ timestamp: '10:00', message: 'Importato da ATS (Workday). Richiede approvazione manuale per avvio WhatsApp.' }],
    whatsappHistory: [],
    documents: [],
    cvUrl: 'cv_sara.pdf'
  },
  {
    id: 'c11',
    name: 'Olek Kuznetsov',
    phone: '+39 328 1112223',
    motherTongue: 'Russo',
    needsPermesso: true,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.PENDING_DOCS,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    needsPriorityReview: false,
    auditLog: [{ timestamp: '14:20', message: 'Certificato medico mancante nel set caricato' }],
    whatsappHistory: [
      { sender: 'candidate', text: 'Ho caricato il permesso, manca altro?', timestamp: '14:15' },
      { sender: 'agent', text: 'Sì, Olek. Manca il certificato medico per procedere.', timestamp: '14:20' }
    ],
    documents: [
      { id: 'doc25', type: 'Documento di identità', fileName: 'olek_id.jpg', status: DocStatus.RECEIVED },
      { id: 'doc26', type: 'Certificato medico', fileName: '', status: DocStatus.MISSING },
      { id: 'doc27', type: 'Permesso di soggiorno (se necessario)', fileName: 'permesso_valido.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'olek_cv.pdf'
  }
];
