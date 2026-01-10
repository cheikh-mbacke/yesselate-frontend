export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashChain } from '@/lib/hash';

/**
 * POST /api/bmo/blocked/[id]/resolve
 * Résoudre un dossier bloqué
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { 
      method, 
      comment, 
      actorId, 
      actorName,
      actorRole,
      documents,
      delegationRef,
    } = body;
    
    // Validation
    if (!method || !['direct', 'escalation', 'substitution', 'delegation'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid resolution method. Must be: direct, escalation, substitution, or delegation' },
        { status: 400 }
      );
    }
    
    if (!actorId || !actorName) {
      return NextResponse.json(
        { error: 'Missing required fields: actorId, actorName' },
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
        { error: 'Dossier already resolved' },
        { status: 400 }
      );
    }
    
    // Hash chaîné pour l'audit (anti-contestation)
    const chainPayload = {
      action: 'resolved',
      method,
      actorId,
      actorName,
      comment: comment || '',
      timestamp: new Date().toISOString(),
    };
    const newHash = hashChain(dossier.hash || 'genesis', chainPayload);
    
    // Préparer les données de résolution
    const updateData: any = {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedById: actorId,
      resolvedByName: actorName,
      resolutionMethod: method,
      resolutionComment: comment || null,
      hash: newHash,
    };
    
    // Si méthode = substitution, ajouter les infos de substitution
    if (method === 'substitution') {
      updateData.substitutedAt = new Date();
      updateData.substitutedById = actorId;
      updateData.substitutedByName = actorName;
      
      // Hash de la décision de substitution (pour traçabilité juridique)
      const substitutionPayload = {
        dossierId: id,
        subject: dossier.subject,
        actorId,
        actorName,
        decision: comment,
        timestamp: new Date().toISOString(),
      };
      updateData.substitutionHash = hashChain('substitution', substitutionPayload);
      updateData.substitutionRef = delegationRef || `SUB-${new Date().getFullYear()}-${id.slice(0, 8)}`;
    }
    
    // Si documents fournis, les ajouter
    if (documents && Array.isArray(documents)) {
      const existingDocs = dossier.resolutionDocs ? JSON.parse(dossier.resolutionDocs) : [];
      updateData.resolutionDocs = JSON.stringify([...existingDocs, ...documents]);
    }
    
    // Mettre à jour le dossier
    const updated = await prisma.blockedDossier.update({
      where: { id },
      data: {
        ...updateData,
        auditLog: {
          create: {
            action: 'resolved',
            actorId,
            actorName,
            actorRole: actorRole || 'Décideur',
            summary: `Résolu via ${method}`,
            details: JSON.stringify({
              method,
              comment,
              substitutionHash: updateData.substitutionHash,
              substitutionRef: updateData.substitutionRef,
              delegationRef,
              documents: documents || [],
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
    // broadcastBlockedEvent('resolution', {
    //   dossier: updated,
    //   method,
    //   resolvedBy: actorName,
    // });
    
    // TODO: Send notifications to stakeholders
    // notifyBlockedResolution(updated, actorName);
    
    return NextResponse.json({
      success: true,
      message: `Dossier résolu avec succès via ${method}`,
      dossier: updated,
      auditHash: newHash,
    });
    
  } catch (error) {
    console.error('Error resolving blocked dossier:', error);
    return NextResponse.json(
      { error: 'Failed to resolve blocked dossier', details: String(error) },
      { status: 500 }
    );
  }
}

