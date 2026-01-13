/**
 * GET /api/dashboard/actions
 * Actions prioritaires (Work Inbox) du Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get('urgency'); // 'critical' | 'warning' | 'normal' | 'all'
    const status = searchParams.get('status'); // 'pending' | 'in_progress' | 'completed'
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Données de démonstration
    let actions = [
      {
        id: 'BC-2024-0847',
        type: 'bc',
        title: 'Bon de commande matériaux',
        description: 'Validation urgente BC pour chantier Phase 3',
        bureau: 'BF',
        urgency: 'critical',
        delay: '2j retard',
        delayDays: -2,
        amount: 45200000,
        amountFormatted: '45.2M FCFA',
        status: 'pending',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'PAY-2024-1234',
        type: 'paiement',
        title: 'Paiement fournisseur ACME',
        description: 'Facture échue - risque pénalités',
        bureau: 'BCG',
        urgency: 'critical',
        delay: '3j retard',
        delayDays: -3,
        amount: 128500000,
        amountFormatted: '128.5M FCFA',
        status: 'pending',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'CTR-2024-0567',
        type: 'contrat',
        title: 'Contrat sous-traitance électricité',
        description: 'Signature requise avant démarrage travaux',
        bureau: 'BJA',
        urgency: 'warning',
        delay: 'J-5',
        delayDays: 5,
        amount: 89000000,
        amountFormatted: '89.0M FCFA',
        status: 'pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ARB-2024-0089',
        type: 'arbitrage',
        title: 'Conflit ressources Lot 4',
        description: 'Arbitrage requis entre BOP et BF',
        bureau: 'BOP',
        urgency: 'warning',
        delay: '5j',
        delayDays: 5,
        status: 'in_progress',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'BC-2024-0852',
        type: 'bc',
        title: 'BC équipements sécurité',
        description: 'Validation pour conformité chantier',
        bureau: 'BOP',
        urgency: 'normal',
        delay: 'J-3',
        delayDays: 3,
        amount: 12800000,
        amountFormatted: '12.8M FCFA',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'BC-2024-0853',
        type: 'bc',
        title: 'BC fournitures bureau',
        description: 'Commande trimestrielle papeterie',
        bureau: 'BRH',
        urgency: 'normal',
        delay: 'J-7',
        delayDays: 7,
        amount: 2500000,
        amountFormatted: '2.5M FCFA',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Filtres
    if (urgency && urgency !== 'all') {
      actions = actions.filter((a) => a.urgency === urgency);
    }

    if (status) {
      actions = actions.filter((a) => a.status === status);
    }

    // Tri par urgence puis date
    const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
    actions.sort((a, b) => {
      const urgencyDiff = (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 2) - 
                         (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 2);
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.delayDays - b.delayDays;
    });

    // Limiter
    actions = actions.slice(0, limit);

    // Stats agrégées
    const stats = {
      total: actions.length,
      critical: actions.filter((a) => a.urgency === 'critical').length,
      warning: actions.filter((a) => a.urgency === 'warning').length,
      normal: actions.filter((a) => a.urgency === 'normal').length,
      pending: actions.filter((a) => a.status === 'pending').length,
      inProgress: actions.filter((a) => a.status === 'in_progress').length,
      totalAmount: actions.reduce((acc, a) => acc + (a.amount || 0), 0),
    };

    return NextResponse.json({
      actions,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard actions' },
      { status: 500 }
    );
  }
}

