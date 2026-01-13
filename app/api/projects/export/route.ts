import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/lib/data';

// Helper functions
function computeRiskScore(project: any): number {
  let score = 0;
  if (project.status === 'blocked') score += 30;
  if (project.status === 'late') score += 20;
  return Math.min(100, Math.round(score));
}

function computeComplexityScore(project: any): number {
  const actors = project.stakeholders?.length ?? 0;
  const wp = project.workPackages?.length ?? 0;
  return Math.min(100, Math.round(actors * 4 + wp * 2));
}

// Fonction pour générer CSV
function generateCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(';')
  );
  
  return [headers.join(';'), ...rows].join('\n');
}

// GET /api/projects/export - Export du portefeuille
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') ?? 'csv';
    const queue = searchParams.get('queue') ?? 'all';
    
    // Enrichir les projets
    const enrichedProjects = projects.map((project: any) => ({
      ...project,
      risk: computeRiskScore(project),
      complexity: computeComplexityScore(project),
    }));
    
    // Filtrer selon la queue
    let filtered = enrichedProjects;
    if (queue !== 'all') {
      switch (queue) {
        case 'active':
          filtered = enrichedProjects.filter(p => p.status === 'active');
          break;
        case 'blocked':
          filtered = enrichedProjects.filter(p => p.status === 'blocked');
          break;
        case 'late':
          filtered = enrichedProjects.filter(p => p.status === 'late');
          break;
        case 'completed':
          filtered = enrichedProjects.filter(p => p.status === 'completed');
          break;
      }
    }
    
    // Préparer les données pour l'export
    const exportData = filtered.map(p => ({
      ID: p.id,
      Nom: p.name,
      Type: p.kind,
      Secteur: p.sector,
      Phase: p.phase,
      Statut: p.status,
      Bureau: p.leadBureau || '',
      ChefProjet: p.projectManager || '',
      DecisionBMO: p.decisionBMO || 'Hors BMO',
      DateDebut: p.startDate || '',
      DateFin: p.endDate || '',
      BudgetPlanifie: p.budgetPlanned || 0,
      BudgetEngage: p.budgetCommitted || 0,
      BudgetDepense: p.budgetSpent || 0,
      ScoreRisque: p.risk,
      ScoreComplexite: p.complexity,
      Contexte: p.context,
      NbStakeholders: p.stakeholders?.length || 0,
      NbWorkPackages: p.workPackages?.length || 0,
      NbIndicateurs: p.indicators?.length || 0,
    }));
    
    // Générer le fichier selon le format
    switch (format) {
      case 'json':
        return NextResponse.json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="projets_${queue}_${new Date().toISOString().slice(0, 10)}.json"`,
          },
        });
      
      case 'csv':
      default:
        const csv = '\uFEFF' + generateCSV(exportData); // UTF-8 BOM pour Excel
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="projets_${queue}_${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
    }
  } catch (error) {
    console.error('Erreur GET /api/projects/export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

