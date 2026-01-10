// API Route: POST /api/validation-bc/documents/[id]/comments
// Ajoute un commentaire à un document

import { NextRequest, NextResponse } from 'next/server';

interface AddCommentBody {
  text: string;
  mentions?: string[]; // User IDs mentionnés avec @
  attachments?: string[]; // URLs des fichiers uploadés
  private?: boolean; // Commentaire privé (visible uniquement par les validateurs)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AddCommentBody = await request.json();

    // Validation
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (body.text.length > 2000) {
      return NextResponse.json(
        { error: 'Comment text is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // TODO: Récupérer l'utilisateur courant
    // TODO: Vérifier les permissions (peut commenter ?)
    // TODO: Sauvegarder en DB
    // TODO: Créer l'entrée dans la timeline
    // TODO: Notifier les personnes mentionnées
    // TODO: Notifier les participants du document
    // TODO: Envoyer emails si nécessaire

    // Mock comment
    const newComment = {
      id: `com-${Date.now()}`,
      documentId: id,
      auteur: 'M. KANE',
      auteurId: 'val-2',
      fonction: 'DAF',
      avatar: null,
      date: new Date().toISOString(),
      texte: body.text,
      mentions: body.mentions || [],
      attachments: body.attachments || [],
      private: body.private || false,
      reactions: [],
      edited: false,
      editedAt: null,
    };

    // Log de l'action
    console.log(`[validation-bc/documents/${id}/comments] Comment added`, {
      author: 'M. KANE',
      length: body.text.length,
      mentions: body.mentions?.length || 0,
      attachments: body.attachments?.length || 0,
      private: body.private,
    });

    // Créer notifications pour les mentions
    // if (body.mentions && body.mentions.length > 0) {
    //   for (const userId of body.mentions) {
    //     await createNotification({
    //       type: 'comment_mention',
    //       documentId: id,
    //       userId,
    //       message: `M. KANE vous a mentionné dans un commentaire sur ${id}`,
    //       link: `/validation-bc/documents/${id}?tab=comments`,
    //     });
    //   }
    // }

    // Notifier les participants
    // await notifyDocumentParticipants({
    //   documentId: id,
    //   type: 'new_comment',
    //   excludeUserId: 'val-2', // Ne pas notifier l'auteur
    //   message: `Nouveau commentaire de M. KANE sur ${id}`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      comment: newComment,
      notifications: {
        mentionsSent: body.mentions?.length || 0,
        participantsNotified: true,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/comments] Error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to add comment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation-bc/documents/[id]/comments
 * Récupère tous les commentaires d'un document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    const includePrivate = searchParams.get('includePrivate') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Récupérer l'utilisateur courant
    // TODO: Vérifier les permissions
    // TODO: Récupérer les commentaires en DB
    // TODO: Filtrer les commentaires privés selon permissions

    // Mock comments
    const allComments = [
      {
        id: 'com-1',
        documentId: id,
        auteur: 'Amadou DIALLO',
        auteurId: 'val-1',
        fonction: 'Chef de Service',
        avatar: null,
        date: '2024-01-16 10:30:00',
        texte: 'Budget vérifié et disponible. Pièces conformes. Validation niveau 1 approuvée.',
        mentions: [],
        attachments: [],
        private: false,
        reactions: [
          { emoji: '👍', count: 3, users: ['val-2', 'val-3', 'user-4'] },
        ],
      },
      {
        id: 'com-2',
        documentId: id,
        auteur: 'Fatou NDIAYE',
        auteurId: 'user-4',
        fonction: 'Assistante',
        avatar: null,
        date: '2024-01-15 16:00:00',
        texte: 'Documents reçus et vérifiés. Attention : le bon de livraison n\'est pas encore fourni. @Amadou DIALLO',
        mentions: ['val-1'],
        attachments: [],
        private: false,
        reactions: [],
      },
      {
        id: 'com-3',
        documentId: id,
        auteur: 'M. KANE',
        auteurId: 'val-2',
        fonction: 'DAF',
        avatar: null,
        date: '2024-01-17 09:15:00',
        texte: 'Note interne : vérifier la disponibilité budgétaire avant validation finale.',
        mentions: [],
        attachments: [],
        private: true,
        reactions: [],
      },
    ];

    // Filtrer selon les permissions
    const comments = includePrivate 
      ? allComments 
      : allComments.filter(c => !c.private);

    const paginatedComments = comments.slice(offset, offset + limit);

    return NextResponse.json({
      comments: paginatedComments,
      total: comments.length,
      offset,
      limit,
      hasMore: offset + limit < comments.length,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/comments] GET Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

