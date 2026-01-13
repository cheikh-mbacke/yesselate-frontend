export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked
 * Récupère la liste des dossiers bloqués avec filtres et pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const skip = (page - 1) * pageSize;
    
    // Filtres
    const impact = searchParams.get('impact');
    const bureau = searchParams.get('bureau');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const minDelay = searchParams.get('minDelay');
    const maxDelay = searchParams.get('maxDelay');
    const assignedTo = searchParams.get('assignedTo');
    const type = searchParams.get('type');
    const slaBreached = searchParams.get('slaBreached');
    
    // Tri
    const sortField = searchParams.get('sort') || 'priority';
    const sortDir = searchParams.get('dir') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (impact && impact !== 'all') {
      where.impact = impact;
    }
    
    if (bureau) {
      where.bureauCode = bureau;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (slaBreached === '1' || slaBreached === 'true') {
      where.slaBreached = 1;
    }
    
    if (minDelay) {
      where.delay = { gte: parseInt(minDelay) };
    }
    
    if (maxDelay) {
      if (where.delay) {
        where.delay.lte = parseInt(maxDelay);
      } else {
        where.delay = { lte: parseInt(maxDelay) };
      }
    }
    
    if (search) {
      where.OR = [
        { refNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Build orderBy
    const orderBy: any = {};
    if (sortField === 'priority') {
      orderBy.priority = sortDir;
    } else if (sortField === 'delay') {
      orderBy.delay = sortDir;
    } else if (sortField === 'createdAt') {
      orderBy.createdAt = sortDir;
    } else if (sortField === 'dueDate') {
      orderBy.dueDate = sortDir;
    } else {
      orderBy.priority = 'desc';
    }
    
    // Fetch data
    const [dossiers, total] = await Promise.all([
      prisma.blockedDossier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          auditLog: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.blockedDossier.count({ where }),
    ]);
    
    return NextResponse.json({
      data: dossiers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching blocked dossiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked dossiers', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bmo/blocked
 * Créer un nouveau dossier bloqué
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      subject,
      description,
      impact,
      type,
      category,
      bureauCode,
      assignedToId,
      assignedToName,
      reportedById,
      reportedByName,
      dueDate,
      amount,
      slaTarget,
      affectedEntity,
      linkedEntityType,
      linkedEntityId,
      linkedEntityRef,
      tags,
      attachments,
      internalNotes,
    } = body;
    
    // Validation
    if (!subject || !impact || !type || !bureauCode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, impact, type, bureauCode' },
        { status: 400 }
      );
    }
    
    // Validate impact
    if (!['critical', 'high', 'medium', 'low'].includes(impact)) {
      return NextResponse.json(
        { error: 'Invalid impact value. Must be: critical, high, medium, or low' },
        { status: 400 }
      );
    }
    
    // Générer le numéro de référence
    const count = await prisma.blockedDossier.count();
    const year = new Date().getFullYear();
    const refNumber = `BLOCK-${year}-${String(count + 1).padStart(4, '0')}`;
    
    // Calculer la priorité (impact x urgence)
    const impactScore = { critical: 4, high: 3, medium: 2, low: 1 };
    let urgencyScore = 1;
    
    if (dueDate) {
      const daysUntilDue = Math.floor((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) urgencyScore = 10; // Dépassé
      else if (daysUntilDue <= 3) urgencyScore = 5; // Très urgent
      else if (daysUntilDue <= 7) urgencyScore = 3; // Urgent
      else urgencyScore = 1;
    }
    
    const priority = impactScore[impact as keyof typeof impactScore] * urgencyScore;
    
    // Déterminer si critique
    const isCritical = impact === 'critical' ? 1 : 0;
    const isUrgent = urgencyScore >= 3 ? 1 : 0;
    
    // Hash initial (genesis)
    const { hashChain } = await import('@/lib/hash');
    const initialPayload = {
      action: 'created',
      refNumber,
      subject,
      impact,
      bureauCode,
      timestamp: new Date().toISOString(),
    };
    const initialHash = hashChain('genesis', initialPayload);
    
    // Créer le dossier avec audit log initial
    const dossier = await prisma.blockedDossier.create({
      data: {
        refNumber,
        subject,
        description,
        impact,
        type,
        category,
        bureauCode,
        assignedToId,
        assignedToName,
        reportedById,
        reportedByName,
        dueDate: dueDate ? new Date(dueDate) : null,
        amount: amount || null,
        slaTarget: slaTarget || null,
        affectedEntity,
        linkedEntityType,
        linkedEntityId,
        linkedEntityRef,
        tags: tags ? JSON.stringify(tags) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        internalNotes,
        priority,
        delay: 0,
        isCritical,
        isUrgent,
        hash: initialHash,
        previousHash: 'genesis',
        auditLog: {
          create: {
            action: 'created',
            actorId: reportedById || 'SYSTEM',
            actorName: reportedByName || 'Système',
            actorRole: 'Reporter',
            summary: 'Dossier bloqué créé',
            details: JSON.stringify({
              refNumber,
              subject,
              impact,
              type,
              bureauCode,
            }),
            hash: initialHash,
            previousHash: 'genesis',
          },
        },
      },
      include: {
        auditLog: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        comments: true,
      },
    });
    
    // TODO: Broadcast WebSocket event
    // broadcastBlockedEvent('new_blocking', { dossier });
    
    return NextResponse.json(dossier, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to create blocked dossier', details: String(error) },
      { status: 500 }
    );
  }
}

