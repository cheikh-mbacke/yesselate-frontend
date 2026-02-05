import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/lib/data';

// Helper functions
function getDaysLeft(endDate?: string | null): number | null {
  if (!endDate) return null;
  const d = new Date(endDate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isOverdue(project: any): boolean {
  if (project.status === 'completed' || project.status === 'cancelled') return false;
  if (!project.endDate) return false;
  return new Date(project.endDate).getTime() < Date.now();
}

function computeRiskScore(project: any): number {
  let score = 0;
  
  if (project.status === 'blocked') score += 30;
  if (project.status === 'late') score += 20;
  if (isOverdue(project)) score += 15;
  
  const planned = project.budgetPlanned ?? 0;
  const spent = project.budgetSpent ?? 0;
  const committed = project.budgetCommitted ?? 0;
  
  if (planned > 0) {
    const burn = Math.max(spent, committed) / planned;
    if (burn > 1.05) score += 20;
    else if (burn > 0.9) score += 12;
    else if (burn > 0.75) score += 6;
  }
  
  if (project.context === 'informal') score += 12;
  if (project.context === 'hybrid') score += 6;
  
  return Math.min(100, Math.round(score));
}

// GET /api/projects/alerts - Alertes critiques
export async function GET(request: NextRequest) {
  try {
    const alerts: any[] = [];
    
    projects.forEach((project: any) => {
      const risk = computeRiskScore(project);
      const daysLeft = getDaysLeft(project.endDate);
      const overdue = isOverdue(project);
      
      // Projet bloqué
      if (project.status === 'blocked') {
        alerts.push({
          id: `blocked-${project.id}`,
          type: 'critical',
          message: `${project.name} est bloqué`,
          projectId: project.id,
          projectName: project.name,
          action: 'Débloquer',
          createdAt: new Date().toISOString(),
        });
      }
      
      // Projet en retard critique
      if (overdue && daysLeft !== null && daysLeft < -7) {
        alerts.push({
          id: `overdue-${project.id}`,
          type: 'critical',
          message: `${project.name} est en retard de ${Math.abs(daysLeft)} jours`,
          projectId: project.id,
          projectName: project.name,
          action: 'Voir projet',
          createdAt: new Date().toISOString(),
        });
      }
      
      // Risque élevé
      if (risk >= 70) {
        alerts.push({
          id: `high-risk-${project.id}`,
          type: 'warning',
          message: `${project.name} a un risque élevé (${risk}/100)`,
          projectId: project.id,
          projectName: project.name,
          action: 'Analyser',
          createdAt: new Date().toISOString(),
        });
      }
      
      // Dépassement budget
      const planned = project.budgetPlanned ?? 0;
      const spent = project.budgetSpent ?? 0;
      if (planned > 0 && spent / planned > 1.1) {
        alerts.push({
          id: `budget-${project.id}`,
          type: 'warning',
          message: `${project.name} dépasse le budget de ${Math.round((spent / planned - 1) * 100)}%`,
          projectId: project.id,
          projectName: project.name,
          action: 'Contrôler',
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    // Trier par criticité puis par date
    alerts.sort((a, b) => {
      if (a.type === 'critical' && b.type !== 'critical') return -1;
      if (a.type !== 'critical' && b.type === 'critical') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json({
      alerts: alerts.slice(0, 20), // Limiter à 20 alertes
      count: alerts.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/projects/alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

