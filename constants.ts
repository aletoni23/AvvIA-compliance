
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
    role: 'Operaio di linea',
    campaignId: 'demo-1',
    status: CandidateStatus.BLOCKED,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    auditLog: [{ timestamp: '09:12', message: 'Verifica permesso di soggiorno fallita: QR Code contraffatto' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Benvenuto Ahmed. Carica qui il tuo Documento ID e Permesso di soggiorno.', timestamp: '14:00' },
      { sender: 'candidate', text: 'Eccoli in allegato.', timestamp: '14:30' },
      { sender: 'agent', text: 'Il documento inviato (Permesso di soggiorno) non risulta valido. Non possiamo procedere.', timestamp: '14:45' }
    ],
    documents: [
      { id: 'doc5', type: 'Documento di identità', fileName: 'passport.pdf', status: DocStatus.RECEIVED },
      { id: 'doc6', type: 'Permesso di soggiorno', fileName: 'permesso_irregolare.jpg', status: DocStatus.INVALID, reason: 'QR Code non leggibile o contraffatto' }
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
    auditLog: [{ timestamp: '10:45', message: 'Richiesto nuovo documento ID per scadenza rilevata' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La tua carta d’identità risulta scaduta. Puoi inviarne una aggiornata?', timestamp: '13:45' }
    ],
    documents: [
      { id: 'doc2', type: 'Carta d’identità', fileName: 'id_scaduto.jpg', status: DocStatus.EXPIRED, reason: 'Scaduto il 15/02/2023' },
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
    auditLog: [{ timestamp: '08:00', message: 'Tutti i documenti validati' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La documentazione è completa. A breve riceverai la proposta di assunzione.', timestamp: '11:00' }
    ],
    documents: [
      { id: 'doc8', type: 'Documento di identità', fileName: 'id_luca.png', status: DocStatus.RECEIVED },
      { id: 'doc9', type: 'Certificato medico', fileName: 'visita.pdf', status: DocStatus.RECEIVED }
    ],
    cvUrl: 'cv_luca.pdf'
  },
  {
    id: 'c4',
    name: 'Elena Popescu',
    phone: '+39 334 5566778',
    motherTongue: 'Rumeno',
    needsPermesso: false,
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
    auditLog: [{ timestamp: '15:20', message: 'Contratto firmato digitalmente via WhatsApp' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Ecco il contratto. Firma cliccando sul link.', timestamp: '14:00' },
      { sender: 'candidate', text: 'Fatto!', timestamp: '15:20' }
    ],
    documents: [
      { id: 'd10', type: 'Documento ID', fileName: 'elena_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd11', type: 'Certificato medico', fileName: 'medico_elena.pdf', status: DocStatus.RECEIVED }
    ]
  },
  {
    id: 'c5',
    name: 'Driss El Amrani',
    phone: '+39 331 9988776',
    motherTongue: 'Arabo',
    needsPermesso: true,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.VERIFYING,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    auditLog: [{ timestamp: '10:00', message: 'Rilevato Permesso di Soggiorno con anomalie grafiche (Sospetto)' }],
    whatsappHistory: [
      { sender: 'candidate', text: 'Ecco il mio permesso di soggiorno.', timestamp: '09:30' }
    ],
    documents: [
      { id: 'd12', type: 'Documento ID', fileName: 'driss_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd13', type: 'Permesso di soggiorno', fileName: 'permesso_sospetto.jpg', status: DocStatus.INVALID, reason: 'Anomalie grafiche rilevate dai sistemi di sicurezza', suspicious: true }
    ]
  },
  {
    id: 'c6',
    name: 'Maria Ionescu',
    phone: '+39 339 4433221',
    motherTongue: 'Rumeno',
    needsPermesso: false,
    role: 'Addetto magazzino',
    campaignId: 'demo-1',
    status: CandidateStatus.OFFER_SENT,
    whatsappActive: true,
    whatsappStatus: 'attivo',
    offerSent: true,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    auditLog: [{ timestamp: '09:00', message: 'Offerta economica inviata. In attesa di accettazione.' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Ti abbiamo inviato l\'offerta. Facci sapere se accetti.', timestamp: '09:00' }
    ],
    documents: [
      { id: 'd14', type: 'Documento ID', fileName: 'maria_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd15', type: 'Certificato medico', fileName: 'maria_med.pdf', status: DocStatus.RECEIVED }
    ]
  },
  {
    id: 'c7',
    name: 'Giovanni Gialli',
    phone: '+39 340 5556667',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Mulettista',
    campaignId: 'demo-1',
    status: CandidateStatus.MEDICAL_SCHEDULED,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: true,
    contractSigned: true,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    auditLog: [{ timestamp: '11:00', message: 'Visita medica fissata per il 25/10 ore 09:00' }],
    whatsappHistory: [
      { sender: 'agent', text: 'La tua visita medica è fissata per il 25/10 ore 09:00 presso la sede.', timestamp: '11:00' }
    ],
    documents: [
      { id: 'd16', type: 'Patentino muletto', fileName: 'patente.pdf', status: DocStatus.RECEIVED },
      { id: 'd17', type: 'Documento ID', fileName: 'giovanni_id.pdf', status: DocStatus.RECEIVED }
    ]
  },
  {
    id: 'c8',
    name: 'Paolo Verdi',
    phone: '+39 345 1112223',
    motherTongue: 'Italiano',
    needsPermesso: false,
    role: 'Operaio di campo',
    campaignId: 'demo-1',
    status: CandidateStatus.READY_TO_START,
    whatsappActive: true,
    whatsappStatus: 'ricevuti',
    offerSent: true,
    medicalVisitScheduled: true,
    contractSigned: true,
    dpiDelivered: true,
    safetyCoursesCompleted: true,
    auditLog: [{ timestamp: '17:00', message: 'Consegna DPI effettuata e corsi sicurezza completati. Candidato pronto.' }],
    whatsappHistory: [
      { sender: 'agent', text: `Sei pronto per iniziare! Ti aspettiamo lunedì alle 07:00.`, timestamp: '17:30' }
    ],
    documents: [
      { id: 'd18', type: 'Documento ID', fileName: 'paolo_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd19', type: 'Certificato medico', fileName: 'paolo_med.pdf', status: DocStatus.RECEIVED }
    ]
  },
  {
    id: 'c9',
    name: 'Ivan Petrov',
    phone: '+39 320 4445556',
    motherTongue: 'Russo',
    needsPermesso: true,
    role: 'Operaio di linea',
    campaignId: 'demo-1',
    status: CandidateStatus.AWAITING_RESPONSE,
    whatsappActive: true,
    whatsappStatus: 'richiesti',
    offerSent: false,
    medicalVisitScheduled: false,
    contractSigned: false,
    dpiDelivered: false,
    safetyCoursesCompleted: false,
    auditLog: [{ timestamp: 'ieri', message: 'Nessuna risposta da WhatsApp per 48h. Stato di allerta attivato.' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Ivan, ci sei? Abbiamo bisogno dei tuoi documenti per procedere.', timestamp: '48h fa' }
    ],
    documents: [
      { id: 'd20', type: 'Documento ID', fileName: '', status: DocStatus.MISSING },
      { id: 'd21', type: 'Permesso di soggiorno', fileName: '', status: DocStatus.MISSING }
    ]
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
    auditLog: [{ timestamp: '10:00', message: 'Importato da ATS (Workday)' }],
    whatsappHistory: [],
    documents: [],
    cvUrl: 'cv_sara.pdf'
  },
  {
    id: 'c11',
    name: 'Roberto Bianchi',
    phone: '+39 342 9998887',
    motherTongue: 'Italiano',
    needsPermesso: false,
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
    auditLog: [{ timestamp: '12:00', message: 'Documenti ricevuti, analisi automatica in corso.' }],
    whatsappHistory: [
      { sender: 'candidate', text: 'Ecco tutto.', timestamp: '11:55' }
    ],
    documents: [
      { id: 'd22', type: 'Documento ID', fileName: 'rob_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd23', type: 'Certificato medico', fileName: 'rob_med.pdf', status: DocStatus.RECEIVED }
    ]
  },
  {
    id: 'c12',
    name: 'Fatima Zahra',
    phone: '+39 334 1122330',
    motherTongue: 'Arabo',
    needsPermesso: true,
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
    auditLog: [{ timestamp: 'ieri', message: 'Manca certificato medico.' }],
    whatsappHistory: [
      { sender: 'agent', text: 'Fatima, invia il certificato medico per favore.', timestamp: 'ieri' }
    ],
    documents: [
      { id: 'd24', type: 'Documento ID', fileName: 'fatima_id.pdf', status: DocStatus.RECEIVED },
      { id: 'd25', type: 'Certificato medico', fileName: '', status: DocStatus.MISSING },
      { id: 'd26', type: 'Permesso di soggiorno', fileName: 'fatima_ps.pdf', status: DocStatus.RECEIVED }
    ]
  }
];
