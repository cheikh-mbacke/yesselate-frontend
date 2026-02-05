/**
 * API Route: GET /api/rh/demandes/export
 * Exporte les demandes RH en différents formats
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'csv'; // 'csv', 'json', 'xlsx', 'pdf'
    const type = searchParams.get('type');
    const statut = searchParams.get('statut');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    // Mock data for export
    const mockData = [
      {
        numero: 'CONG-2026-001',
        type: 'Congés',
        agent: 'Abdoulaye DIOP',
        matricule: 'MAT-001',
        bureau: 'Bureau Technique',
        objet: 'Congé annuel - 15 jours',
        statut: 'En cours',
        priorite: 'Normale',
        dateDebut: '2026-07-01',
        dateFin: '2026-07-15',
        duree: 15,
        montant: '',
        createdAt: '2026-01-07',
        updatedAt: '2026-01-08'
      },
      {
        numero: 'DEP-2026-002',
        type: 'Dépenses',
        agent: 'Fatou SALL',
        matricule: 'MAT-002',
        bureau: 'Bureau Administratif',
        objet: 'Frais de mission Thiès',
        statut: 'Validée',
        priorite: 'Urgente',
        dateDebut: '2026-01-05',
        dateFin: '2026-01-05',
        duree: 1,
        montant: '75 000 XOF',
        createdAt: '2026-01-05',
        updatedAt: '2026-01-06'
      },
      {
        numero: 'DEPL-2026-003',
        type: 'Déplacement',
        agent: 'Mamadou BA',
        matricule: 'MAT-003',
        bureau: 'Bureau Technique',
        objet: 'Mission urgente Saint-Louis',
        statut: 'En cours',
        priorite: 'Critique',
        dateDebut: '2026-01-11',
        dateFin: '2026-01-13',
        duree: 3,
        montant: '',
        createdAt: '2026-01-09',
        updatedAt: '2026-01-10'
      }
    ];

    // Generate export based on format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: mockData,
        metadata: {
          total: mockData.length,
          exportedAt: new Date().toISOString(),
          filters: { type, statut, dateDebut, dateFin }
        }
      });
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Numéro',
        'Type',
        'Agent',
        'Matricule',
        'Bureau',
        'Objet',
        'Statut',
        'Priorité',
        'Date Début',
        'Date Fin',
        'Durée',
        'Montant',
        'Créée le',
        'Modifiée le'
      ];

      const csvRows = [
        headers.join(','),
        ...mockData.map(row => [
          row.numero,
          row.type,
          `"${row.agent}"`,
          row.matricule,
          `"${row.bureau}"`,
          `"${row.objet}"`,
          row.statut,
          row.priorite,
          row.dateDebut,
          row.dateFin,
          row.duree,
          row.montant,
          row.createdAt,
          row.updatedAt
        ].join(','))
      ];

      const csv = csvRows.join('\n');
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="demandes-rh-${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    if (format === 'xlsx') {
      // Mock Excel binary (in real app, use a library like xlsx or exceljs)
      return NextResponse.json({
        success: false,
        error: 'Format XLSX non implémenté',
        message: 'Utilisez format=csv ou format=json'
      }, { status: 501 });
    }

    if (format === 'pdf') {
      // Mock PDF generation (in real app, use a library like pdfkit or puppeteer)
      return NextResponse.json({
        success: false,
        error: 'Format PDF non implémenté',
        message: 'Utilisez format=csv ou format=json'
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      error: 'Format non supporté',
      message: 'Formats disponibles: csv, json, xlsx, pdf'
    }, { status: 400 });

  } catch (error) {
    console.error('Erreur API /api/rh/demandes/export:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'export',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

