import { NextRequest, NextResponse } from 'next/server';

export interface Comment {
  id: string;
  demandeId: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  text: string;
  type: 'public' | 'internal' | 'system';
  mentions?: string[];
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

// Données simulées
let comments: Comment[] = [
  {
    id: 'CMT-001',
    demandeId: 'RH-2026-001',
    author: {
      id: 'USR-001',
      name: 'Sarah Martin',
      role: 'Responsable RH',
    },
    text: 'Demande conforme aux règles internes. Solde de congés vérifié.',
    type: 'internal',
    mentions: [],
    reactions: [
      { emoji: '👍', users: ['USR-002', 'USR-003'] },
    ],
    attachments: [],
    createdAt: '2026-01-10T09:30:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
    isEdited: false,
  },
  {
    id: 'CMT-002',
    demandeId: 'RH-2026-001',
    author: {
      id: 'SYS',
      name: 'Système',
      role: 'Automatique',
    },
    text: '✅ Validation automatique - Durée courte (3 jours) et solde suffisant.',
    type: 'system',
    createdAt: '2026-01-10T09:35:00Z',
    updatedAt: '2026-01-10T09:35:00Z',
    isEdited: false,
  },
  {
    id: 'CMT-003',
    demandeId: 'RH-2026-002',
    author: {
      id: 'USR-002',
      name: 'Thomas Dubois',
      role: 'Contrôleur financier',
    },
    text: 'Demande de justificatifs supplémentaires : facture originale + bon de commande. @farid.benali merci de compléter le dossier.',
    type: 'public',
    mentions: ['farid.benali'],
    createdAt: '2026-01-10T10:15:00Z',
    updatedAt: '2026-01-10T10:15:00Z',
    isEdited: false,
  },
];

// GET /api/rh/comments - Récupérer les commentaires
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demandeId = searchParams.get('demandeId');
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    let filtered = [...comments];

    if (id) {
      const comment = filtered.find((c) => c.id === id);
      if (!comment) {
        return NextResponse.json(
          { error: 'Commentaire non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: comment, success: true });
    }

    if (demandeId) {
      filtered = filtered.filter((c) => c.demandeId === demandeId);
    }
    if (type) {
      filtered = filtered.filter((c) => c.type === type);
    }

    // Trier par date (plus ancien en premier)
    filtered.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/comments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/comments - Ajouter un commentaire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.demandeId || !body.text || !body.author) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    // Détecter les mentions (@username)
    const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(body.text)) !== null) {
      mentions.push(match[1]);
    }

    const newComment: Comment = {
      id: `CMT-${Date.now()}`,
      demandeId: body.demandeId,
      author: body.author,
      text: body.text,
      type: body.type || 'public',
      mentions,
      reactions: [],
      attachments: body.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
    };

    comments.push(newComment);

    return NextResponse.json(
      {
        data: newComment,
        message: 'Commentaire ajouté avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/comments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/comments - Modifier un commentaire ou ajouter une réaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du commentaire requis', success: false },
        { status: 400 }
      );
    }

    const index = comments.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action spécifique : ajouter/retirer une réaction
    if (action === 'react') {
      const { emoji, userId } = body;
      if (!emoji || !userId) {
        return NextResponse.json(
          { error: 'Emoji et userId requis', success: false },
          { status: 400 }
        );
      }

      const comment = comments[index];
      const existingReaction = comment.reactions?.find((r) => r.emoji === emoji);

      if (existingReaction) {
        const userIndex = existingReaction.users.indexOf(userId);
        if (userIndex > -1) {
          // Retirer la réaction
          existingReaction.users.splice(userIndex, 1);
          if (existingReaction.users.length === 0) {
            comment.reactions = comment.reactions?.filter((r) => r.emoji !== emoji);
          }
        } else {
          // Ajouter l'utilisateur à la réaction
          existingReaction.users.push(userId);
        }
      } else {
        // Créer une nouvelle réaction
        if (!comment.reactions) comment.reactions = [];
        comment.reactions.push({ emoji, users: [userId] });
      }

      comments[index] = comment;

      return NextResponse.json({
        data: comment,
        message: 'Réaction mise à jour',
        success: true,
      });
    }

    // Modification du texte
    if (updates.text) {
      comments[index].text = updates.text;
      comments[index].isEdited = true;
    }

    comments[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      data: comments[index],
      message: 'Commentaire mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/comments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/comments?id=CMT-001
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du commentaire requis', success: false },
        { status: 400 }
      );
    }

    const index = comments.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé', success: false },
        { status: 404 }
      );
    }

    comments.splice(index, 1);

    return NextResponse.json({
      message: 'Commentaire supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/comments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

