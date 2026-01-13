import { NextRequest, NextResponse } from 'next/server';

export interface SearchResult {
  id: string;
  type: 'demande' | 'agent' | 'document' | 'workflow' | 'delegation' | 'template';
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  statusColor?: string;
  icon?: string;
  relevanceScore: number;
  highlights: {
    field: string;
    text: string;
    matchedText: string;
  }[];
  metadata: Record<string, unknown>;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'command';
  category?: string;
  count?: number;
}

// Données simulées pour la recherche
const searchableData = {
  demandes: [
    {
      id: 'RH-2026-001',
      type: 'demande',
      agentName: 'Ahmed Kaci',
      agentMatricule: 'MAT-001',
      demandeType: 'congé annuel',
      status: 'en_attente',
      dateDebut: '2026-01-15',
      dateFin: '2026-01-20',
      description: 'Congé annuel pour raisons familiales',
      montant: null,
      createdAt: '2026-01-09T00:00:00Z',
    },
    {
      id: 'RH-2026-002',
      type: 'demande',
      agentName: 'Farid Benali',
      agentMatricule: 'MAT-002',
      demandeType: 'remboursement frais',
      status: 'validé',
      montant: 15000,
      description: 'Frais de déplacement mission Constantine',
      createdAt: '2026-01-08T00:00:00Z',
    },
    {
      id: 'RH-2026-003',
      type: 'demande',
      agentName: 'Sara Hadji',
      agentMatricule: 'MAT-003',
      demandeType: 'congé maladie',
      status: 'validé',
      dateDebut: '2026-01-05',
      dateFin: '2026-01-07',
      description: 'Arrêt maladie avec certificat médical',
      createdAt: '2026-01-05T00:00:00Z',
    },
  ],
  agents: [
    {
      id: 'AGT-001',
      type: 'agent',
      name: 'Ahmed Kaci',
      matricule: 'MAT-001',
      email: 'ahmed.kaci@example.com',
      bureau: 'Bureau A',
      poste: 'Ingénieur',
      status: 'actif',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'AGT-002',
      type: 'agent',
      name: 'Farid Benali',
      matricule: 'MAT-002',
      email: 'farid.benali@example.com',
      bureau: 'Bureau B',
      poste: 'Chef de projet',
      status: 'actif',
      createdAt: '2024-02-15T00:00:00Z',
    },
    {
      id: 'AGT-003',
      type: 'agent',
      name: 'Sara Hadji',
      matricule: 'MAT-003',
      email: 'sara.hadji@example.com',
      bureau: 'Bureau A',
      poste: 'Analyste',
      status: 'actif',
      createdAt: '2024-03-20T00:00:00Z',
    },
  ],
  documents: [
    {
      id: 'DOC-001',
      type: 'document',
      name: 'certificat_medical.pdf',
      demandeId: 'RH-2026-001',
      agentName: 'Ahmed Kaci',
      documentType: 'certificat',
      content: 'Certificat médical du Dr. Mohamed Benali',
      createdAt: '2026-01-09T14:00:00Z',
    },
    {
      id: 'DOC-002',
      type: 'document',
      name: 'facture_hotel.pdf',
      demandeId: 'RH-2026-002',
      agentName: 'Farid Benali',
      documentType: 'facture',
      content: 'Facture Hotel El Mountazah Constantine',
      createdAt: '2026-01-10T09:00:00Z',
    },
  ],
  workflows: [
    {
      id: 'WF-001',
      type: 'workflow',
      name: 'Validation congés standard',
      description: 'Workflow automatique pour les demandes de congés',
      triggerType: 'demande_congé',
      status: 'actif',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  delegations: [
    {
      id: 'DEL-001',
      type: 'delegation',
      delegator: 'Thomas Dubois',
      delegatee: 'Sarah Martin',
      permissions: ['validation_congés', 'validation_dépenses'],
      status: 'active',
      dateDebut: '2026-01-01',
      dateFin: '2026-01-31',
      createdAt: '2025-12-20T00:00:00Z',
    },
  ],
  templates: [
    {
      id: 'TPL-001',
      type: 'template',
      name: 'Validation congés standard',
      category: 'validation',
      description: 'Réponse standard pour validation de congés',
      createdAt: '2025-06-01T00:00:00Z',
    },
  ],
};

// Fonction de recherche avec scoring de pertinence
function searchWithRelevance(
  query: string,
  types: string[],
  filters: Record<string, string>
): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1);

  // Recherche dans les demandes
  if (types.includes('all') || types.includes('demande')) {
    searchableData.demandes.forEach((demande) => {
      let score = 0;
      const highlights: SearchResult['highlights'] = [];

      // Recherche dans l'ID
      if (demande.id.toLowerCase().includes(queryLower)) {
        score += 100;
        highlights.push({
          field: 'id',
          text: demande.id,
          matchedText: query,
        });
      }

      // Recherche dans le nom de l'agent
      if (demande.agentName.toLowerCase().includes(queryLower)) {
        score += 80;
        highlights.push({
          field: 'agentName',
          text: demande.agentName,
          matchedText: query,
        });
      }

      // Recherche dans le type
      if (demande.demandeType.toLowerCase().includes(queryLower)) {
        score += 70;
        highlights.push({
          field: 'type',
          text: demande.demandeType,
          matchedText: query,
        });
      }

      // Recherche dans la description
      queryWords.forEach((word) => {
        if (demande.description?.toLowerCase().includes(word)) {
          score += 20;
          highlights.push({
            field: 'description',
            text: demande.description,
            matchedText: word,
          });
        }
      });

      // Appliquer les filtres
      if (filters.status && demande.status !== filters.status) return;
      if (filters.type && demande.demandeType !== filters.type) return;

      if (score > 0) {
        results.push({
          id: demande.id,
          type: 'demande',
          title: `${demande.demandeType} - ${demande.agentName}`,
          subtitle: demande.id,
          description: demande.description,
          status: demande.status,
          statusColor: demande.status === 'validé' ? 'green' : demande.status === 'en_attente' ? 'yellow' : 'gray',
          icon: 'FileText',
          relevanceScore: score,
          highlights,
          metadata: {
            agentMatricule: demande.agentMatricule,
            montant: demande.montant,
            dateDebut: demande.dateDebut,
            dateFin: demande.dateFin,
          },
          url: `/maitre-ouvrage/demandes-rh?id=${demande.id}`,
          createdAt: demande.createdAt,
          updatedAt: demande.createdAt,
        });
      }
    });
  }

  // Recherche dans les agents
  if (types.includes('all') || types.includes('agent')) {
    searchableData.agents.forEach((agent) => {
      let score = 0;
      const highlights: SearchResult['highlights'] = [];

      if (agent.name.toLowerCase().includes(queryLower)) {
        score += 90;
        highlights.push({ field: 'name', text: agent.name, matchedText: query });
      }
      if (agent.matricule.toLowerCase().includes(queryLower)) {
        score += 100;
        highlights.push({ field: 'matricule', text: agent.matricule, matchedText: query });
      }
      if (agent.email.toLowerCase().includes(queryLower)) {
        score += 70;
        highlights.push({ field: 'email', text: agent.email, matchedText: query });
      }
      if (agent.bureau.toLowerCase().includes(queryLower)) {
        score += 40;
        highlights.push({ field: 'bureau', text: agent.bureau, matchedText: query });
      }

      if (filters.bureau && agent.bureau !== filters.bureau) return;
      if (filters.status && agent.status !== filters.status) return;

      if (score > 0) {
        results.push({
          id: agent.id,
          type: 'agent',
          title: agent.name,
          subtitle: agent.matricule,
          description: `${agent.poste} - ${agent.bureau}`,
          status: agent.status,
          statusColor: agent.status === 'actif' ? 'green' : 'gray',
          icon: 'User',
          relevanceScore: score,
          highlights,
          metadata: {
            email: agent.email,
            poste: agent.poste,
          },
          url: `/maitre-ouvrage/agents?id=${agent.id}`,
          createdAt: agent.createdAt,
          updatedAt: agent.createdAt,
        });
      }
    });
  }

  // Recherche dans les documents
  if (types.includes('all') || types.includes('document')) {
    searchableData.documents.forEach((doc) => {
      let score = 0;
      const highlights: SearchResult['highlights'] = [];

      if (doc.name.toLowerCase().includes(queryLower)) {
        score += 80;
        highlights.push({ field: 'name', text: doc.name, matchedText: query });
      }
      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 60;
        highlights.push({ field: 'content', text: doc.content, matchedText: query });
      }
      if (doc.agentName.toLowerCase().includes(queryLower)) {
        score += 50;
        highlights.push({ field: 'agentName', text: doc.agentName, matchedText: query });
      }

      if (score > 0) {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.name,
          subtitle: `Demande ${doc.demandeId}`,
          description: `Document de ${doc.agentName}`,
          icon: 'File',
          relevanceScore: score,
          highlights,
          metadata: {
            demandeId: doc.demandeId,
            documentType: doc.documentType,
          },
          createdAt: doc.createdAt,
          updatedAt: doc.createdAt,
        });
      }
    });
  }

  // Trier par score de pertinence
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

