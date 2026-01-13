import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/lib/data';

// Types
type ProjectStatus = 'planned' | 'active' | 'blocked' | 'late' | 'completed' | 'cancelled';
type ProjectQueue = 'all' | 'active' | 'blocked' | 'late' | 'completed' | 'high_risk' | 'decision';

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
  
  if (!project.decisionBMO && ['consultation', 'execution', 'reception'].includes(project.phase)) {
    score += 8;
  }
  
  return Math.min(100, Math.round(score));
}

function computeComplexityScore(project: any): number {
  const actors = project.stakeholders?.length ?? 0;
  const wp = project.workPackages?.length ?? 0;
  const enjeux = project.enjeux?.length ?? 0;
  const leviers = project.leviers?.length ?? 0;
  
  const budget = project.budgetPlanned ?? 0;
  const budgetScore = Math.min(35, Math.log10(Math.max(1, budget)) * 10);
  
  const contextBoost = project.context === 'informal' ? 18 : 
                      project.context === 'hybrid' ? 10 : 
                      project.context === 'formal' ? 2 : 6;
  
  const score = Math.min(30, actors * 4) +
                Math.min(25, wp * 2) +
                Math.min(20, (enjeux + leviers) * 3) +
                budgetScore +
                contextBoost;
  
  return Math.min(100, Math.round(score));
}

// GET /api/projects - Liste des projets avec filtres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queue = searchParams.get('queue') as ProjectQueue ?? 'all';
    const limit = parseInt(searchParams.get('limit') ?? '100');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Enrichir les projets avec les scores
    const enrichedProjects = projects.map((project: any) => ({
      ...project,
      risk: computeRiskScore(project),
      complexity: computeComplexityScore(project),
      daysLeft: getDaysLeft(project.endDate),
      isOverdue: isOverdue(project),
    }));
    
    // Filtrer selon la queue
    let filtered = enrichedProjects;
    
    switch (queue) {
      case 'active':
        filtered = enrichedProjects.filter(p => p.status === 'active');
        break;
      case 'blocked':
        filtered = enrichedProjects.filter(p => p.status === 'blocked');
        break;
      case 'late':
        filtered = enrichedProjects.filter(p => p.status === 'late' || p.isOverdue);
        break;
      case 'completed':
        filtered = enrichedProjects.filter(p => p.status === 'completed');
        break;
      case 'high_risk':
        filtered = enrichedProjects.filter(p => p.risk >= 60);
        break;
      case 'decision':
        filtered = enrichedProjects.filter(p => 
          p.risk >= 50 || 
          p.status === 'blocked' || 
          p.isOverdue ||
          (p.daysLeft !== null && p.daysLeft <= 30)
        );
        break;
    }
    
    // Paginer
    const paginated = filtered.slice(offset, offset + limit);
    
    return NextResponse.json({
      items: paginated,
      total: filtered.length,
      queue,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Erreur GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.name) {
      return NextResponse.json(
        { error: 'Le nom du projet est requis' },
        { status: 400 }
      );
    }
    
    // En production: créer dans la base de données
    const newProject = {
      id: `PRJ-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

