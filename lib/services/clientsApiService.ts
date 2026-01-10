/**
 * Service API pour la gestion des Clients
 * =========================================
 */

// ============================================
// TYPES
// ============================================

export type ClientStatus = 'prospect' | 'actif' | 'inactif' | 'premium' | 'litige';

export type ClientType = 'public' | 'prive' | 'mixte';

export interface Client {
  id: string;
  numero: string;
  nom: string;
  sigle?: string;
  type: ClientType;
  status: ClientStatus;
  secteur: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  responsable: string;
  chiffreAffaire: number;
  nombreProjets: number;
  dateCreation: string;
  dernierContact?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientsStats {
  total: number;
  actifs: number;
  prospects: number;
  premium: number;
  litiges: number;
  chiffreAffaireTotal: number;
  nombreProjetsTotal: number;
  parType: Array<{ type: ClientType; count: number }>;
  parSecteur: Array<{ secteur: string; count: number }>;
  ts: string;
}

export interface ClientFilters {
  status?: ClientStatus[];
  type?: ClientType[];
  secteur?: string;
  ville?: string;
  search?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockClients: Client[] = [
  {
    id: 'CLT-001',
    numero: 'CLT-2026-001',
    nom: 'Ministère des Infrastructures',
    sigle: 'MINF',
    type: 'public',
    status: 'premium',
    secteur: 'Administration publique',
    email: 'contact@minf.sn',
    telephone: '+221 33 821 XX XX',
    adresse: 'Avenue Léopold Sédar Senghor',
    ville: 'Dakar',
    pays: 'Sénégal',
    responsable: 'Amadou Ndiaye',
    chiffreAffaire: 8500000000,
    nombreProjets: 12,
    dateCreation: '2024-03-15',
    dernierContact: '2026-01-08',
    tags: ['stratégique', 'premium'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2026-01-08T14:20:00Z',
  },
  {
    id: 'CLT-002',
    numero: 'CLT-2025-045',
    nom: 'Société AFRICON',
    sigle: 'AFRICON',
    type: 'prive',
    status: 'actif',
    secteur: 'Promotion immobilière',
    email: 'info@africon.sn',
    telephone: '+221 77 XXX XX XX',
    adresse: 'VDN, Almadies',
    ville: 'Dakar',
    pays: 'Sénégal',
    responsable: 'Fatou Diallo',
    chiffreAffaire: 1200000000,
    nombreProjets: 3,
    dateCreation: '2025-06-20',
    dernierContact: '2026-01-05',
    tags: ['actif'],
    createdAt: '2025-06-20T08:30:00Z',
    updatedAt: '2026-01-05T11:45:00Z',
  },
];

// ============================================
// SERVICE
// ============================================

class ClientsApiService {
  private baseUrl = '/api/bmo/clients';

  async getStats(): Promise<ClientsStats> {
    await this.delay(300);

    return {
      total: 87,
      actifs: 54,
      prospects: 18,
      premium: 8,
      litiges: 7,
      chiffreAffaireTotal: 22500000000,
      nombreProjetsTotal: 142,
      parType: [
        { type: 'public', count: 32 },
        { type: 'prive', count: 48 },
        { type: 'mixte', count: 7 },
      ],
      parSecteur: [
        { secteur: 'Administration publique', count: 32 },
        { secteur: 'Promotion immobilière', count: 28 },
        { secteur: 'Industrie', count: 15 },
        { secteur: 'Commerce', count: 12 },
      ],
      ts: new Date().toISOString(),
    };
  }

  async getList(filters?: ClientFilters): Promise<Client[]> {
    await this.delay(400);
    return [...mockClients];
  }

  async getById(id: string): Promise<Client | null> {
    await this.delay(200);
    return mockClients.find((c) => c.id === id) || null;
  }

  async create(data: Partial<Client>): Promise<Client> {
    await this.delay(500);
    return {
      id: `CLT-${Date.now()}`,
      numero: `CLT-2026-${Math.floor(Math.random() * 1000)}`,
      nom: data.nom || '',
      type: data.type || 'prive',
      status: data.status || 'prospect',
      secteur: data.secteur || '',
      email: data.email || '',
      telephone: data.telephone || '',
      adresse: data.adresse || '',
      ville: data.ville || '',
      pays: data.pays || 'Sénégal',
      responsable: data.responsable || '',
      chiffreAffaire: 0,
      nombreProjets: 0,
      dateCreation: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  formatMontant(montant: number): string {
    if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(2)} Md`;
    if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M`;
    if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
    return montant.toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const clientsApiService = new ClientsApiService();