// GET /api/rh/search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const typesParam = searchParams.get('types') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filtres additionnels
    const filters: Record<string, string> = {};
    ['status', 'type', 'bureau', 'category'].forEach((key) => {
      const value = searchParams.get(key);
      if (value) filters[key] = value;
    });

    // Pas de recherche vide
    if (!query.trim()) {
      return NextResponse.json({
        data: [],
        suggestions: getSuggestions(''),
        total: 0,
        success: true,
      });
    }

    const types = typesParam.split(',');
    const results = searchWithRelevance(query, types, filters);

    // Pagination
    const paginated = results.slice(offset, offset + limit);

    // Générer les suggestions
    const suggestions = getSuggestions(query);

    // Statistiques de résultats par type
    const resultsByType = {
      demande: results.filter((r) => r.type === 'demande').length,
      agent: results.filter((r) => r.type === 'agent').length,
      document: results.filter((r) => r.type === 'document').length,
      workflow: results.filter((r) => r.type === 'workflow').length,
      delegation: results.filter((r) => r.type === 'delegation').length,
      template: results.filter((r) => r.type === 'template').length,
    };

    return NextResponse.json({
      data: paginated,
      suggestions,
      total: results.length,
      resultsByType,
      hasMore: offset + limit < results.length,
      query,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/search:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// Fonction pour générer des suggestions
function getSuggestions(query: string): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase();

  // Suggestions de filtres
  const filterSuggestions = [
    { text: 'type:congé', type: 'filter', category: 'Type de demande' },
    { text: 'type:maladie', type: 'filter', category: 'Type de demande' },
    { text: 'type:remboursement', type: 'filter', category: 'Type de demande' },
    { text: 'status:en_attente', type: 'filter', category: 'Statut' },
    { text: 'status:validé', type: 'filter', category: 'Statut' },
    { text: 'status:refusé', type: 'filter', category: 'Statut' },
    { text: 'bureau:A', type: 'filter', category: 'Bureau' },
    { text: 'bureau:B', type: 'filter', category: 'Bureau' },
  ];

  // Suggestions de commandes
  const commandSuggestions = [
    { text: '/créer congé', type: 'command', category: 'Actions' },
    { text: '/exporter', type: 'command', category: 'Actions' },
    { text: '/statistiques', type: 'command', category: 'Actions' },
    { text: '/aide', type: 'command', category: 'Actions' },
  ];

  // Suggestions de requêtes récentes (simulées)
  const recentQueries = [
    { text: 'congé janvier', type: 'query', count: 15 },
    { text: 'Ahmed Kaci', type: 'query', count: 8 },
    { text: 'remboursement mission', type: 'query', count: 5 },
  ];

  // Filtrer selon la requête
  if (query.startsWith('/')) {
    return commandSuggestions.filter((s) =>
      s.text.toLowerCase().includes(queryLower)
    ) as SearchSuggestion[];
  }

  if (query.includes(':')) {
    return filterSuggestions.filter((s) =>
      s.text.toLowerCase().includes(queryLower)
    ) as SearchSuggestion[];
  }

  // Suggestions mixtes
  const matchingQueries = recentQueries.filter((s) =>
    s.text.toLowerCase().includes(queryLower)
  );
  const matchingFilters = filterSuggestions
    .filter((s) => s.text.toLowerCase().includes(queryLower))
    .slice(0, 3);

  return [...matchingQueries, ...matchingFilters].slice(0, 6) as SearchSuggestion[];
}

// POST /api/rh/search - Recherche avancée avec body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query = '',
      types = ['all'],
      filters = {},
      sort = 'relevance',
      limit = 20,
      offset = 0,
    } = body;

    if (!query.trim()) {
      return NextResponse.json({
        data: [],
        total: 0,
        success: true,
      });
    }

    let results = searchWithRelevance(query, types, filters);

    // Tri
    if (sort === 'date') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'alphabetical') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }
    // Par défaut: relevance (déjà trié)

    // Pagination
    const paginated = results.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginated,
      total: results.length,
      hasMore: offset + limit < results.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur POST /api/rh/search:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

