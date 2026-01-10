export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bmo/blocked/[id]/comment
 * Ajouter un commentaire à un dossier bloqué
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      content,
      authorId,
      authorName,
      authorRole,
      authorEmail,
      visibility,
      commentType,
      mentionedUsers,
      attachments,
      parentId,
    } = body;
    
    // Validation
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    if (!authorId || !authorName) {
      return NextResponse.json(
        { error: 'Missing author information: authorId, authorName' },
        { status: 400 }
      );
    }
    
    // Vérifier que le dossier existe
    const dossier = await prisma.blockedDossier.findUnique({
      where: { id },
    });
    
    if (!dossier) {
      return NextResponse.json(
        { error: 'Dossier not found' },
        { status: 404 }
      );
    }
    
    // Si parentId fourni, vérifier que le commentaire parent existe
    if (parentId) {
      const parentComment = await prisma.blockedComment.findUnique({
        where: { id: parentId },
      });
      
      if (!parentComment || parentComment.dossierId !== id) {
        return NextResponse.json(
          { error: 'Parent comment not found or does not belong to this dossier' },
          { status: 400 }
        );
      }
    }
    
    // Créer le commentaire
    const comment = await prisma.blockedComment.create({
      data: {
        dossierId: id,
        content,
        authorId,
        authorName,
        authorRole: authorRole || null,
        authorEmail: authorEmail || null,
        visibility: visibility || 'internal',
        commentType: commentType || 'general',
        mentionedUsers: mentionedUsers ? JSON.stringify(mentionedUsers) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        parentId: parentId || null,
      },
    });
    
    // Créer un audit log pour le commentaire
    const { hashChain } = await import('@/lib/hash');
    const chainPayload = {
      action: 'commented',
      commentId: comment.id,
      authorId,
      visibility,
      timestamp: new Date().toISOString(),
    };
    const newHash = hashChain(dossier.hash || 'genesis', chainPayload);
    
    await prisma.blockedAuditLog.create({
      data: {
        dossierId: id,
        action: 'commented',
        actorId: authorId,
        actorName: authorName,
        actorRole: authorRole || 'User',
        summary: 'Commentaire ajouté',
        details: JSON.stringify({
          commentId: comment.id,
          commentType: comment.commentType,
          visibility: comment.visibility,
          contentPreview: content.slice(0, 100),
          mentionedUsers: mentionedUsers || [],
        }),
        hash: newHash,
        previousHash: dossier.hash || 'genesis',
      },
    });
    
    // Mettre à jour le hash du dossier
    await prisma.blockedDossier.update({
      where: { id },
      data: {
        hash: newHash,
        updatedAt: new Date(),
      },
    });
    
    // TODO: Send notifications aux utilisateurs mentionnés
    // if (mentionedUsers && mentionedUsers.length > 0) {
    //   notifyMentionedUsers(mentionedUsers, comment, dossier);
    // }
    
    return NextResponse.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      comment,
    });
    
  } catch (error) {
    console.error('Error adding comment to blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bmo/blocked/[id]/comment
 * Récupérer tous les commentaires d'un dossier
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const visibility = searchParams.get('visibility'); // Filter by visibility
    const commentType = searchParams.get('type'); // Filter by type
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = { dossierId: id };
    
    if (visibility) {
      where.visibility = visibility;
    }
    
    if (commentType) {
      where.commentType = commentType;
    }
    
    const comments = await prisma.blockedComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return NextResponse.json({
      comments,
      total: comments.length,
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: String(error) },
      { status: 500 }
    );
  }
}

