// API Route: POST /api/validation-bc/search
// Recherche avancée avec filtres multiples et full-text search

import { NextRequest, NextResponse } from 'next/server';

interface SearchRequest {
  query?: string; // Texte libre
  filters?: {
    type?: string[]; // ['bc', 'facture', 'avenant']
    status?: string[]; // ['pending', 'validated', 'rejected', 'anomaly']
    bureau?: string[];
    fournisseur?: string;
    montantMin?: number;
    montantMax?: number;
    dateFrom?: string;
    dateTo?: string;
    urgent?: boolean;
    hasAnomalies?: boolean;
    projet?: string;
  };
  sort?: {
    field: 'dateEmission' | 'montantTTC' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

interface SearchResult {
  results: any[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    types: Record<string, number>;
    status: Record<string, number>;
    bureaux: Record<string, number>;
    montantRanges: { range: string; count: number }[];
  };
  executionTime: number; // ms
}

// Mock data
const mockDocuments = [
  {
    id: 'BC-2024-001',
    type: 'bc',
    status: 'pending',
    bureau: 'DRE',
    fournisseur: 'ENTREPRISE SENEGAL',
    objet: 'Travaux de rénovation bureau DRE',
    montantHT: 4166667,
    montantTTC: 5000000,
    tva: 20,
    projet: 'Rénovation bureaux',
    dateEmission: '2024-01-15',
    dateLimite: '2024-02-15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    urgent: false,
    anomalies: [],
    demandeur: {
      nom: 'Jean DUPONT',
      fonction: 'Chef de service',
      bureau: 'DRE',
    },
  },
  // ... autres documents
];

/**
 * Effectue une recherche full-text
 */
function performTextSearch(documents: any[], query: string): any[] {
  const q = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.id.toLowerCase().includes(q) ||
      doc.fournisseur.toLowerCase().includes(q) ||
      doc.objet.toLowerCase().includes(q) ||
      doc.demandeur.nom.toLowerCase().includes(q) ||
      (doc.projet && doc.projet.toLowerCase().includes(q))
  );
}

/**
 * Applique les filtres
 */
function applyFilters(documents: any[], filters: SearchRequest['filters']): any[] {
  let filtered = [...documents];

  if (filters?.type && filters.type.length > 0) {
    filtered = filtered.filter((doc) => filters.type!.includes(doc.type));
  }

  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter((doc) => filters.status!.includes(doc.status));
  }

  if (filters?.bureau && filters.bureau.length > 0) {
    filtered = filtered.filter((doc) => filters.bureau!.includes(doc.bureau));
  }

  if (filters?.fournisseur) {
    const f = filters.fournisseur.toLowerCase();
    filtered = filtered.filter((doc) => doc.fournisseur.toLowerCase().includes(f));
  }

  if (filters?.montantMin !== undefined) {
    filtered = filtered.filter((doc) => doc.montantTTC >= filters.montantMin!);
  }

  if (filters?.montantMax !== undefined) {
    filtered = filtered.filter((doc) => doc.montantTTC <= filters.montantMax!);
  }

  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    filtered = filtered.filter((doc) => new Date(doc.dateEmission) >= from);
  }

  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    filtered = filtered.filter((doc) => new Date(doc.dateEmission) <= to);
  }

  if (filters?.urgent !== undefined) {
    filtered = filtered.filter((doc) => doc.urgent === filters.urgent);
  }

  if (filters?.hasAnomalies !== undefined) {
    filtered = filtered.filter((doc) => 
      filters.hasAnomalies ? (doc.anomalies && doc.anomalies.length > 0) : (!doc.anomalies || doc.anomalies.length === 0)
    );
  }

  if (filters?.projet) {
    const p = filters.projet.toLowerCase();
    filtered = filtered.filter((doc) => doc.projet && doc.projet.toLowerCase().includes(p));
  }

  return filtered;
}

/**
 * Tri des résultats
 */
function sortResults(documents: any[], sort?: SearchRequest['sort']): any[] {
  if (!sort) return documents;

  const sorted = [...documents];
  sorted.sort((a, b) => {
    let aVal = a[sort.field];
    let bVal = b[sort.field];

    // Conversion dates
    if (sort.field.includes('date') || sort.field.includes('At')) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sort.order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return sorted;
}

/**
 * Calcule les facettes (agrégations)
 */
function calculateFacets(documents: any[]) {
  const types: Record<string, number> = {};
  const status: Record<string, number> = {};
  const bureaux: Record<string, number> = {};

  documents.forEach((doc) => {
    types[doc.type] = (types[doc.type] || 0) + 1;
    status[doc.status] = (status[doc.status] || 0) + 1;
    bureaux[doc.bureau] = (bureaux[doc.bureau] || 0) + 1;
  });

  // Tranches de montant
  const montantRanges = [
    { range: '< 1M', count: documents.filter((d) => d.montantTTC < 1000000).length },
    { range: '1M - 5M', count: documents.filter((d) => d.montantTTC >= 1000000 && d.montantTTC < 5000000).length },
    { range: '5M - 10M', count: documents.filter((d) => d.montantTTC >= 5000000 && d.montantTTC < 10000000).length },
    { range: '> 10M', count: documents.filter((d) => d.montantTTC >= 10000000).length },
  ];

  return { types, status, bureaux, montantRanges };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: SearchRequest = await request.json();
    const { query, filters, sort, pagination = { page: 1, limit: 20 } } = body;

    // 1. Recherche textuelle
    let results = query ? performTextSearch(mockDocuments, query) : [...mockDocuments];

    // 2. Filtres
    results = applyFilters(results, filters);

    // 3. Tri
    results = sortResults(results, sort);

    // 4. Facettes (sur tous les résultats avant pagination)
    const facets = calculateFacets(results);

    // 5. Pagination
    const total = results.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedResults = results.slice(startIndex, startIndex + pagination.limit);

    const executionTime = Date.now() - startTime;

    const response: SearchResult = {
      results: paginatedResults,
      total,
      page: pagination.page,
      totalPages,
      facets,
      executionTime,
    };

    console.log(`[validation-bc/search] Found ${total} results in ${executionTime}ms`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[validation-bc/search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

