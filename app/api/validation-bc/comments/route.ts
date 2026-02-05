// API Route: /api/validation-bc/comments
// Système de commentaires collaboratifs sur les documents

import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: string;
  text: string;
  mentions: string[]; // User IDs mentionnés avec @
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
  parentId?: string; // Pour les réponses
  createdAt: string;
  updatedAt?: string;
  reactions: {
    type: 'like' | 'helpful' | 'resolved';
    userId: string;
    createdAt: string;
  }[];
}

// Mock data
const mockComments: Comment[] = [
  {
    id: 'cmt-1',
    documentId: 'BC-2024-001',
    userId: 'user-1',
    userName: 'Marie KANE',
    userRole: 'Validateur',
    text: 'Le montant semble correct. @jean.dupont pouvez-vous confirmer le devis fournisseur ?',
    mentions: ['user-2'],
    createdAt: '2024-01-15T10:30:00Z',
    reactions: [
      { type: 'helpful', userId: 'user-3', createdAt: '2024-01-15T11:00:00Z' },
    ],
  },
];

/**
 * GET - Récupère les commentaires d'un document
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'documentId requis' }, { status: 400 });
    }

    const comments = mockComments.filter((c) => c.documentId === documentId);

    // Organiser en arbre (commentaires + réponses)
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const threaded = topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment.id),
    }));

    return NextResponse.json({
      documentId,
      comments: threaded,
      total: comments.length,
      unreadCount: 0, // En production, calculer selon l'utilisateur
    });
  } catch (error) {
    console.error('[validation-bc/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

/**
 * POST - Ajoute un commentaire
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, text, parentId, mentions, attachments } = body;

    if (!documentId || !text) {
      return NextResponse.json({ error: 'documentId et text requis' }, { status: 400 });
    }

    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      documentId,
      userId: 'current-user',
      userName: 'Utilisateur Actuel',
      userRole: 'Validateur',
      text,
      mentions: mentions || [],
      attachments: attachments || [],
      parentId,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    mockComments.push(comment);

    // Notifier les mentions
    if (mentions && mentions.length > 0) {
      console.log(`[Comments] Notifying ${mentions.length} mentioned users`);
      // En production, déclencher des notifications
    }

    console.log(`[validation-bc/comments] Created comment on ${documentId}`);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Commentaire ajouté avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

/**
 * PATCH - Modifie un commentaire
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, text } = body;

    if (!commentId || !text) {
      return NextResponse.json({ error: 'commentId et text requis' }, { status: 400 });
    }

    const index = mockComments.findIndex((c) => c.id === commentId);
    if (index === -1) {
      return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
    }

    mockComments[index].text = text;
    mockComments[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      comment: mockComments[index],
      message: 'Commentaire modifié avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

/**
 * DELETE - Supprime un commentaire
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'commentId requis' }, { status: 400 });
    }

    const index = mockComments.findIndex((c) => c.id === commentId);
    if (index === -1) {
      return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
    }

    mockComments.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

