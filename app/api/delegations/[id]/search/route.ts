/**
 * API Recherche dans les délégations
 * ===================================
 * 
 * GET /api/delegations/[id]/search
 * 
 * Recherche dans les événements, usages et métadonnées d'une délégation.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Requête trop courte (minimum 2 caractères).',
      });
    }

    const searchTerm = `%${query}%`;

    // Recherche dans les événements
    const events = await prisma.delegationEvent.findMany({
      where: {
        delegationId: id,
        OR: [
          { summary: { contains: query } },
          { details: { contains: query } },
          { actorName: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        eventType: true,
        summary: true,
        actorName: true,
        createdAt: true,
      },
    });

    // Recherche dans les usages
    const usages = await prisma.delegationUsage.findMany({
      where: {
        delegationId: id,
        OR: [
          { documentRef: { contains: query } },
          { projectName: { contains: query } },
          { supplierName: { contains: query } },
          { usedByName: { contains: query } },
          { notes: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        documentRef: true,
        documentType: true,
        amount: true,
        projectName: true,
        supplierName: true,
        usedByName: true,
        createdAt: true,
      },
    });

    // Recherche dans les acteurs
    const actors = await prisma.delegationActor.findMany({
      where: {
        delegationId: id,
        OR: [
          { userName: { contains: query } },
          { userRole: { contains: query } },
          { userEmail: { contains: query } },
          { notes: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        userName: true,
        userRole: true,
        roleType: true,
      },
    });

    return NextResponse.json({
      query,
      results: {
        events: events.map(e => ({
          type: 'event',
          id: e.id,
          title: e.summary,
          subtitle: `${e.eventType} par ${e.actorName}`,
          date: e.createdAt,
        })),
        usages: usages.map(u => ({
          type: 'usage',
          id: u.id,
          title: u.documentRef,
          subtitle: `${u.documentType} • ${new Intl.NumberFormat('fr-FR').format(u.amount)} XOF`,
          date: u.createdAt,
        })),
        actors: actors.map(a => ({
          type: 'actor',
          id: a.id,
          title: a.userName,
          subtitle: `${a.roleType}${a.userRole ? ` • ${a.userRole}` : ''}`,
        })),
      },
      counts: {
        events: events.length,
        usages: usages.length,
        actors: actors.length,
        total: events.length + usages.length + actors.length,
      },
    });
  } catch (error) {
    console.error('[API] Erreur recherche délégation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche.' },
      { status: 500 }
    );
  }
}

