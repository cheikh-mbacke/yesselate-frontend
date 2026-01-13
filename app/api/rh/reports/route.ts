import { NextRequest, NextResponse } from 'next/server';

export interface RHReport {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'custom' | 'scheduled';
  category: 'global' | 'congés' | 'dépenses' | 'effectifs' | 'performance' | 'budget';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: {
    dateRange?: {
      start: string;
      end: string;
    };
    bureaux?: string[];
    types?: string[];
    status?: string[];
    groupBy?: string;
    includeCharts?: boolean;
    includeDetails?: boolean;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
    isActive: boolean;
    lastRun?: string;
    nextRun?: string;
  };
  generatedReports?: Array<{
    id: string;
    generatedAt: string;
    fileUrl: string;
    fileSize: number;
    status: 'completed' | 'failed' | 'processing';
    duration: number;
  }>;
  createdBy: {
    id: string;
    name: string;
  };
  isPublic: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let reports: RHReport[] = [
  {
    id: 'RPT-001',
    name: 'Bilan mensuel des congés',
    description: 'Rapport détaillé des congés pris et restants par bureau',
    type: 'scheduled',
    category: 'congés',
    format: 'pdf',
    parameters: {
      dateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
      groupBy: 'bureau',
      includeCharts: true,
      includeDetails: true,
    },
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '08:00',
      recipients: ['sarah.martin@example.com', 'direction@example.com'],
      isActive: true,
      lastRun: '2026-01-01T08:00:00Z',
      nextRun: '2026-02-01T08:00:00Z',
    },
    generatedReports: [
      {
        id: 'GEN-001',
        generatedAt: '2026-01-01T08:00:00Z',
        fileUrl: '/reports/bilan-conges-janvier-2026.pdf',
        fileSize: 245780,
        status: 'completed',
        duration: 4500,
      },
    ],
    createdBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    isPublic: true,
    usageCount: 12,
    lastUsedAt: '2026-01-10T09:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'RPT-002',
    name: 'Suivi des dépenses par catégorie',
    description: 'Analyse des dépenses RH ventilées par type et bureau',
    type: 'standard',
    category: 'dépenses',
    format: 'excel',
    parameters: {
      groupBy: 'type',
      includeCharts: true,
    },
    createdBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    isPublic: true,
    usageCount: 8,
    lastUsedAt: '2026-01-09T14:00:00Z',
    createdAt: '2025-07-15T00:00:00Z',
    updatedAt: '2026-01-09T14:00:00Z',
  },
  {
    id: 'RPT-003',
    name: 'Tableau de bord effectifs',
    description: 'Vue d\'ensemble des effectifs, absences et disponibilités',
    type: 'standard',
    category: 'effectifs',
    format: 'pdf',
    parameters: {
      includeCharts: true,
      includeDetails: false,
    },
    createdBy: {
      id: 'USR-002',
      name: 'Thomas Dubois',
    },
    isPublic: false,
    usageCount: 5,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-12-15T00:00:00Z',
  },
  {
    id: 'RPT-004',
    name: 'Rapport hebdomadaire d\'activité',
    description: 'Synthèse des demandes traitées et en attente',
    type: 'scheduled',
    category: 'global',
    format: 'pdf',
    parameters: {
      includeCharts: true,
      status: ['validé', 'rejeté', 'en_attente'],
    },
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1, // Lundi
      time: '09:00',
      recipients: ['equipe-rh@example.com'],
      isActive: true,
      lastRun: '2026-01-06T09:00:00Z',
      nextRun: '2026-01-13T09:00:00Z',
    },
    generatedReports: [
      {
        id: 'GEN-002',
        generatedAt: '2026-01-06T09:00:00Z',
        fileUrl: '/reports/activite-semaine-1-2026.pdf',
        fileSize: 125400,
        status: 'completed',
        duration: 2300,
      },
    ],
    createdBy: {
      id: 'SYS',
      name: 'Système',
    },
    isPublic: true,
    usageCount: 20,
    lastUsedAt: '2026-01-10T10:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
];

// GET /api/rh/reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const createdById = searchParams.get('createdById');
    const scheduled = searchParams.get('scheduled');

    let filtered = [...reports];

    if (id) {
      const report = filtered.find((r) => r.id === id);
      if (!report) {
        return NextResponse.json(
          { error: 'Rapport non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: report, success: true });
    }

    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }
    if (category) {
      filtered = filtered.filter((r) => r.category === category);
    }
    if (isPublic !== null) {
      const pub = isPublic === 'true';
      filtered = filtered.filter((r) => r.isPublic === pub);
    }
    if (createdById) {
      filtered = filtered.filter((r) => r.createdBy.id === createdById);
    }
    if (scheduled === 'true') {
      filtered = filtered.filter((r) => r.type === 'scheduled' && r.schedule?.isActive);
    }

    // Trier par usage
    filtered.sort((a, b) => b.usageCount - a.usageCount);

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/reports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/reports - Créer ou générer un rapport
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Générer un rapport existant
    if (action === 'generate') {
      const { reportId, parameters } = body;
      
      const report = reports.find((r) => r.id === reportId);
      if (!report) {
        return NextResponse.json(
          { error: 'Rapport non trouvé', success: false },
          { status: 404 }
        );
      }

      // Simuler la génération
      const generatedReport = {
        id: `GEN-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        fileUrl: `/reports/${report.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${report.format}`,
        fileSize: Math.floor(Math.random() * 500000) + 50000,
        status: 'completed' as const,
        duration: Math.floor(Math.random() * 5000) + 1000,
      };

      // Ajouter au rapport
      const index = reports.findIndex((r) => r.id === reportId);
      if (!reports[index].generatedReports) {
        reports[index].generatedReports = [];
      }
      reports[index].generatedReports!.push(generatedReport);
      reports[index].usageCount += 1;
      reports[index].lastUsedAt = new Date().toISOString();
      reports[index].updatedAt = new Date().toISOString();

      return NextResponse.json({
        data: generatedReport,
        message: 'Rapport généré avec succès',
        success: true,
      });
    }

    // Créer un nouveau rapport
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newReport: RHReport = {
      id: `RPT-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      type: body.type || 'custom',
      category: body.category,
      format: body.format || 'pdf',
      parameters: body.parameters || {},
      schedule: body.schedule,
      createdBy: body.createdBy || { id: 'unknown', name: 'Unknown' },
      isPublic: body.isPublic !== false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.push(newReport);

    return NextResponse.json(
      {
        data: newReport,
        message: 'Rapport créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/reports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/reports - Mettre à jour un rapport
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du rapport requis', success: false },
        { status: 400 }
      );
    }

    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Rapport non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action: Toggle schedule
    if (action === 'toggle_schedule') {
      if (reports[index].schedule) {
        reports[index].schedule!.isActive = !reports[index].schedule!.isActive;
      }
      reports[index].updatedAt = new Date().toISOString();

      return NextResponse.json({
        data: reports[index],
        message: reports[index].schedule?.isActive 
          ? 'Planification activée' 
          : 'Planification désactivée',
        success: true,
      });
    }

    // Mise à jour standard
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: reports[index],
      message: 'Rapport mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/reports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/reports
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du rapport requis', success: false },
        { status: 400 }
      );
    }

    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Rapport non trouvé', success: false },
        { status: 404 }
      );
    }

    reports.splice(index, 1);

    return NextResponse.json({
      message: 'Rapport supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/reports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

