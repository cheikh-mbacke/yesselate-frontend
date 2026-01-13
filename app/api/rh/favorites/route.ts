import { NextRequest, NextResponse } from 'next/server';

export interface RHFavorite {
  id: string;
  userId: string;
  entityType: 'demande' | 'agent' | 'template' | 'workflow' | 'report';
  entityId: string;
  entityLabel: string;
  entityMetadata?: {
    type?: string;
    status?: string;
    priority?: string;
    agentName?: string;
    bureau?: string;
  };
  notes?: string;
  tags?: string[];
  position: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let favorites: RHFavorite[] = [
  {
    id: 'FAV-001',
    userId: 'USR-001',
    entityType: 'demande',
    entityId: 'RH-2026-001',
    entityLabel: 'Congé annuel - Ahmed Kaci',
    entityMetadata: {
      type: 'congé',
      status: 'en_attente',
      priority: 'normal',
      agentName: 'Ahmed Kaci',
      bureau: 'Bureau A',
    },
    notes: 'À traiter en priorité',
    tags: ['urgent', 'congé'],
    position: 0,
    isPinned: true,
    createdAt: '2026-01-09T10:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'FAV-002',
    userId: 'USR-001',
    entityType: 'agent',
    entityId: 'AGT-002',
    entityLabel: 'Farid Benali',
    entityMetadata: {
      bureau: 'Bureau B',
    },
    position: 1,
    isPinned: false,
    createdAt: '2026-01-08T14:00:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'FAV-003',
    userId: 'USR-001',
    entityType: 'template',
    entityId: 'TPL-001',
    entityLabel: 'Validation congés standard',
    position: 2,
    isPinned: false,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },
];

// GET /api/rh/favorites
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const isPinned = searchParams.get('isPinned');
    const entityId = searchParams.get('entityId');

    let filtered = [...favorites];

    if (id) {
      const favorite = filtered.find((f) => f.id === id);
      if (!favorite) {
        return NextResponse.json(
          { error: 'Favori non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: favorite, success: true });
    }

    // Vérifier si une entité est dans les favoris
    if (entityId && userId) {
      const exists = filtered.some(
        (f) => f.entityId === entityId && f.userId === userId
      );
      return NextResponse.json({ exists, success: true });
    }

    if (userId) {
      filtered = filtered.filter((f) => f.userId === userId);
    }
    if (entityType) {
      filtered = filtered.filter((f) => f.entityType === entityType);
    }
    if (isPinned !== null) {
      const pinned = isPinned === 'true';
      filtered = filtered.filter((f) => f.isPinned === pinned);
    }

    // Trier par position (pinnés d'abord)
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.position - b.position;
    });

    // Statistiques
    const stats = {
      total: filtered.length,
      pinned: filtered.filter((f) => f.isPinned).length,
      byType: {
        demande: filtered.filter((f) => f.entityType === 'demande').length,
        agent: filtered.filter((f) => f.entityType === 'agent').length,
        template: filtered.filter((f) => f.entityType === 'template').length,
        workflow: filtered.filter((f) => f.entityType === 'workflow').length,
        report: filtered.filter((f) => f.entityType === 'report').length,
      },
    };

    return NextResponse.json({
      data: filtered,
      stats,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/favorites:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/favorites - Ajouter un favori
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.entityType || !body.entityId || !body.entityLabel) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    // Vérifier si déjà en favoris
    const exists = favorites.some(
      (f) => f.userId === body.userId && f.entityId === body.entityId
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Déjà dans les favoris', success: false },
        { status: 409 }
      );
    }

    // Calculer la nouvelle position
    const userFavorites = favorites.filter((f) => f.userId === body.userId);
    const maxPosition = userFavorites.reduce((max, f) => Math.max(max, f.position), -1);

    const newFavorite: RHFavorite = {
      id: `FAV-${Date.now()}`,
      userId: body.userId,
      entityType: body.entityType,
      entityId: body.entityId,
      entityLabel: body.entityLabel,
      entityMetadata: body.entityMetadata,
      notes: body.notes,
      tags: body.tags || [],
      position: maxPosition + 1,
      isPinned: body.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    favorites.push(newFavorite);

    return NextResponse.json(
      {
        data: newFavorite,
        message: 'Ajouté aux favoris',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/favorites:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/favorites - Mettre à jour un favori
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du favori requis', success: false },
        { status: 400 }
      );
    }

    const index = favorites.findIndex((f) => f.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Favori non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action pin/unpin
    if (action === 'toggle_pin') {
      favorites[index].isPinned = !favorites[index].isPinned;
      favorites[index].updatedAt = new Date().toISOString();
      
      return NextResponse.json({
        data: favorites[index],
        message: favorites[index].isPinned ? 'Épinglé' : 'Désépinglé',
        success: true,
      });
    }

    // Action réorganiser
    if (action === 'reorder') {
      const { positions } = body; // { id: position }
      if (positions) {
        Object.entries(positions).forEach(([favId, pos]) => {
          const favIndex = favorites.findIndex((f) => f.id === favId);
          if (favIndex !== -1) {
            favorites[favIndex].position = pos as number;
            favorites[favIndex].updatedAt = new Date().toISOString();
          }
        });
        
        return NextResponse.json({
          message: 'Ordre mis à jour',
          success: true,
        });
      }
    }

    // Mise à jour standard
    favorites[index] = {
      ...favorites[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: favorites[index],
      message: 'Favori mis à jour',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/favorites:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/favorites
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');

    // Supprimer par entityId + userId
    if (entityId && userId) {
      const index = favorites.findIndex(
        (f) => f.entityId === entityId && f.userId === userId
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Favori non trouvé', success: false },
          { status: 404 }
        );
      }
      favorites.splice(index, 1);
      return NextResponse.json({
        message: 'Retiré des favoris',
        success: true,
      });
    }

    // Supprimer par ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID du favori requis', success: false },
        { status: 400 }
      );
    }

    const index = favorites.findIndex((f) => f.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Favori non trouvé', success: false },
        { status: 404 }
      );
    }

    favorites.splice(index, 1);

    return NextResponse.json({
      message: 'Retiré des favoris',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/favorites:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

