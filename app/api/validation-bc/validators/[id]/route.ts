// API Route: GET /api/validation-bc/validators/[id]
// Retourne les détails complets d'un validateur spécifique

import { NextRequest, NextResponse } from 'next/server';

// Mock data - à remplacer par de vraies requêtes DB
const getValidatorDetails = (id: string) => {
  // Simuler une recherche en base
  const allValidators = {
    'val-1': {
      id: 'val-1',
      name: 'Amadou DIALLO',
      email: 'adiallo@example.com',
      phone: '+221 77 123 45 67',
      bureau: 'DRE',
      role: 'Validateur Principal',
      avatar: null,
      stats: {
        validated: 45,
        rejected: 8,
        pending: 12,
        avgTime: '2.3h',
        performance: 92,
        totalProcessed: 53,
        successRate: 84.9,
        fastestValidation: '0.5h',
        slowestValidation: '5.2h',
      },
      activity: {
        today: 3,
        thisWeek: 12,
        thisMonth: 45,
        lastAction: new Date(Date.now() - 3600000).toISOString(),
        firstAction: new Date('2023-01-15').toISOString(),
      },
      workload: {
        current: 12,
        capacity: 20,
        utilizationRate: 60,
        trend: 'stable', // up | down | stable
      },
      specializations: ['Bons de commande', 'Contrats'],
      certifications: ['Validation BC Niveau 2', 'Marchés Publics'],
      status: 'active',
      createdAt: new Date('2023-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
      // Historique détaillé
      recentValidations: [
        {
          id: 'BC-2024-001',
          type: 'bc',
          montant: 5000000,
          action: 'validated',
          duration: '1.5h',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'BC-2024-003',
          type: 'bc',
          montant: 8000000,
          action: 'rejected',
          duration: '2.8h',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          reason: 'Budget insuffisant',
        },
        {
          id: 'CT-2024-005',
          type: 'contrat',
          montant: 12000000,
          action: 'validated',
          duration: '3.2h',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      // Performance par type de document
      performanceByType: {
        bc: { validated: 25, rejected: 4, avgTime: '2.1h', successRate: 86.2 },
        factures: { validated: 12, rejected: 2, avgTime: '1.8h', successRate: 85.7 },
        avenants: { validated: 8, rejected: 2, avgTime: '3.0h', successRate: 80.0 },
      },
      // Évolution mensuelle
      monthlyTrend: [
        { month: 'Jan 2024', validated: 38, rejected: 6, avgTime: 2.5 },
        { month: 'Fév 2024', validated: 42, rejected: 7, avgTime: 2.3 },
        { month: 'Mar 2024', validated: 45, rejected: 8, avgTime: 2.3 },
      ],
      // Notes et commentaires
      notes: [
        {
          id: 'note-1',
          author: 'Chef de Service',
          content: 'Excellent travail sur les dossiers complexes',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
        },
      ],
    },
    'val-2': {
      id: 'val-2',
      name: 'Mariama KANE',
      email: 'mkane@example.com',
      phone: '+221 77 234 56 78',
      bureau: 'DAAF',
      role: 'Validateur',
      avatar: null,
      stats: {
        validated: 38,
        rejected: 5,
        pending: 8,
        avgTime: '1.8h',
        performance: 95,
        totalProcessed: 43,
        successRate: 88.4,
        fastestValidation: '0.3h',
        slowestValidation: '4.1h',
      },
      activity: {
        today: 5,
        thisWeek: 18,
        thisMonth: 38,
        lastAction: new Date(Date.now() - 7200000).toISOString(),
        firstAction: new Date('2023-03-20').toISOString(),
      },
      workload: {
        current: 8,
        capacity: 15,
        utilizationRate: 53,
        trend: 'down',
      },
      specializations: ['Factures', 'Avenants'],
      certifications: ['Validation Factures', 'Comptabilité Publique'],
      status: 'active',
      createdAt: new Date('2023-03-20').toISOString(),
      updatedAt: new Date().toISOString(),
      recentValidations: [
        {
          id: 'FC-2024-001',
          type: 'facture',
          montant: 2000000,
          action: 'validated',
          duration: '1.2h',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      performanceByType: {
        bc: { validated: 10, rejected: 1, avgTime: '2.0h', successRate: 90.9 },
        factures: { validated: 20, rejected: 3, avgTime: '1.5h', successRate: 87.0 },
        avenants: { validated: 8, rejected: 1, avgTime: '2.2h', successRate: 88.9 },
      },
      monthlyTrend: [
        { month: 'Jan 2024', validated: 32, rejected: 4, avgTime: 1.9 },
        { month: 'Fév 2024', validated: 36, rejected: 5, avgTime: 1.8 },
        { month: 'Mar 2024', validated: 38, rejected: 5, avgTime: 1.8 },
      ],
      notes: [],
    },
  };

  return allValidators[id as keyof typeof allValidators] || null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Validator ID is required' },
        { status: 400 }
      );
    }

    const validator = getValidatorDetails(id);

    if (!validator) {
      return NextResponse.json(
        { error: 'Validator not found' },
        { status: 404 }
      );
    }

    console.log(`[validation-bc/validators/${id}] Loaded validator details`, {
      name: validator.name,
      bureau: validator.bureau,
    });

    return NextResponse.json({
      validator,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/validators/[id]] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to load validator details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/validation-bc/validators/[id]
 * Met à jour les informations d'un validateur
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Validator ID is required' },
        { status: 400 }
      );
    }

    // Simuler la mise à jour
    console.log(`[validation-bc/validators/${id}] Updating validator`, body);

    return NextResponse.json({
      success: true,
      message: 'Validator updated successfully',
      validator: {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`[validation-bc/validators/[id]] PATCH Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update validator' },
      { status: 500 }
    );
  }
}

