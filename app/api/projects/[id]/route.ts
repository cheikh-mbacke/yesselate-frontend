import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/lib/data';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/projects/[id] - Détail d'un projet
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = projects.find((p: any) => p.id === id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error(`Erreur GET /api/projects:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Mettre à jour un projet
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // En production: mettre à jour dans la base de données
    // await db.projects.update({ where: { id }, data: body });
    
    return NextResponse.json({
      success: true,
      message: `Projet ${id} mis à jour`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Erreur PATCH /api/projects:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Supprimer un projet
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // En production: supprimer de la base de données
    // await db.projects.delete({ where: { id } });
    
    return NextResponse.json({
      success: true,
      message: `Projet ${id} supprimé`,
    });
  } catch (error) {
    console.error(`Erreur DELETE /api/projects:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}

