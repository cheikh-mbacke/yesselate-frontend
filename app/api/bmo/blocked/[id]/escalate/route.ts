export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashChain } from '@/lib/hash';

/**
 * POST /api/bmo/blocked/[id]/escalate
 * Escalader un dossier bloqué à un niveau supérieur
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      escalatedToId,
      escalatedToName,
      reason,
      urgency,
      deadline,
      actorId,
      actorName,
      actorRole,
      notifyHierarchy,
    } = body;
    
    // Validation
    if (!escalatedToId || !escalatedToName) {
      return NextResponse.json(
        { error: 'Missing required fields: escalatedToId, escalatedToName' },
        { status: 400 }
      );
    }
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Escalation reason is required' },
        { status: 400 }
      );
    }
    
    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'Missing actor information: actorId, actorName' },
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
    
    // Vérifier que le dossier n'est pas déjà résolu
    if (dossier.status === 'resolved') {
      return NextResponse.json(
        { error: 'Cannot escalate a resolved dossier' },
        { status: 400 }
      );
    }
    
    // Incrémenter le niveau d'escalade
    const newEscalationLevel = (dossier.escalationLevel || 0) + 1;
    
    // Si urgency fourni et = 'critical', augmenter la priorité
    let newPriority = dossier.priority;
    let newImpact = dossier.impact;
    
    if (urgency === 'critical' && dossier.impact !== 'critical') {
      newImpact = 'critical';
      newPriority = dossier.priority * 2; // Doubler la priorité
    }
    
    // Hash chaîné pour l'audit
    const chainPayload = {
      action: 'escalated',
      escalatedTo: escalatedToName,
      reason,
      urgency,
      level: newEscalationLevel,
      actorId,
      timestamp: new Date().toISOString(),
    };
    const newHash = hashChain(dossier.hash || 'genesis', chainPayload);
    
    // Mettre à jour le dossier
    const updated = await prisma.blockedDossier.update({
      where: { id },
      data: {
        status: 'escalated',
        escalatedAt: new Date(),
        escalatedToId,
        escalatedToName,
        escalationReason: reason,
        escalationLevel: newEscalationLevel,
        impact: newImpact,
        priority: newPriority,
        isCritical: newImpact === 'critical' ? 1 : 0,
        isUrgent: urgency === 'critical' ? 1 : dossier.isUrgent,
        dueDate: deadline ? new Date(deadline) : dossier.dueDate,
        hash: newHash,
        auditLog: {
          create: {
            action: 'escalated',
            actorId,
            actorName,
            actorRole: actorRole || 'Manager',
            summary: `Escaladé à ${escalatedToName} (niveau ${newEscalationLevel})`,
            details: JSON.stringify({
              escalatedTo: { id: escalatedToId, name: escalatedToName },
              reason,
              urgency,
              level: newEscalationLevel,
              deadline,
              notifyHierarchy: notifyHierarchy || false,
            }),
            hash: newHash,
            previousHash: dossier.hash || 'genesis',
          },
        },
      },
      include: {
        auditLog: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    
    // TODO: Broadcast WebSocket event
    // broadcastBlockedEvent('escalation', {
    //   dossier: updated,
    //   escalatedTo: escalatedToName,
    //   level: newEscalationLevel,
    // });
    
    // TODO: Send notifications
    // - À l'escaladé (escalatedToId)
    // - À la hiérarchie si notifyHierarchy = true
    // - Notification urgente si urgency = 'critical'
    
    return NextResponse.json({
      success: true,
      message: `Dossier escaladé à ${escalatedToName} (niveau ${newEscalationLevel})`,
      dossier: updated,
      escalationLevel: newEscalationLevel,
      auditHash: newHash,
    });
    
  } catch (error) {
    console.error('Error escalating blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to escalate blocked dossier', details: String(error) },
      { status: 500 }
    );
  }
}

