// API Route: POST /api/validation-bc/comments/[id]/reactions
// Ajouter des réactions aux commentaires

import { NextRequest, NextResponse } from 'next/server';

interface ReactionRequest {
  commentId: string;
  type: 'like' | 'helpful' | 'resolved';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = id;
    const body: Omit<ReactionRequest, 'commentId'> = await request.json();
    const { type } = body;

    if (!['like', 'helpful', 'resolved'].includes(type)) {
      return NextResponse.json({ error: 'Type de réaction invalide' }, { status: 400 });
    }

    console.log(`[validation-bc/comments/reactions] Added ${type} to ${commentId}`);

    return NextResponse.json({
      success: true,
      message: 'Réaction ajoutée avec succès',
      reaction: {
        type,
        userId: 'current-user',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[validation-bc/comments/reactions] Error:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['like', 'helpful', 'resolved'].includes(type)) {
      return NextResponse.json({ error: 'Type de réaction invalide' }, { status: 400 });
    }

    console.log(`[validation-bc/comments/reactions] Removed ${type} from ${commentId}`);

    return NextResponse.json({
      success: true,
      message: 'Réaction retirée avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/comments/reactions] Error:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}

